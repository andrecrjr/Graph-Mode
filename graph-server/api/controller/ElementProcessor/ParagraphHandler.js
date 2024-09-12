import { ElementHandler } from "./ElementHandler.js";

export class ParagraphHandler extends ElementHandler {
  handle(child, parentId) {
    child.paragraph.rich_text.forEach(textObject => {
      if (textObject.type === 'mention' && textObject.mention?.page) {
        const mentionId = textObject.mention.page.id;
        this.processor.addPage(mentionId, textObject.plain_text);
        this.processor.addNode(parentId, mentionId);
      }
    });
  }
}
