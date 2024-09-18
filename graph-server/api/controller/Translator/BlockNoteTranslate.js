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
        return this.convertNumberedListItem(block);
      case 'bulletListItem':
        return this.convertBulletedListItem(block);
      case 'code':
        return this.convertCode(block);
      case 'quote':
        return this.convertQuote(block);
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
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertBulletedListItem(block) {
    return {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  // Novo método para converter blocos de código
  convertCode(block) {
    return {
      object: 'block',
      type: 'code',
      code: {
        rich_text: this.convertContent(block.content),
        language: block.props.language || 'plain_text',
        color: block.props.textColor,
      }
    };
  }

  // Novo método para converter blocos de citação
  convertQuote(block) {
    return {
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertContent(content) {
    return content.flatMap(item => {
      if (item.type === 'link') {
        return this.convertLink(item);
      } else {
        return this.convertText(item);
      }
    });
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

  convertLink(item) {
    return item.content.map(subItem => ({
      type: 'text',
      text: {
        content: subItem.text,
        link: {
          url: item.href.startsWith('http') ? item.href : `https://${item.href}`
        }
      },
      annotations: this.convertStyles(subItem.styles || {})
    }));
  }

  convertStyles(styles) {
    return {
      bold: styles.bold || false,
      italic: styles.italic || false,
      underline: styles.underline || false,
      strikethrough: styles.strikethrough || false,
      code: styles.code || false,
      color: styles.textColor || 'default'
    };
  }
}

export default BlockNoteToNotionConverter;
