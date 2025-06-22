import ElementProcessor from "../ElementProcessor/index.js";
import logger from "../../logs/index.js";

/**
 * Rate-limited element processor with built-in socket communication
 */
export class RateLimitedElementProcessor extends ElementProcessor {
    /**
     * Create a new rate-limited processor
     * @param {Object} config - Configuration options
     */
    constructor({ socket, notionAPI, parentId, maxRequests }) {
        super(notionAPI, true);

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
        } else {
            console.log('addNode: source is null/undefined, no link created');
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