import logger from '../logs/index.js';
import { performance } from 'perf_hooks';

// Maximum default request count
const MAX_REQUEST_COUNT = 5;

/**
 * Fetches blocks recursively and streams each element individually
 * This is a complete rewrite focusing on real-time streaming of individual elements
 * without batching
 * 
 * @param {String} blockId - The block ID to fetch children for
 * @param {Object} notionAPI - The Notion API instance
 * @param {Object} streamProcessor - The StreamElementProcessor instance
 * @param {Function} sendEvent - Function to send SSE events to client
 * @param {Object} options - Configuration options
 * @returns {Promise<void>} - Promise that resolves when streaming is complete
 */
export async function streamBlocksRecursively(
    blockId,
    notionAPI,
    streamProcessor,
    options = {}
) {
    // Validate required inputs
    if (!blockId) throw new Error('Block ID is required');
    if (!notionAPI) throw new Error('Notion API instance is required');
    if (!streamProcessor) throw new Error('Stream processor is required');
    if (typeof streamProcessor.sendEvent !== 'function') {
        throw new Error('Stream processor must have a sendEvent function');
    }

    // Handle options with defaults
    const {
        parentId = null,
        requestTracker = { count: 0 },
        maxDepth = 100,
        currentDepth = 0,
        abortSignal = null,
        skipTypes = [],
        enableMetrics = false,
        requestLimit = MAX_REQUEST_COUNT
    } = options;

    // Start performance tracking if metrics enabled
    const startTime = enableMetrics ? performance.now() : 0;

    try {
        // Check recursion depth and abort signal
        if (currentDepth >= maxDepth) {
            logger.warn(`Maximum recursion depth (${maxDepth}) reached for block ${blockId}`);
            return;
        }

        if (abortSignal?.aborted) {
            logger.info('Processing aborted by user request');
            return;
        }

        // Determine effective request limit based on VIP status
        const isVip = notionAPI.getIsVip();
        const userTier = notionAPI.getUserTier();
        const effectiveRequestLimit = isVip ? Number.MAX_SAFE_INTEGER : requestLimit;

        // Stream progress update at the start
        const sendEvent = streamProcessor.sendEvent;
        if (currentDepth === 0) {
            sendEvent('progress', {
                progress: 0,
                requestCount: requestTracker.count,
                requestLimit: effectiveRequestLimit,
                depth: currentDepth
            });
        }

        // Process elements one page at a time, handling pagination
        let nextCursor = null;
        let processedBlocks = 0;

        do {
            // Check if we've hit the request limit
            if (!isVip && requestTracker.count >= effectiveRequestLimit) {
                if (currentDepth === 0) {
                    sendEvent('limitReached', {
                        message: `Request limit of ${effectiveRequestLimit} reached`,
                        requestCount: requestTracker.count
                    });
                }
                break;
            }

            // Fetch the next batch of children
            try {
                const { results, has_more, next_cursor } = await notionAPI.fetchBlockChildren(blockId, nextCursor);
                requestTracker.count++;

                // No results to process
                if (!results || results.length === 0) {
                    break;
                }

                // Update progress counters
                processedBlocks += results.length;

                // Process and stream each element INDIVIDUALLY - this is the key change
                for (const child of results) {
                    // Skip processing for types we want to ignore
                    if (skipTypes.includes(child.type)) {
                        continue;
                    }

                    try {
                        // Process and immediately stream this element
                        const childId = streamProcessor.processChildAndStream(child, parentId, {
                            depth: currentDepth,
                            requestCount: requestTracker.count,
                            effectiveRequestLimit
                        });

                        // Send progress update (only at root level)
                        if (currentDepth === 0) {
                            // Estimate progress (intentionally kept under 100%)
                            const progress = has_more ?
                                Math.min((processedBlocks / (processedBlocks + 20)) * 100, 99) :
                                99;

                            sendEvent('progress', {
                                progress: Math.round(progress),
                                requestCount: requestTracker.count,
                                requestLimit: effectiveRequestLimit,
                                processedBlocks
                            });
                        }

                        // Check if we've hit the request limit
                        if (!isVip && requestTracker.count >= effectiveRequestLimit) {
                            if (currentDepth === 0) {
                                sendEvent('limitReached', {
                                    message: `Request limit of ${effectiveRequestLimit} reached`,
                                    requestCount: requestTracker.count
                                });
                            }
                            break;
                        }

                        // Only recurse if needed and within limits
                        if (childId && requestTracker.count < effectiveRequestLimit && !abortSignal?.aborted) {
                            // Critical pre-check: Don't start recursive calls that would exceed limit
                            if (!isVip && requestTracker.count >= effectiveRequestLimit - 1) {
                                logger.warn(`Request limit ${effectiveRequestLimit} would be exceeded by recursion, stopping at depth ${currentDepth}`);
                                continue;
                            }

                            // Process child elements recursively with same options, different depth
                            await streamBlocksRecursively(
                                childId,
                                notionAPI,
                                streamProcessor,
                                {
                                    ...options,
                                    parentId: childId,
                                    currentDepth: currentDepth + 1
                                }
                            );
                        }
                    } catch (childError) {
                        // Log error but continue processing other elements
                        logger.error(`Error processing child ${child.id || 'unknown'} at depth ${currentDepth}`, {
                            error: childError.message,
                            parentId,
                            blockId: child.id,
                        });

                        // Stream error for this specific element
                        streamProcessor.streamError(childError, `Processing element ${child.id}`);
                    }

                    // Check again if we hit the limit during recursive calls
                    if (!isVip && requestTracker.count >= effectiveRequestLimit) {
                        break;
                    }
                }

                // Update pagination cursor
                nextCursor = next_cursor;
                if (!has_more) break;

            } catch (fetchError) {
                logger.error(`Error fetching children for block ${blockId}`, {
                    error: fetchError.message,
                    parentId,
                    nextCursor,
                    depth: currentDepth
                });

                // Stream fetch error but try to continue
                streamProcessor.streamError(fetchError, `Fetching children of ${blockId}`);
                break;
            }
        } while (nextCursor && requestTracker.count < effectiveRequestLimit && !abortSignal?.aborted);

        // Log performance metrics if enabled
        if (enableMetrics) {
            const endTime = performance.now();
            logger.debug(`Block ${blockId} processed in ${endTime - startTime}ms, depth: ${currentDepth}, blocks: ${processedBlocks}, tier: ${userTier}`);
        }

        // Final progress update if at root level
        if (currentDepth === 0) {
            sendEvent('progress', {
                progress: 100,
                requestCount: requestTracker.count,
                processedBlocks
            });

            // Send final complete state
            streamProcessor.streamCompleteState({
                isVip,
                tier: userTier,
                requestCount: requestTracker.count,
                requestLimit: effectiveRequestLimit
            });
        }

    } catch (error) {
        logger.error(`Fatal error processing block ${blockId}`, {
            error: error.message,
            stack: error.stack,
            parentId,
            depth: currentDepth,
        });

        // Stream fatal error
        streamProcessor.streamError(error, `Fatal error at depth ${currentDepth}`);

        // Only throw at root level to prevent cascading failures
        if (currentDepth === 0) {
            throw error;
        }
    }
} 