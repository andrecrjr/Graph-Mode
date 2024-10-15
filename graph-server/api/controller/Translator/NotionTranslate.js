class NotionToBlockNoteConverter {
  convert(notionBlocks) {
    return notionBlocks.map(block => this.convertBlock(block));
  }

  convertBlock(block) {
    switch (block.type) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        return this.convertHeading(block);
      case 'paragraph':
        return this.convertParagraph(block);
      default:
        throw new Error(`Unsupported block type: ${block.type}`);
    }
  }

  convertHeading(block) {
    const level = parseInt(block.type.split('_')[1], 10);
    
    return {
      id: this.generateId(),
      type: 'heading',
      props: {
        textColor: block[block.type].color || 'default',
        backgroundColor: 'default',
        textAlignment: 'left', 
        level: level
      },
      content: this.convertRichText(block[block.type].rich_text),
      children: []
    };
  }

  convertParagraph(block) {
    return {
      id: this.generateId(),
      type: 'paragraph',
      props: {
        textColor: block.paragraph.color || 'default',
        backgroundColor: 'default', 
        textAlignment: 'left' 
      },
      content: this.convertRichText(block.paragraph.rich_text),
      children: []
    };
  }

  convertRichText(richTextArray) {
    return richTextArray.map(richTextItem => ({
      type: 'text',
      text: richTextItem.text.content,
      styles: this.convertAnnotations(richTextItem.annotations)
    }));
  }

  convertAnnotations(annotations) {
    return {
      bold: annotations?.bold || false,
      italic: annotations?.italic || false,
      underline: annotations?.underline || false,
      strikethrough: annotations?.strikethrough || false,
      code: annotations?.code || false
    };
  }

  generateId() {
    return `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }
}
