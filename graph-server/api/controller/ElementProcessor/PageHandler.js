import { ElementHandler } from "./ElementHandler.js";

export class PageHandler extends ElementHandler {
    handle(child, parentId) {
        // Pages are typically handled at the parent level, but this could be used for nested pages
        const convertedId = this.convertId(child.id);
        const title = this.extractTitle(child);
        this.processor.addPage(convertedId, title);
    }

    /**
     * Extract title from page object
     */
    extractTitle(block) {
        if (block.object === 'page' && block.properties) {
            const titleProperty = Object.values(block.properties).find(
                prop => prop.type === 'title'
            );
            if (titleProperty && titleProperty.title && titleProperty.title[0]) {
                return titleProperty.title[0].plain_text || 'Untitled';
            }
        }
        return super.extractTitle(block);
    }
} 