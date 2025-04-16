import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import StreamElementProcessor from "../controller/StreamElementProcessor.js";
import { streamBlocksRecursively } from "../controller/streamFetch.js";
import logger from "../logs/index.js";
import dotenv from "dotenv";
dotenv.config();

const streamRouter = Router();

/**
 * Route for streaming block hierarchy with immediate element-by-element processing
 * Uses Server-Sent Events (SSE) to stream each processed element in real-time
 */
streamRouter.get('/blocks/:blockId', authMiddleware, async (req, res) => {
    const { blockId } = req.params;

    // Configure SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Helper function to send SSE events
    const sendEvent = (eventType, data) => {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Handle client disconnect
    req.on('close', () => {
        logger.info(`Client closed SSE connection for blockId: ${blockId}`);
    });

    try {
        // Create the stream processor with the sendEvent function
        const streamProcessor = new StreamElementProcessor(req.notionAPI, sendEvent);

        // Send initial status event
        sendEvent('status', {
            message: 'Starting element processing',
            blockId,
            timestamp: new Date().toISOString()
        });

        // Fetch and process the parent block first
        const firstParent = await req.notionAPI.fetchBlockChildren(blockId, false, false);
        streamProcessor.processParentAndStream(firstParent);

        // Track API requests
        const requestTracker = { count: 1 }; // Already made one request for parent

        // Get custom request limit if specified
        const requestLimit = req.requestLimit || parseInt(process.env.LIMIT_NOTION_REFRESH) || 5;

        // Stream blocks recursively, processing each element individually 
        await streamBlocksRecursively(
            blockId,
            req.notionAPI,
            streamProcessor,
            {
                requestTracker,
                enableMetrics: true,
                requestLimit,
                parentId: blockId // Ensure parentId is set for proper edge creation
            }
        );

        // After processing is complete, ensure we have all nodes and edges
        streamProcessor.streamCompleteState({
            message: 'Graph processing complete',
            timestamp: new Date().toISOString(),
            requestCount: requestTracker.count,
            requestLimit
        });

        // End the stream with a complete event
        sendEvent('complete', {
            message: 'Processing complete',
            timestamp: new Date().toISOString()
        });

        // End the response
        res.end();

    } catch (error) {
        logger.error(`Error streaming blockId: ${blockId}`, {
            error: error.message,
            auth: !!req.headers?.authorization
        });

        // Send error event
        sendEvent('error', {
            message: `Error processing block: ${error.message}`,
            fatal: true,
            timestamp: new Date().toISOString()
        });

        // End the stream
        res.end();
    }
});

export default streamRouter; 