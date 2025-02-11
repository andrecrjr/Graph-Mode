import dotenv from 'dotenv';
import { NotionAPI } from './services/notion.js';
import logger from '../logs/index.js';

dotenv.config();

const MAX_REQUEST_COUNT = parseInt(process.env.LIMIT_NOTION_REFRESH, 10) || 10;
const BATCH_SIZE = 3; // Reduced batch size for better control

async function processBatchWithLimit(items, processor, requestTracker) {
  const allResults = [];
  
  for (let i = 0; i < items.length && requestTracker.count < MAX_REQUEST_COUNT; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(item => {
        if (requestTracker.count < MAX_REQUEST_COUNT) {
          return processor(item);
        }
        return null;
      })
    );

    allResults.push(...batchResults.filter(Boolean));

    if (requestTracker.count >= MAX_REQUEST_COUNT) {
      logger.warn(`Request limit ${MAX_REQUEST_COUNT} reached, stopping batch processing.`);
      break;
    }
  }

  return allResults;
}

async function fetchBlockChildrenRecursively(
  blockId,
  notionAPI,
  elementProcessor,
  parentId = null,
  requestTracker = { count: 0 }
) {
  try {
    let nextCursor = null;

    while (requestTracker.count < MAX_REQUEST_COUNT) {
      logger.info(`Making request ${requestTracker.count + 1}/${MAX_REQUEST_COUNT}`);

      // Fetch children blocks
      const { results, has_more, next_cursor } = await notionAPI.fetchBlockChildren(blockId, nextCursor);
      requestTracker.count++;

      logger.info(`Completed request ${requestTracker.count}/${MAX_REQUEST_COUNT}`);

      await processBatchWithLimit(
        results,
        async (child) => {
          const childId = elementProcessor.processChild(child, parentId);
          if (childId && requestTracker.count < MAX_REQUEST_COUNT) {
            return fetchBlockChildrenRecursively(childId, notionAPI, elementProcessor, childId, requestTracker);
          }
          return null;
        },
        requestTracker
      );

      if (requestTracker.count >= MAX_REQUEST_COUNT) {
        logger.warn(`Request limit ${MAX_REQUEST_COUNT} reached, stopping further processing.`);
        break;
      }

      nextCursor = next_cursor;
      if (!has_more) break;
    }

    return elementProcessor.getElements();
  } catch (error) {
    logger.error(`Error processing block ${blockId}: ${error.message}`);
    throw new Error(`Problem processing block ${blockId}`);
  }
}

export { NotionAPI, fetchBlockChildrenRecursively };
