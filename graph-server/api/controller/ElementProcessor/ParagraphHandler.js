import { ElementHandler } from "./ElementHandler.js";

export class ParagraphHandler extends ElementHandler {
  handle(child, parentId) {
    const richText = child.paragraph?.rich_text;
    if (!richText || !Array.isArray(richText)) {
      return;
    }


    let mentionCount = 0;
    richText.forEach(textObject => {
      if (this.isMentionPage(textObject)) {
        mentionCount++;
        this.handleMentionInText(textObject, parentId);
      }
    });

  }

  /**
   * Handle mentions found within paragraph text
   */
  handleMentionInText(textObject, parentId) {
    const mentionId = this.convertId(textObject.mention.page.id);
    const convertedParentId = this.convertId(parentId);
    const mentionText = textObject.plain_text || 'Mentioned Page';

    this.processor.addPage(mentionId, mentionText);
    if (convertedParentId) {
      this.processor.addNode(convertedParentId, mentionId);
    }
  }

  /**
   * Extract title from paragraph block
   */
  extractTitle(block) {
    if (block.type === 'paragraph' && block.paragraph?.rich_text) {
      const plainText = block.paragraph.rich_text
        .map(text => text.plain_text || '')
        .join('')
        .trim();
      return plainText || 'Paragraph';
    }
    return super.extractTitle(block);
  }

  /**
   * Check if text object is a page mention
   */
  isMentionPage(textObject) {
    return textObject.type === 'mention' &&
      textObject.mention?.page &&
      textObject.mention.page.id;
  }
}
