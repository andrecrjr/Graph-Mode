import ElementProcessor from './ElementProcessor/index.js';
import logger from '../logs/index.js';

class StreamElementProcessor extends ElementProcessor {
    constructor(notionApi, sendEvent) {
        super(notionApi);
        this.sendEvent = sendEvent;
        this.processedCount = 0;
        this.seenElements = new Set(); // Track processed elements to avoid duplicates
    }

    /**
     * Process a child element and immediately stream it to the client
     * @param {Object} child - The child element to process
     * @param {String} parentId - The parent element ID
     * @param {Object} metadata - Additional metadata for the stream event
     * @returns {String|null} - The child ID if it has children
     */
    processChildAndStream(child, parentId, metadata = {}) {
        // Store the current element count to identify new elements
        const beforeCount = this.elements.length;

        // Process using the parent class logic
        const childId = this.processChild(child, parentId);

        // Get the latest state after the element was processed
        const currentElements = [...this.getElements()];

        // Find newly added elements since this processing step
        const newElements = currentElements.slice(beforeCount);

        // Track elements we've seen to avoid duplicates
        newElements.forEach(element => {
            const elementKey = element.type === 'node'
                ? `${element.source}:${element.target}`
                : element.id;
            this.seenElements.add(elementKey);
        });

        // Increment processed count
        this.processedCount++;

        // Only stream if we have a sendEvent function
        if (this.sendEvent && newElements.length > 0) {
            // Format the elements to match front-end graph data structure
            // This ensures data is compatible with processGraphData in the front-end
            this.sendEvent('element', {
                newElements,
                processedCount: this.processedCount,
                ...metadata
            });
        }

        return childId;
    }

    /**
     * Process parent and stream it
     * @param {Object} parent - The parent element to process
     */
    processParentAndStream(parent) {
        // Store the current element count to identify new elements
        const beforeCount = this.elements.length;

        super.processParent(parent);

        // Get all newly added elements
        const newElements = this.elements.slice(beforeCount);

        if (this.sendEvent && newElements.length > 0) {
            this.sendEvent('element', {
                elements: newElements,
                parent
            });
        }
    }

    /**
     * Send the complete current state of elements
     * @param {Object} metadata - Additional metadata to include
     */
    streamCompleteState(metadata = {}) {
        if (this.sendEvent) {
            const elements = this.getElements();

            // Format the elements to match front-end graph data structure
            // This ensures data sent from the server can be used directly by processGraphData
            const graphReadyData = {
                blocks: elements,
                tier: metadata.tier || 'free',
                isVip: metadata.isVip || false,
                requestCount: metadata.requestCount || 0,
                requestLimit: metadata.requestLimit || 1000,
                ...metadata
            };

            this.sendEvent('completeState', {
                elements: graphReadyData,
                processedCount: this.processedCount,
            });
        }
    }

    /**
     * Stream an error event
     * @param {Error} error - The error object
     * @param {String} context - Additional context about where the error occurred
     */
    streamError(error, context = '') {
        if (this.sendEvent) {
            this.sendEvent('error', {
                message: error.message,
                context,
                timestamp: new Date().toISOString()
            });
        }
        logger.error(`StreamElementProcessor error: ${error.message}`, { context, stack: error.stack });
    }
}

export default StreamElementProcessor; 