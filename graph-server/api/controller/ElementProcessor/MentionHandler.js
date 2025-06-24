import { ElementHandler } from "./ElementHandler.js";

export class MentionHandler extends ElementHandler {
    handle(child, parentId) {
        // Handle different types of mentions
        if (child.type === 'mention') {
            this.handleMentionBlock(child, parentId);
        }
    }

    /**
     * Handle mention blocks that might contain page references
     */
    handleMentionBlock(mentionBlock, parentId) {
        if (mentionBlock.mention?.page?.id) {
            const mentionId = this.convertId(mentionBlock.mention.page.id);
            const convertedParentId = this.convertId(parentId);
            const mentionText = this.getMentionText(mentionBlock);

            this.processor.addPage(mentionId, mentionText);
            if (convertedParentId) {
                this.processor.addNode(convertedParentId, mentionId);
            }
        }
    }

    /**
     * Extract text from mention block
     */
    getMentionText(mentionBlock) {
        return mentionBlock.plain_text ||
            mentionBlock.mention?.page?.title ||
            'Mentioned Page';
    }

    /**
     * Extract title from mention block
     */
    extractTitle(block) {
        if (block.type === 'mention' && block.mention?.page) {
            return block.plain_text || block.mention.page.title || 'Mentioned Page';
        }
        return super.extractTitle(block);
    }

    /**
     * Check if a block is a page mention
     */
    isMentionPage(block) {
        return block.type === 'mention' &&
            block.mention?.page &&
            block.mention.page.id;
    }
} 