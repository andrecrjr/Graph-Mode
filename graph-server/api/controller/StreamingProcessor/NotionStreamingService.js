import { RateLimitedElementProcessor } from "./RateLimitProcessor.js";
import { BlockStreamer } from "./BlockStreamer.js";
import logger from "../../logs/index.js";
import SocketController from "../SocketController/index.js";

/**
 * Service class for handling Notion block data streaming
 */
export class NotionStreamingService {
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
                maxRequests: this.getRequestLimit(notionAPI),
                socketMode: true
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
