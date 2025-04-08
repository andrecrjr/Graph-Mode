import dotenv from 'dotenv';
import { NotionAPI } from './services/notion.js';
import logger from '../logs/index.js';
import { ACCOUNT_TIERS } from '../middleware/vipMiddleware.js';

dotenv.config();

// Default request limits based on environment variables
const MAX_REQUEST_COUNT = parseInt(process.env.LIMIT_NOTION_REFRESH, 10) || 10;

// Define batch sizes based on account tier
const BATCH_SIZES = {
  [ACCOUNT_TIERS.FREE]: 2,
  [ACCOUNT_TIERS.PREMIUM]: 5,
  [ACCOUNT_TIERS.LIFETIME]: 10
};

/**
 * Process items in batches with different rate limits based on user tier
 */
async function processBatchWithLimit(items, processor, requestTracker, isVip, userTier = ACCOUNT_TIERS.FREE) {
  const allResults = [];

  // Determine the batch size based on user tier
  const effectiveBatchSize = isVip ?
    BATCH_SIZES[userTier] || BATCH_SIZES[ACCOUNT_TIERS.PREMIUM] :
    BATCH_SIZES[ACCOUNT_TIERS.FREE];

  // Determine request limit based on VIP status
  const requestLimit = isVip ? Number.MAX_SAFE_INTEGER : MAX_REQUEST_COUNT;

  // Log batch processing info
  logger.debug(`Processing batch with size ${effectiveBatchSize}, tier: ${userTier}, isVip: ${isVip}`);

  for (let i = 0; i < items.length && requestTracker.count < requestLimit; i += effectiveBatchSize) {
    const batch = items.slice(i, i + effectiveBatchSize);

    const batchResults = await Promise.all(
      batch.map(item => {
        if (requestTracker.count < requestLimit) {
          return processor(item);
        }
        return null;
      })
    );

    allResults.push(...batchResults.filter(Boolean));

    if (!isVip && requestTracker.count >= MAX_REQUEST_COUNT) {
      logger.warn(`Request limit ${MAX_REQUEST_COUNT} reached for free user, stopping batch processing.`);
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
  requestTracker = { count: 0 },
  options = {}
) {
  // Input validation
  if (!blockId) {
    throw new Error('Block ID is required');
  }
  if (!notionAPI) {
    throw new Error('Notion API instance is required');
  }
  if (!elementProcessor) {
    throw new Error('Element processor is required');
  }

  // Default options
  const {
    maxDepth = 100,                // Maximum recursion depth
    currentDepth = 0,              // Current recursion depth 
    abortSignal = null,            // For cancellation
    skipTypes = [],                // Block types to skip recursion on
    enableMetrics = false          // Enable performance metrics
  } = options;

  // Performance tracking
  const startTime = enableMetrics ? performance.now() : 0;

  try {
    // Check recursion depth limit
    if (currentDepth >= maxDepth) {
      logger.warn(`Maximum recursion depth (${maxDepth}) reached for block ${blockId}`);
      return [];
    }

    // Check for abort signal
    if (abortSignal?.aborted) {
      logger.info('Processing aborted by user request');
      return [];
    }

    const isVip = notionAPI.getIsVip();
    const userTier = notionAPI.getUserTier();
    let nextCursor = null;
    let processedBlocks = 0;

    // Determine request limit based on VIP status
    const requestLimit = isVip ? Number.MAX_SAFE_INTEGER : MAX_REQUEST_COUNT;

    while (requestTracker.count < requestLimit && !abortSignal?.aborted) {
      try {
        // Fetch children blocks
        const { results, has_more, next_cursor } = await notionAPI.fetchBlockChildren(blockId, nextCursor);
        requestTracker.count++;
        processedBlocks += results.length;

        // Process results in batches with rate limiting
        await processBatchWithLimit(
          results,
          async (child) => {
            try {
              // Skip processing for types we want to ignore
              if (skipTypes.includes(child.type)) {
                return null;
              }

              const childId = elementProcessor.processChild(child, parentId);

              // Only recurse if we have a valid childId and haven't hit limits
              if (childId && requestTracker.count < requestLimit && !abortSignal?.aborted) {
                // Pass the same options to next level, incrementing depth
                const nextOptions = {
                  ...options,
                  currentDepth: currentDepth + 1,
                };

                return fetchBlockChildrenRecursively(
                  childId,
                  notionAPI,
                  elementProcessor,
                  childId,
                  requestTracker,
                  nextOptions
                );
              }
              return null;
            } catch (childError) {
              logger.error(`Error processing child ${child.id || 'unknown'} of block ${blockId}`, {
                error: childError.message,
                parentId,
                blockId: child.id,
              });
              return null; // Continue with other children despite errors
            }
          },
          requestTracker,
          isVip,
          userTier // Pass the userTier to processBatchWithLimit
        );

        // Check rate limits after processing batch
        if (!isVip && requestTracker.count >= MAX_REQUEST_COUNT) {
          logger.warn(`Request limit ${MAX_REQUEST_COUNT} reached at depth ${currentDepth}, stopping further processing for block ${blockId}`);
          break;
        }

        // Check for pagination
        nextCursor = next_cursor;
        if (!has_more) break;
      } catch (batchError) {
        logger.error(`Error processing batch for block ${blockId}`, {
          error: batchError.message,
          parentId,
          nextCursor,
        });

        // Don't throw - continue with what we have so far
        break;
      }
    }

    // Log performance metrics if enabled
    if (enableMetrics) {
      const endTime = performance.now();
      logger.debug(`Block ${blockId} processed in ${endTime - startTime}ms, depth: ${currentDepth}, blocks: ${processedBlocks}, tier: ${userTier}`);
    }

    // Only return elements at the top level of recursion
    return currentDepth === 0 ? elementProcessor.getElements() : [];
  } catch (error) {
    logger.error(`Error processing block ${blockId}`, {
      error: error.message,
      stack: error.stack,
      parentId,
      depth: currentDepth,
    });

    if (currentDepth === 0) {
      throw new Error(`Problem processing block ${blockId}: ${error.message}`);
    } else {
      return []; // Return empty for recursive calls to prevent complete failure
    }
  }
}

export { NotionAPI, fetchBlockChildrenRecursively };
