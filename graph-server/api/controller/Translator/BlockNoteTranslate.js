class BlockNoteToNotionConverter {
  convertCheckListItem(block) {
    return {
      object: 'block',
      type: 'to_do',
      to_do: {
        rich_text: this.convertContent(block.content),
        checked: block.props.checked || false,
        color: block.props.textColor,
      }
    };
  }

  convertToggle(block) {
    return {
      object: 'block',
      type: 'toggle',
      toggle: {
        rich_text: this.convertContent(block.content),
        color: block.props.textColor,
      }
    };
  }

  convertDivider(block) {
    return {
      object: 'block',
      type: 'divider',
    };
  }

  convertCallout(block) {
    return {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: this.convertContent(block.content),
        icon: {
          type: "emoji",
          emoji: block.props.icon || "ℹ️"
        },
        color: block.props.textColor,
      }
    };
  }

  convertImage(block) {
    return {
      object: 'block',
      type: 'image',
      image: {
        type: 'external',
        external: {
          url: block.props.url
        }
      }
    };
  }

  convertVideo(block) {
    return {
      object: 'block',
      type: 'video',
      video: {
        type: 'external',
        external: {
          url: block.props.url
        }
      }
    };
  }

  convertFile(block) {
    return {
      object: 'block',
      type: 'file',
      file: {
        type: 'external',
        external: {
          url: block.props.url
        }
      }
    };
  }

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
      case 'checkListItem':
        return this.convertCheckListItem(block);
      case 'toggle':  // Novo caso adicionado
        return this.convertToggle(block);
      case 'divider':  // Novo caso adicionado
        return this.convertDivider(block);
      case 'callout':  // Novo caso adicionado
        return this.convertCallout(block);
      case 'image':  // Novo caso adicionado
        return this.convertImage(block);
      case 'video':  // Novo caso adicionado
        return this.convertVideo(block);
      case 'file':  // Novo caso adicionado
        return this.convertFile(block);
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
      annotations: this.convertStyles(item.styles || {}),
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
      color: this.mapTextColor(styles.textColor, styles.backgroundColor)
    };
  }

  mapTextColor(textColor, backgroundColor) {
    const notionColors = {
      default: 'default',
      gray: 'gray',
      brown: 'brown',
      orange: 'orange',
      yellow: 'yellow',
      green: 'green',
      blue: 'blue',
      purple: 'purple',
      pink: 'pink',
      red: 'red',
      // Notion background colors use a suffix '_background'
      gray_background: 'gray_background',
      brown_background: 'brown_background',
      orange_background: 'orange_background',
      yellow_background: 'yellow_background',
      green_background: 'green_background',
      blue_background: 'blue_background',
      purple_background: 'purple_background',
      pink_background: 'pink_background',
      red_background: 'red_background'
    };

    if (backgroundColor && notionColors[`${backgroundColor}_background`]) {
      return `${backgroundColor}_background`;
    }

    return notionColors[textColor] || 'default';
  }
}

export default BlockNoteToNotionConverter;
