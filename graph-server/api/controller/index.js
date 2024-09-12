import dotenv from 'dotenv';
import { NotionAPI } from './services/notion.js';

dotenv.config();
  
async function fetchBlockChildrenRecursively(blockId, notionAPI, elementProcessor, parentId = null) {
  let hasMore = true;
  let nextCursor = null;

  while (hasMore) {
    const data = await notionAPI.fetchBlockChildren(blockId, nextCursor);
    nextCursor = data.next_cursor;
    hasMore = data.has_more;
    const childPromises = data.results.map(async (child) => {
      const childId = elementProcessor.processChild(child, parentId);
      if (childId) {
        return await fetchBlockChildrenRecursively(childId, notionAPI, elementProcessor, childId);
      }
    });

    await Promise.all(childPromises);
  }

  return elementProcessor.getElements();
}


export {NotionAPI, fetchBlockChildrenRecursively}