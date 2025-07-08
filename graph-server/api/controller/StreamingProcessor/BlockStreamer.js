import logger from '../../logs/index.js';
/**
 * Class to handle streaming blocks with proper limit handling
 */
export class BlockStreamer {
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
        // First, fetch the parent block itself (returns single block object, not results array)
        const parentBlock = await this.processor.fetchBlockChildren(
            this.blockId,
            null,
            false  // Don't fetch children, just the block itself
        );

        // Exit if limit reached during fetch
        if (this.processor.hasReachedLimit()) return;

        // Process the parent block properly using ElementProcessor
        if (parentBlock && parentBlock.id) {
            // Log parent block details for debugging
            logger.debug(`Processing parent block:`, {
                id: parentBlock.id,
                type: parentBlock.type,
                object: parentBlock.object,
                hasParagraphRichText: parentBlock.paragraph?.rich_text?.length > 0,
                hasChildPageTitle: parentBlock.child_page?.title,
                blockId: this.blockId
            });

            // Use the ElementProcessor to handle the block properly
            // This will correctly handle mentions, child_pages, and other block types
            this.processor.processParent(parentBlock);
        } else {
            // Fallback: if we can't fetch the parent block details, use the blockId
            logger.warn('Using blockId as fallback for parent:', this.blockId);
            this.processor.addPage(this.blockId, 'Parent Page');
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

        // For root level children, use the blockId as parentId to create parent-child links
        // For deeper levels, use this.parentId
        const parentIdForChild = this.options.currentDepth === 0 ? this.blockId : this.parentId;

        // Log block type for debugging mentions and other special cases
        if (child.type === 'mention' || child.type === 'child_page') {
            logger.debug(`Processing ${child.type} block:`, {
                id: child.id,
                type: child.type,
                parentId: parentIdForChild,
                mentionType: child.mention?.type,
                hasPageMention: child.mention?.page?.id ? true : false
            });
        }

        // Process the child
        const childId = this.processor.processChild(child, parentIdForChild);

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
