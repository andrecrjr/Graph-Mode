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

  convertDivider() {
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
          url: block.props.url,
        },
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
    console.log(block)
    return {
      object: 'block',
      type: 'file',
      file: {
        type: 'external',
        external: {
          url: block.props.url,
        }
      }
    };
  }

  convert(blockNoteBlocks) {
    return blockNoteBlocks.map(block => this.convertBlock(block));
  }

  convertTable(block) {
  const tableRows = block.content.rows.map((row) => ({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: row.cells.map(cell => this.convertContent(cell))
    }
  }));

  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: block.content.rows[0].cells.length,
      has_column_header: block.props.hasHeader || false, 
      has_row_header: block.props.hasRowHeader || false,
      children: tableRows
    }
  };
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
      case 'code': // existing case for a standard code block
      case 'codeBlock': // added case for your custom codeBlock
        return this.convertCode(block); 
      case 'quote':
        return this.convertQuote(block);
      case 'checkListItem':
        return this.convertCheckListItem(block);
      case 'toggle': 
        return this.convertToggle(block);
      case 'divider':
        return this.convertDivider(block);
      case 'callout': 
        return this.convertCallout(block);
      case 'image':
        return this.convertImage(block);
      case 'video': 
        return this.convertVideo(block);
      case 'file': 
        return this.convertFile(block);
      case 'table':
        return this.convertTable(block)
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
    console.log("code",block)
    return {
      object: 'block',
      type: 'code',
      code: {
        rich_text: this.convertContent([{...block.props, 
              type:block.type}]),
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

  convertPageMention(item) {
    return {
      type: 'mention',
      mention: {
        type: 'page',
        page: {
          id: item.props.id // O ID da página mencionada
        }
      },
      plain_text: item.props.label, // O texto a ser exibido
    };
  }

  convertContent(content) {
    return content.flatMap(item => {
      if (item.type === 'link') {
        return this.convertLink(item);
      } else if (item.type === 'pageMention') {
        return this.convertPageMention(item); // Novo caso adicionado para pageMention
      }else if(item.type === "codeBlock"){
        return this.convertCodeContent(item)
      }
      return this.convertText(item);
    });
  }

  convertCodeContent(item){
    return {
      type: 'text',
      text: {
        content: `${item.code}`
      },
    };
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
