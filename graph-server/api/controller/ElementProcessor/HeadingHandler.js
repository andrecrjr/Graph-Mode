import { ElementHandler } from "./ElementHandler.js";

export class HeadingHandler extends ElementHandler {
    handle(child, parentId) {
        // Headings typically don't create nodes by themselves,
        // but this could be extended if needed
    }

    /**
     * Extract title from heading blocks
     */
    extractTitle(block) {
        const headingTypes = ['heading_1', 'heading_2', 'heading_3'];

        for (const headingType of headingTypes) {
            if (block.type === headingType && block[headingType]?.rich_text) {
                const text = block[headingType].rich_text
                    .map(text => text.plain_text || '')
                    .join('')
                    .trim();
                return text || `${headingType.replace('_', ' ')}`;
            }
        }

        return super.extractTitle(block);
    }
} 