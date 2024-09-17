class BlockNoteToNotionConverter {
  convert(blockNoteBlocks) {
    return blockNoteBlocks.map(block => this.convertBlock(block));
  }

  convertBlock(block) {
    switch (block.type) {
      case 'heading':
        return this.convertHeading(block);
      case 'paragraph':
        return this.convertParagraph(block);
      case 'numberedListItem':
        return this.convertNumberedListItem(block); // Suporte para listas numeradas
      case 'bulletListItem':
        return this.convertBulletedListItem(block); // Suporte para listas com marcadores
      default:
        throw new Error(`Unsupported block type: ${block.type}`);
    }
  }

  convertHeading(block) {
    const headingLevel = Math.min(block.props.level || 1, 3);
    
    return {
      object: 'block',
      type: `heading_${headingLevel}`,
      [`heading_${headingLevel}`]: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertParagraph(block) {
    return {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertNumberedListItem(block) {
    return {
      object: 'block',
      type: 'numbered_list_item', // Converte para lista numerada
      numbered_list_item: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertBulletedListItem(block) {
    return {
      object: 'block',
      type: 'bulleted_list_item', // Converte para lista com marcadores (bullet list)
      bulleted_list_item: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertContent(content) {
    return content.map(item => this.convertText(item));
  }

  convertText(item) {
    return {
      type: 'text',
      text: {
        content: item.text
      },
      annotations: this.convertStyles(item.styles || {})
    };
  }

  convertStyles(styles) {
    return {
      bold: styles.bold || false,
      italic: styles.italic || false,
      underline: styles.underline || false,
      strikethrough: styles.strike || false,
      code: styles.code || false,
      color: styles.textColor || 'default'
    };
  }
}

export default BlockNoteToNotionConverter;
