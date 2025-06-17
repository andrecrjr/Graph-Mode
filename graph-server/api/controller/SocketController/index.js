import { Server } from 'socket.io';
import ElementProcessor from '../ElementProcessor/index.js';
import logger from '../../logs/index.js';
import socketAuthMiddleware from '../../middleware/socketAuthMiddleware.js';

/**
 * Socket.io server implementation for streaming Notion block data
 * 
 * This controller handles real-time streaming of Notion block data to clients,
 * with support for rate limiting, VIP users, and incremental updates.
 */
class SocketController {
    // Constants
    static MAX_REQUEST_COUNT = 5;

    constructor() {
        this.io = null;
    }

    /**
     * Initialize the Socket.io server
     * @param {Object} server - HTTP server instance
     * @returns {Object} The initialized io server instance
     */
    initServer(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CORS_ALLOWED_ORIGINS.split(","),
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Apply authentication middleware
        this.io.use(socketAuthMiddleware);

        // Register event handlers
        this.registerEventHandlers();

        return this.io;
    }

    /**
     * Register Socket.io event handlers
     */
    registerEventHandlers() {
        this.io.on('connection', (socket) => {
            const username = socket.handshake.query?.user || 'unknown';
            const userTier = socket.userTier || 'free';

            logger.info(`Client connected: ${socket.id}, user: ${username}, tier: ${userTier}`);

            // Initialize streaming service for this socket
            const streamingService = new NotionStreamingService(socket);

            // Handle block data request
            socket.on('fetchBlocks', async (data) => {
                await streamingService.handleFetchBlocks(data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });
        });
    }
}

/**
 * Service class for handling Notion block data streaming
 */
class NotionStreamingService {
    /**
     * Create a new streaming service for a socket
     * @param {Object} socket - Socket.io socket instance
     */
    constructor(socket) {
        this.socket = socket;
        this.processor = null;
    }

    /**
     * Process a fetch blocks request
     * @param {Object} data - Request data containing blockId
     */
    async handleFetchBlocks(data) {
        const { blockId } = data;

        // Use the socket's notionAPI instance from auth middleware
        const notionAPI = this.socket.notionAPI;

        if (!blockId) {
            this.emitError('Block ID is required');
            return;
        }

        if (!notionAPI) {
            this.emitError('Authentication required');
            return;
        }

        try {
            // Reset request tracking
            this.resetRequestTracking();

            // Initialize streaming process
            this.socket.emit('fetchStart', { blockId });

            // Create streaming manager if needed
            this.ensureProcessor(notionAPI);

            // Process the block hierarchy
            await this.streamBlocks(blockId, null, notionAPI);

            // Signal completion
            this.emitCompletion(blockId, notionAPI);
        } catch (error) {
            logger.error(`Error streaming block data: ${error.message}`, {
                blockId,
                socketId: this.socket.id
            });

            this.emitError(`Error fetching blocks: ${error.message}`);
        }
    }

    /**
     * Reset tracking data for a new request
     */
    resetRequestTracking() {
        this.socket.requestTracker = { count: 0 };
        this.socket.limitReachedSent = false;
    }

    /**
     * Ensure we have a processor instance
     * @param {Object} notionAPI - The Notion API instance
     */
    ensureProcessor(notionAPI) {
        if (!this.processor) {
            this.processor = new RateLimitedElementProcessor({
                socket: this.socket,
                notionAPI,
                parentId: null,
                maxRequests: this.getRequestLimit(notionAPI)
            });
        }
    }

    /**
     * Get the request limit based on user status
     * @param {Object} notionAPI - The Notion API instance
     * @returns {number} The request limit
     */
    getRequestLimit(notionAPI) {
        const isVip = notionAPI.getIsVip();
        return isVip
            ? Number.MAX_SAFE_INTEGER
            : (this.socket.requestLimit || SocketController.MAX_REQUEST_COUNT);
    }

    /**
     * Emit an error to the client
     * @param {string} message - Error message
     */
    emitError(message) {
        this.socket.emit('error', { message });
    }

    /**
     * Emit completion status to the client
     * @param {string} blockId - The block ID
     * @param {Object} notionAPI - The Notion API instance
     */
    emitCompletion(blockId, notionAPI) {
        this.socket.emit('fetchComplete', {
            blockId,
            metadata: {
                isVip: notionAPI.getIsVip(),
                tier: notionAPI.getUserTier(),
                requestCount: this.socket.requestTracker?.count || 0,
                requestLimit: this.socket.requestLimit ||
                    parseInt(process.env.LIMIT_NOTION_REFRESH) ||
                    SocketController.MAX_REQUEST_COUNT
            }
        });
    }

    /**
     * Stream blocks recursively
     * @param {string} blockId - The block ID to fetch
     * @param {string|null} parentId - The parent block ID
     * @param {Object} notionAPI - The Notion API instance
     * @param {Object} options - Additional options
     */
    async streamBlocks(blockId, parentId = null, notionAPI, options = {}) {
        const processingOptions = {
            maxDepth: 100,
            currentDepth: 0,
            skipTypes: [],
            ...options
        };

        // Create block streamer to handle the recursive traversal
        const blockStreamer = new BlockStreamer({
            socket: this.socket,
            processor: this.processor,
            blockId,
            parentId,
            notionAPI,
            options: processingOptions
        });

        await blockStreamer.process();
    }
}

/**
 * Class to handle streaming blocks with proper limit handling
 */
class BlockStreamer {
    /**
     * Create a new block streamer
     * @param {Object} config - Configuration
     */
    constructor({
        socket,
        processor,
        blockId,
        parentId,
        notionAPI,
        options
    }) {
        this.socket = socket;
        this.processor = processor;
        this.blockId = blockId;
        this.parentId = parentId;
        this.notionAPI = notionAPI;
        this.options = options;
        this.processedBlocks = 0;
        this.nextCursor = null;
    }

    /**
     * Process the block and its children
     */
    async process() {
        try {
            // Check recursion depth limit
            if (this.options.currentDepth >= this.options.maxDepth) {
                logger.warn(`Maximum recursion depth (${this.options.maxDepth}) reached for block ${this.blockId}`);
                return;
            }

            // Early exit if request limit already reached
            if (this.processor.hasReachedLimit()) {
                return;
            }

            // Process first parent if at top level
            if (this.options.currentDepth === 0) {
                await this.processParentBlock();
            }

            // Stream children recursively with pagination
            await this.processChildrenWithPagination();

        } catch (error) {
            this.handleStreamingError(error);
        }
    }

    /**
     * Process the parent block
     */
    async processParentBlock() {
        // First, fetch the parent block itself
        const parentBlock = await this.processor.fetchBlockChildren(
            this.blockId,
            null,
            false  // Don't fetch children, just the block itself
        );

        // Exit if limit reached during fetch
        if (this.processor.hasReachedLimit()) return;

        // Add the parent block as a page
        if (parentBlock && parentBlock.id) {
            const parentTitle = this.getBlockTitle(parentBlock);
            this.processor.addPage(parentBlock.id, parentTitle);
        }

        // Emit the parent page immediately
        const initialElements = this.processor.getNewElements();
        if (initialElements.length > 0) {
            this.processor.safeEmit('blockData', {
                elements: initialElements,
                parentId: null,
                batchId: 'parent'
            });
        }
    }

    /**
     * Extract title from a block object
     * @param {Object} block - The block object
     * @returns {string} The block title
     */
    getBlockTitle(block) {
        if (!block) return 'Untitled';

        // For pages, try to get the title from properties
        if (block.object === 'page' && block.properties) {
            const titleProperty = Object.values(block.properties).find(
                prop => prop.type === 'title'
            );
            if (titleProperty && titleProperty.title && titleProperty.title[0]) {
                return titleProperty.title[0].plain_text || 'Untitled';
            }
        }

        // For blocks, try to get title from child_page
        if (block.type === 'child_page' && block.child_page) {
            return block.child_page.title || 'Untitled';
        }

        // Fallback to block id or 'Untitled'
        return block.id || 'Untitled';
    }

    /**
     * Process all children with pagination support
     */
    async processChildrenWithPagination() {
        // Loop until we reach the limit, lose connection, or complete pagination
        while (!this.processor.hasReachedLimit() && this.socket.connected) {
            try {
                const batchResult = await this.processNextBatch();
                if (!batchResult) break;
            } catch (batchError) {
                this.handleBatchError(batchError);
                break;
            }
        }
    }

    /**
     * Process the next batch of children
     * @returns {boolean} Whether to continue processing
     */
    async processNextBatch() {
        // Fetch next batch of children
        const { results, has_more, next_cursor } =
            await this.processor.fetchBlockChildren(this.blockId, this.nextCursor);

        // Exit if limit reached during fetch
        if (this.processor.hasReachedLimit()) return false;

        this.processedBlocks += results.length;

        // Track the batch ID for this set of results
        const batchId = `${this.blockId}-${this.processedBlocks}`;

        // Process each child in the batch
        await this.processChildren(results, batchId);

        // Update cursor for pagination
        this.nextCursor = next_cursor;

        // Continue if there are more results and we haven't hit limits
        return has_more && !this.processor.hasReachedLimit();
    }

    /**
     * Process a batch of children
     * @param {Array} children - The children blocks to process
     * @param {string} batchId - Batch identifier
     */
    async processChildren(children, batchId) {
        for (const child of children) {
            try {
                await this.processChild(child, batchId);

                // Exit if limit reached during processing
                if (this.processor.hasReachedLimit()) break;
            } catch (childError) {
                this.handleChildError(child, childError);
            }
        }
    }

    /**
     * Process a single child block
     * @param {Object} child - The child block to process
     * @param {string} batchId - Batch identifier
     */
    async processChild(child, batchId) {
        // Stop processing if limit reached
        if (this.processor.hasReachedLimit()) return;

        // Skip processing for types we want to ignore
        if (this.options.skipTypes.includes(child.type)) return;

        // Process the child
        const childId = this.processor.processChild(child, this.parentId);

        // Get and emit new elements if any were added
        const newElements = this.processor.getNewElements();
        if (newElements.length > 0) {
            this.processor.safeEmit('blockData', {
                elements: newElements,
                parentId: this.parentId,
                batchId
            });
        }

        // Recursively process child's children if needed
        await this.processChildRecursively(childId);
    }

    /**
     * Process a child's children recursively
     * @param {string} childId - The child ID to process
     */
    async processChildRecursively(childId) {
        // Only recurse if we have a valid childId and haven't hit limits
        if (!childId || this.processor.hasReachedLimit() || !this.socket.connected) return;

        // Create options for next level
        const nextOptions = {
            ...this.options,
            currentDepth: this.options.currentDepth + 1
        };

        // Create child streamer and process
        const childStreamer = new BlockStreamer({
            socket: this.socket,
            processor: this.processor,
            blockId: childId,
            parentId: childId,
            notionAPI: this.notionAPI,
            options: nextOptions
        });

        await childStreamer.process();
    }

    /**
     * Handle a batch processing error
     * @param {Error} error - The error that occurred
     */
    handleBatchError(error) {
        logger.error(`Error processing batch for block ${this.blockId}`, {
            error: error.message,
            parentId: this.parentId,
            nextCursor: this.nextCursor,
        });

        this.processor.safeEmit('batchError', {
            message: `Error processing batch: ${error.message}`,
            blockId: this.blockId,
            parentId: this.parentId
        });
    }

    /**
     * Handle a child processing error
     * @param {Object} child - The child that caused the error
     * @param {Error} error - The error that occurred
     */
    handleChildError(child, error) {
        logger.error(`Error processing child ${child.id || 'unknown'} of block ${this.blockId}`, {
            error: error.message,
            parentId: this.parentId,
            blockId: child.id,
        });
    }

    /**
     * Handle a general streaming error
     * @param {Error} error - The error that occurred
     */
    handleStreamingError(error) {
        logger.error(`Error processing block ${this.blockId}`, {
            error: error.message,
            stack: error.stack,
            parentId: this.parentId,
            depth: this.options.currentDepth,
        });

        this.processor.safeEmit('error', {
            message: `Problem processing block ${this.blockId}: ${error.message}`,
            blockId: this.blockId,
            parentId: this.parentId
        });
    }
}

/**
 * Rate-limited element processor with built-in socket communication
 */
class RateLimitedElementProcessor extends ElementProcessor {
    /**
     * Create a new rate-limited processor
     * @param {Object} config - Configuration options
     */
    constructor({ socket, notionAPI, parentId, maxRequests }) {
        super(notionAPI);

        this.socket = socket;
        this.notionAPI = notionAPI;
        this.parentId = parentId;
        this.previousElementCount = 0;
        this.isVip = notionAPI.getIsVip();
        this.requestLimit = maxRequests;
    }

    /**
     * Check if the request limit has been reached
     * @returns {boolean} Whether the limit has been reached
     */
    hasReachedLimit() {
        if (!this.socket || !this.socket.connected) return true;

        return !this.isVip && this.socket.requestTracker.count >= this.requestLimit;
    }

    /**
     * Safely emit messages only if under limits
     * @param {string} eventName - The event name to emit
     * @param {Object} data - The data to send
     * @returns {boolean} Whether the emission was successful
     */
    safeEmit(eventName, data) {
        if (!this.socket || !this.socket.connected) return false;

        if (this.hasReachedLimit()) {
            if (!this.socket.limitReachedSent) {
                logger.warn(`Request limit ${this.requestLimit} reached for socket ${this.socket.id}`);

                this.socket.emit('limitReached', {
                    message: 'Request limit reached',
                    requestCount: this.socket.requestTracker.count,
                    requestLimit: this.requestLimit
                });

                this.socket.limitReachedSent = true;
            }
            return false;
        }

        this.socket.emit(eventName, data);
        return true;
    }

    /**
     * Increment request counter and check limit
     * @returns {boolean} Whether under the limit after incrementing
     */
    incrementRequestCount() {
        this.socket.requestTracker.count++;

        if (this.hasReachedLimit() && !this.socket.limitReachedSent) {
            logger.warn(`Request limit ${this.requestLimit} reached for socket ${this.socket.id}`);

            this.socket.emit('limitReached', {
                message: 'Request limit reached',
                requestCount: this.socket.requestTracker.count,
                requestLimit: this.requestLimit
            });

            this.socket.limitReachedSent = true;
            return false;
        }

        return !this.hasReachedLimit();
    }

    /**
     * Execute a Notion API request with rate limiting
     * @param {string} blockId - The block ID to fetch
     * @param {string|null} cursor - Pagination cursor
     * @param {boolean} includeFirstParent - Whether to include the first parent
     * @returns {Object} The API response
     */
    async fetchBlockChildren(blockId, cursor = null, includeFirstParent = true) {
        if (this.hasReachedLimit()) {
            return { results: [], has_more: false };
        }

        try {
            const result = await this.notionAPI.fetchBlockChildren(
                blockId,
                cursor,
                includeFirstParent
            );

            this.incrementRequestCount();
            return result;
        } catch (error) {
            logger.error(`Error fetching block children: ${error.message}`);
            throw error;
        }
    }

    /**
     * Override addPage to emit immediately with rate limit check
     * @param {string} id - Page ID
     * @param {string} label - Page label
     * @returns {Object|null} The created element or null
     */
    addPage(id, label) {
        if (this.hasReachedLimit()) return null;

        const isFirstParent = !this.elements.some(e => e.type === 'page');
        if (!this.elements.some(e => e.id === id && e.type === 'page')) {
            const newElement = {
                id,
                label,
                type: 'page',
                firstParent: isFirstParent
            };

            this.elements.push(newElement);
            this.firstParent = false;

            this.safeEmit('newElement', {
                element: newElement,
                parentId: this.parentId
            });

            return newElement;
        }
        return null;
    }

    /**
     * Override addNode to emit immediately with rate limit check
     * @param {string} source - Source node ID
     * @param {string} target - Target node ID
     * @returns {Object|null} The created element or null
     */
    addNode(source, target) {
        if (this.hasReachedLimit()) return null;

        if (source) {
            const newElement = { source, target, type: 'node' };
            this.elements.push(newElement);

            this.safeEmit('newElement', {
                element: newElement,
                parentId: this.parentId
            });

            return newElement;
        }
        return null;
    }

    /**
     * Get only new elements since last call, respecting rate limits
     * @returns {Array} New elements
     */
    getNewElements() {
        if (this.hasReachedLimit()) return [];

        const newElements = this.elements.slice(this.previousElementCount);
        this.previousElementCount = this.elements.length;
        return newElements;
    }
}

// Create controller instance
const socketController = new SocketController();

// Export public methods
export function initSocketServer(server) {
    return socketController.initServer(server);
}

export default {
    initSocketServer
};
