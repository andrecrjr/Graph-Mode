import dotenv from 'dotenv';
import { NotionAPI } from './services/notion.js';
import logger from '../logs/index.js';

dotenv.config();

const MAX_REQUEST_COUNT = parseInt(process.env.LIMIT_NOTION_REFRESH, 10) || 10;
const BATCH_SIZE = 2; // Reduced batch size for better control

async function processBatchWithLimit(items, processor, requestTracker, isVip) {
  const allResults = [];
  // Determine the batch size based on VIP status
  const effectiveBatchSize = isVip ? items.length : BATCH_SIZE;

  for (let i = 0; i < items.length && (isVip || requestTracker.count < MAX_REQUEST_COUNT); i += effectiveBatchSize) {
    const batch = items.slice(i, i + effectiveBatchSize);

    const batchResults = await Promise.all(
      batch.map(item => {
        if (isVip || requestTracker.count < MAX_REQUEST_COUNT) {
          return processor(item);
        }
        return null;
      })
    );

    allResults.push(...batchResults.filter(Boolean));

    if (!isVip && requestTracker.count >= MAX_REQUEST_COUNT) {
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
    const isVip = notionAPI.getIsVip();
    let nextCursor = null;

    while (isVip || requestTracker.count < MAX_REQUEST_COUNT) {

      // Fetch children blocks
      const { results, has_more, next_cursor } = await notionAPI.fetchBlockChildren(blockId, nextCursor);
      requestTracker.count++;

      await processBatchWithLimit(
        results,
        async (child) => {
          const childId = elementProcessor.processChild(child, parentId);
          if (childId && (isVip || requestTracker.count < MAX_REQUEST_COUNT)) {
            return fetchBlockChildrenRecursively(childId, notionAPI, elementProcessor, childId, requestTracker);
          }
          return null;
        },
        requestTracker,
        isVip
      );

      if (!isVip && requestTracker.count >= MAX_REQUEST_COUNT) {
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
