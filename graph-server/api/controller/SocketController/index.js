import { Server } from 'socket.io';
import ElementProcessor from '../ElementProcessor/index.js';
import logger from '../../logs/index.js';
import socketAuthMiddleware from '../../middleware/socketAuthMiddleware.js';
let io;

// Constants
const MAX_REQUEST_COUNT = 5;

// Helper function to process a batch of blocks with rate limiting
async function processBatchWithLimit(batch, processor, requestTracker, isVip, userTier) {
    const processingPromises = batch.map(async (item) => {
        try {
            return await processor(item);
        } catch (error) {
            logger.error(`Error processing batch item: ${error.message}`);
            return null;
        }
    });

    return Promise.all(processingPromises);
}

export function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ALLOWED_ORIGINS.split(","),
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Apply socket authentication middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}, user: ${socket.handshake.query?.user || 'unknown'}, tier: ${socket.userTier || 'free'}`);

        // Handle block data request
        socket.on('fetchBlocks', async (data) => {
            const { blockId } = data;

            // Use the socket's notionAPI instance from auth middleware
            const notionAPI = socket.notionAPI;

            if (!blockId) {
                socket.emit('error', { message: 'Block ID is required' });
                return;
            }

            if (!notionAPI) {
                socket.emit('error', { message: 'Authentication required' });
                return;
            }

            try {
                // Initialize streaming process
                socket.emit('fetchStart', { blockId });

                await streamBlockChildrenRecursively(socket, blockId, notionAPI);

                // Signal completion
                socket.emit('fetchComplete', {
                    blockId,
                    metadata: {
                        isVip: notionAPI.getIsVip(),
                        tier: notionAPI.getUserTier(),
                        requestCount: socket.requestTracker?.count || 0,
                        requestLimit: socket.requestLimit || parseInt(process.env.LIMIT_NOTION_REFRESH) || 5
                    }
                });
            } catch (error) {
                logger.error(`Error streaming block data: ${error.message}`, { blockId, socketId: socket.id });
                socket.emit('error', { message: `Error fetching blocks: ${error.message}` });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

export async function streamBlockChildrenRecursively(
    socket,
    blockId,
    notionAPI,
    parentId = null,
    options = {}
) {
    // Initialize request tracker if not already present
    if (!socket.requestTracker) {
        socket.requestTracker = { count: 0 };
    }

    // Create a custom ElementProcessor that emits elements as they're processed
    class StreamingElementProcessor extends ElementProcessor {
        constructor(notionApi) {
            super(notionApi);
            this.previousElementCount = 0;
        }

        // Override addPage to emit immediately
        addPage(id, label) {
            const isFirstParent = !this.elements.some(e => e.type === 'page');
            if (!this.elements.some(e => e.id === id && e.type === 'page')) {
                const newElement = { id, label, type: 'page', firstParent: isFirstParent };
                this.elements.push(newElement);
                this.firstParent = false;

                // Emit the new page element
                socket.emit('newElement', {
                    element: newElement,
                    parentId
                });
            }
        }

        // Override addNode to emit immediately
        addNode(source, target) {
            if (source) {
                const newElement = { source, target, type: 'node' };
                this.elements.push(newElement);

                // Emit the new node connection
                socket.emit('newElement', {
                    element: newElement,
                    parentId
                });
            }
        }

        // Get only new elements since last call
        getNewElements() {
            const newElements = this.elements.slice(this.previousElementCount);
            this.previousElementCount = this.elements.length;
            return newElements;
        }
    }

    // Initialize StreamingElementProcessor if not provided
    if (!socket.elementProcessor) {
        socket.elementProcessor = new StreamingElementProcessor(notionAPI);
    }

    // Default options
    const {
        maxDepth = 100,                // Maximum recursion depth
        currentDepth = 0,              // Current recursion depth 
        skipTypes = []                 // Block types to skip recursion on
    } = options;

    try {
        // Check recursion depth limit
        if (currentDepth >= maxDepth) {
            logger.warn(`Maximum recursion depth (${maxDepth}) reached for block ${blockId}`);
            return;
        }

        // Get user tier information
        const isVip = notionAPI.getIsVip();
        const userTier = notionAPI.getUserTier();
        let nextCursor = null;
        let processedBlocks = 0;

        // Determine request limit based on VIP status
        const requestLimit = isVip ? Number.MAX_SAFE_INTEGER : MAX_REQUEST_COUNT;

        // Process first parent if currentDepth is 0
        if (currentDepth === 0) {
            const firstParent = await notionAPI.fetchBlockChildren(blockId, false, false);
            socket.requestTracker.count++;

            socket.elementProcessor.processParent(firstParent);

            // Emit the parent page immediately
            const initialElements = socket.elementProcessor.getNewElements();
            if (initialElements.length > 0) {
                socket.emit('blockData', {
                    elements: initialElements,
                    parentId: null,
                    batchId: 'parent'
                });
            }
        }

        // Stream children recursively with pagination
        while (socket.requestTracker.count < requestLimit && socket.connected) {
            try {
                // Fetch children blocks
                const { results, has_more, next_cursor } = await notionAPI.fetchBlockChildren(blockId, nextCursor);
                socket.requestTracker.count++;
                processedBlocks += results.length;

                // Track the batch ID for this set of results
                const batchId = `${blockId}-${processedBlocks}`;

                // Process results individually with rate limiting
                await processBatchWithLimit(
                    results,
                    async (child) => {
                        try {
                            // Skip processing for types we want to ignore
                            if (skipTypes.includes(child.type)) {
                                return null;
                            }

                            // Store the current element count to detect new elements
                            const beforeCount = socket.elementProcessor.elements.length;

                            // Process the child
                            const childId = socket.elementProcessor.processChild(child, parentId);

                            // Get and emit new elements if any were added
                            const newElements = socket.elementProcessor.getNewElements();
                            if (newElements.length > 0) {
                                socket.emit('blockData', {
                                    elements: newElements,
                                    parentId,
                                    batchId
                                });
                            }

                            // Only recurse if we have a valid childId and haven't hit limits
                            if (childId && socket.requestTracker.count < requestLimit && socket.connected) {
                                // Critical pre-check: Don't start recursive calls that would exceed limit
                                if (!isVip && socket.requestTracker.count >= requestLimit - 1) {
                                    logger.warn(`Request limit ${requestLimit} would be exceeded by recursion, stopping at depth ${currentDepth}`);
                                    return null;
                                }

                                // Pass the same options to next level, incrementing depth
                                const nextOptions = {
                                    ...options,
                                    currentDepth: currentDepth + 1
                                };

                                await streamBlockChildrenRecursively(
                                    socket,
                                    childId,
                                    notionAPI,
                                    childId,
                                    nextOptions
                                );
                            }
                            return null;
                        } catch (childError) {
                            logger.error(`Error processing child ${child.id || 'unknown'} of block ${blockId}`, {
                                error: childError.message,
                                parentId,
                                blockId: child.id,
                            });
                            return null; // Continue with other children despite errors
                        }
                    },
                    socket.requestTracker,
                    isVip,
                    userTier
                );

                // Check rate limits after processing batch
                if (!isVip && socket.requestTracker.count >= MAX_REQUEST_COUNT) {
                    logger.warn(`Request limit ${MAX_REQUEST_COUNT} reached at depth ${currentDepth}, stopping further processing for block ${blockId}`);

                    socket.emit('limitReached', {
                        message: 'Request limit reached',
                        requestCount: socket.requestTracker.count,
                        requestLimit
                    });

                    break;
                }

                // Check for pagination
                nextCursor = next_cursor;
                if (!has_more) break;
            } catch (batchError) {
                logger.error(`Error processing batch for block ${blockId}`, {
                    error: batchError.message,
                    parentId,
                    nextCursor,
                });

                socket.emit('batchError', {
                    message: `Error processing batch: ${batchError.message}`,
                    blockId,
                    parentId
                });

                // Don't throw - continue with what we have so far
                break;
            }
        }

    } catch (error) {
        logger.error(`Error processing block ${blockId}`, {
            error: error.message,
            stack: error.stack,
            parentId,
            depth: currentDepth,
        });

        socket.emit('error', {
            message: `Problem processing block ${blockId}: ${error.message}`,
            blockId,
            parentId
        });
    }
}

export default {
    initSocketServer,
    streamBlockChildrenRecursively
};
