
export function removeFirstHeading(blocks) {

  const headingIndex = blocks.findIndex(block => block.type.startsWith('heading'));
  if (headingIndex !== -1) {
    return [
      ...blocks.slice(0, headingIndex),
      ...blocks.slice(headingIndex + 1)
    ];
  }

  return blocks;
}

export function getTitleFromHeading(blocks) {
  const headingBlock = blocks.find(block => block.type.startsWith('heading'));

  if (headingBlock) {
    const richText = headingBlock[headingBlock.type].rich_text;
    return richText.map(textItem => textItem.text.content).join(' ');
  }

  return null;
}
