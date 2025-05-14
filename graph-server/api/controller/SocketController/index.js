import { Server } from 'socket.io';
import ElementProcessor from '../ElementProcessor/index.js';
import logger from '../../logs/index.js';
import socketAuthMiddleware from '../../middleware/socketAuthMiddleware.js';
let io;

// Constants
const MAX_REQUEST_COUNT = 5;



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
                // Reset request tracker for new fetch
                socket.requestTracker = { count: 0 };
                socket.limitReachedSent = false;

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

    // Rate limiting helper functions - define these before the class to avoid scoping issues
    const isVip = notionAPI.getIsVip();
    const requestLimit = isVip ? Number.MAX_SAFE_INTEGER : (socket.requestLimit || MAX_REQUEST_COUNT);

    // Function to check if request limit has been reached
    function checkRequestLimit() {
        return !isVip && socket.requestTracker.count >= requestLimit;
    }

    // Function to safely emit messages only if under limits
    function safeEmit(eventName, data) {
        if (!socket || !socket.connected) return false;

        if (checkRequestLimit()) {
            if (!socket.limitReachedSent) {
                logger.warn(`Request limit ${requestLimit} reached for socket ${socket.id}`);

                socket.emit('limitReached', {
                    message: 'Request limit reached',
                    requestCount: socket.requestTracker.count,
                    requestLimit
                });

                socket.limitReachedSent = true;
            }
            return false;
        }

        socket.emit(eventName, data);
        return true;
    }

    // Function to increment request counter and check limit
    function incrementRequestCount() {
        socket.requestTracker.count++;

        // Notify on first limit reached
        if (checkRequestLimit() && !socket.limitReachedSent) {
            logger.warn(`Request limit ${requestLimit} reached for socket ${socket.id}`);

            socket.emit('limitReached', {
                message: 'Request limit reached',
                requestCount: socket.requestTracker.count,
                requestLimit
            });

            socket.limitReachedSent = true;
            return false;
        }

        return !checkRequestLimit();
    }

    // Create a custom ElementProcessor that handles rate limits internally
    class RateLimitedElementProcessor extends ElementProcessor {
        constructor(notionApi) {
            super(notionApi);
            this.previousElementCount = 0;
            this.isVip = notionApi.getIsVip();
            this.requestLimit = this.isVip ? Number.MAX_SAFE_INTEGER : (socket.requestLimit || MAX_REQUEST_COUNT);
        }

        // Method to check if we've reached the limit
        hasReachedLimit() {
            return checkRequestLimit();
        }

        // Override addPage to emit immediately with rate limit check
        addPage(id, label) {
            if (this.hasReachedLimit()) return null;

            const isFirstParent = !this.elements.some(e => e.type === 'page');
            if (!this.elements.some(e => e.id === id && e.type === 'page')) {
                const newElement = { id, label, type: 'page', firstParent: isFirstParent };
                this.elements.push(newElement);
                this.firstParent = false;

                // Safely emit the new page element
                safeEmit('newElement', {
                    element: newElement,
                    parentId
                });

                return newElement;
            }
            return null;
        }

        // Override addNode to emit immediately with rate limit check
        addNode(source, target) {
            if (this.hasReachedLimit()) return null;

            if (source) {
                const newElement = { source, target, type: 'node' };
                this.elements.push(newElement);

                // Safely emit the new node connection
                safeEmit('newElement', {
                    element: newElement,
                    parentId
                });

                return newElement;
            }
            return null;
        }

        // Get only new elements since last call, respecting rate limits
        getNewElements() {
            if (this.hasReachedLimit()) return [];

            const newElements = this.elements.slice(this.previousElementCount);
            this.previousElementCount = this.elements.length;
            return newElements;
        }

        // Execute a block children API request with rate limiting
        async fetchBlockChildren(blockId, cursor = null, includeFirstParent = true) {
            if (this.hasReachedLimit()) return { results: [], has_more: false };

            try {
                // Make the API call
                const result = await notionAPI.fetchBlockChildren(blockId, cursor, includeFirstParent);

                // Increment counter and check if limit is reached
                incrementRequestCount();

                return result;
            } catch (error) {
                logger.error(`Error fetching block children: ${error.message}`);
                throw error;
            }
        }
    }

    // Initialize RateLimitedElementProcessor if not provided
    if (!socket.elementProcessor || !(socket.elementProcessor instanceof RateLimitedElementProcessor)) {
        socket.elementProcessor = new RateLimitedElementProcessor(notionAPI);
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

        // Early exit if request limit already reached
        if (socket.elementProcessor.hasReachedLimit()) {
            return;
        }

        let nextCursor = null;
        let processedBlocks = 0;

        // Process first parent if currentDepth is 0
        if (currentDepth === 0) {
            // Fetch with integrated rate limiting
            const firstParent = await socket.elementProcessor.fetchBlockChildren(blockId, false, false);

            // Exit if limit reached during fetch
            if (socket.elementProcessor.hasReachedLimit()) return;

            socket.elementProcessor.processParent(firstParent);

            // Emit the parent page immediately
            const initialElements = socket.elementProcessor.getNewElements();
            if (initialElements.length > 0) {
                safeEmit('blockData', {
                    elements: initialElements,
                    parentId: null,
                    batchId: 'parent'
                });
            }
        }

        // Stream children recursively with pagination
        while (!socket.elementProcessor.hasReachedLimit() && socket.connected) {
            try {
                // Fetch children blocks with rate limiting
                const { results, has_more, next_cursor } = await socket.elementProcessor.fetchBlockChildren(blockId, nextCursor);

                // Exit if limit reached during fetch
                if (socket.elementProcessor.hasReachedLimit()) return;

                processedBlocks += results.length;

                // Track the batch ID for this set of results
                const batchId = `${blockId}-${processedBlocks}`;

                // Process results individually with rate limiting
                for (const child of results) {
                    try {
                        // Stop processing if limit reached
                        if (socket.elementProcessor.hasReachedLimit()) {
                            break;
                        }

                        // Skip processing for types we want to ignore
                        if (skipTypes.includes(child.type)) {
                            continue;
                        }

                        // Process the child
                        const childId = socket.elementProcessor.processChild(child, parentId);

                        // Get and emit new elements if any were added
                        const newElements = socket.elementProcessor.getNewElements();
                        if (newElements.length > 0) {
                            safeEmit('blockData', {
                                elements: newElements,
                                parentId,
                                batchId
                            });
                        }

                        // Only recurse if we have a valid childId and haven't hit limits
                        if (childId && !socket.elementProcessor.hasReachedLimit() && socket.connected) {
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

                            // Exit if limit reached during recursion
                            if (socket.elementProcessor.hasReachedLimit()) {
                                break;
                            }
                        }
                    } catch (childError) {
                        logger.error(`Error processing child ${child.id || 'unknown'} of block ${blockId}`, {
                            error: childError.message,
                            parentId,
                            blockId: child.id,
                        });
                        continue; // Continue with other children despite errors
                    }
                }

                // Check for pagination
                nextCursor = next_cursor;
                if (!has_more || socket.elementProcessor.hasReachedLimit()) break;
            } catch (batchError) {
                logger.error(`Error processing batch for block ${blockId}`, {
                    error: batchError.message,
                    parentId,
                    nextCursor,
                });

                safeEmit('batchError', {
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

        safeEmit('error', {
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
