//webhook notion to update redis cache

import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { RedisController } from "../controller/RedisController/index.js";
import { NotionAPI } from "../controller/services/notion.js";
import logger from "../logs/index.js";
import { convertToUid } from "../utils/index.js";

const router = Router();

const verificationTokens = new Map();

router.post("/notion-hook", async (req, res) => {
    try {
        const body = req.body;
        console.log('Received webhook request:', {
            headers: req.headers,
            body: body,
            timestamp: new Date().toISOString()
        });
        await processWebhookEvent(body, req);


        if (body.verification_token) {
            logger.info("Received webhook verification token");
            verificationTokens.set('default', body.verification_token);

            return res.status(200).json({
                message: "Webhook verification received",
                token: body.verification_token
            });
        }

        // Validate webhook signature for security
        const signature = req.headers['x-notion-signature'];
        if (signature && !validateWebhookSignature(JSON.stringify(body), signature)) {
            logger.warn("Invalid webhook signature");
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Process webhook event

        res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
        logger.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Validate webhook signature using HMAC-SHA256
 */
function validateWebhookSignature(payload, signature) {
    try {
        const verificationToken = verificationTokens.get('default');
        if (!verificationToken) {
            logger.warn("No verification token found for signature validation");
            return false;
        }

        const calculatedSignature = `sha256=${createHmac("sha256", verificationToken)
            .update(payload)
            .digest("hex")}`;

        return timingSafeEqual(
            Buffer.from(calculatedSignature),
            Buffer.from(signature)
        );
    } catch (error) {
        logger.error("Error validating webhook signature:", error);
        return false;
    }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(eventData, req) {
    const { type, object, entity } = eventData;
    console.log("eventData", eventData)

    logger.info(`Processing webhook event: ${type} for ${entity.id}`);
    logger.info("entity", eventData)

    const redis = new RedisController();

    switch (type) {
        case 'page.properties_updated':
            await handlePageUpdated(entity, redis, req, eventData);
            break;

        case 'page.created':
            await handlePageCreated(entity, redis, req);
            break;

        case 'page.deleted':
            await handlePageDeleted(entity, redis, req);
            break;

        default:
            logger.info(`Unhandled webhook event type: ${type}`);
    }
}


async function handlePageUpdated(entity, redis, req, eventData) {
    const pageId = entity.id;

    try {
        logger.info(`handlePageUpdated ${pageId}`)
        // Clear cache for the updated page and its children
        await invalidatePageCache(pageId, redis);

        // Instead of fetching and sending data directly, notify frontend to refetch
        await broadcastRefetchTrigger('page_updated', {
            pageId,
            timestamp: new Date().toISOString()
        }, req);

        logger.info(`Cache cleared and refetch triggered for page ${pageId}`);

    } catch (error) {
        logger.error(`Error handling page update for ${pageId}:`, error);
    }
}

/**
 * Handle page creation
 */
async function handlePageCreated(entity, redis, req) {
    const pageId = entity.id;

    try {
        // Clear parent cache if applicable
        if (entity.parent_id) {
            await invalidatePageCache(entity.parent_id, redis);
        }

        // Trigger refetch for parent page to pick up new child
        await broadcastRefetchTrigger('page_created', {
            pageId,
            parentId: entity.parent_id,
            timestamp: new Date().toISOString()
        }, req);

        logger.info(`Successfully processed page creation for ${pageId}`);

    } catch (error) {
        logger.error(`Error handling page creation for ${pageId}:`, error);
    }
}

/**
 * Handle page deletion
 */
async function handlePageDeleted(entity, redis, req) {
    const pageId = entity.id;

    try {
        // Remove all cache entries related to this page
        await invalidatePageCache(pageId, redis);

        // Clear parent cache if applicable
        if (entity.parent_id) {
            await invalidatePageCache(entity.parent_id, redis);
        }

        // Trigger refetch for parent page to update after deletion
        await broadcastRefetchTrigger('page_deleted', {
            pageId,
            parentId: entity.parent_id,
            timestamp: new Date().toISOString()
        }, req);

        logger.info(`Successfully processed page deletion for ${pageId}`);

    } catch (error) {
        logger.error(`Error handling page deletion for ${pageId}:`, error);
    }
}


/**
 * Invalidate cache entries for a page and its variants
 */
async function invalidatePageCache(pageId, redis) {
    try {
        // Generate all possible pageId formats
        const pageIdWithoutDashes = pageId.replace(/-/g, '');
        const pageIdWithDashes = pageId.includes('-') ? pageId : convertToUid(pageId);

        // Create comprehensive list of possible cache keys
        const possiblePageIds = [
            pageId,                    // Original format
            pageIdWithoutDashes,       // Without dashes
            pageIdWithDashes,          // With dashes (UUID format)
            convertToUid(pageIdWithoutDashes) // Convert from no-dash to UUID
        ];

        // Remove duplicates
        const uniquePageIds = [...new Set(possiblePageIds)];

        const keysToDelete = [];
        uniquePageIds.forEach(id => {
            keysToDelete.push(
                `block_${id}_initial_true`,
                `block_${id}_initial_false`
            );
        });

        console.log(`Attempting to delete cache keys for pageId: ${pageId}`);
        console.log(`Generated pageId variants:`, uniquePageIds);
        console.log(`Keys to delete:`, keysToDelete);

        // Delete specific cache keys
        for (const key of keysToDelete) {
            const result = await redis.deleteKey(key);
            console.log(`Deleted key: ${key}, result:`, result);
        }

        // Also try to find and delete any keys that match the pattern using Redis KEYS command
        const allKeys = await redis.redis.keys("block_*");
        const matchingKeys = allKeys.filter(key => {
            return uniquePageIds.some(id =>
                key.includes(`block_${id}_initial_`) ||
                key.startsWith(`block_${id}_`)
            );
        });

        if (matchingKeys.length > 0) {
            console.log(`Found additional matching keys:`, matchingKeys);
            for (const key of matchingKeys) {
                const result = await redis.deleteKey(key);
                console.log(`Deleted additional key: ${key}, result:`, result);
            }
        }

        logger.debug(`Cache invalidated for page ${pageId} with ${keysToDelete.length + matchingKeys.length} keys deleted`);

    } catch (error) {
        logger.error(`Error invalidating cache for page ${pageId}:`, error);
    }
}


/**
 * Broadcast refetch trigger via Socket.IO to notify frontend to reload data
 */
async function broadcastRefetchTrigger(eventType, data, req) {
    try {
        console.log("broadcastRefetchTrigger", eventType, data, req)
        // Get Socket.IO instance from the app context
        const io = req.app?.get('socketio') || global.socketio;

        if (io) {
            io.emit('notion_refetch', {
                type: eventType,
                data,
                timestamp: new Date().toISOString()
            });

            logger.debug(`Broadcast refetch trigger ${eventType} event via Socket.IO`);
        } else {
            logger.warn("Socket.IO instance not available for broadcasting refetch trigger");
        }

    } catch (error) {
        logger.error(`Error broadcasting refetch trigger:`, error);
    }
}


export default router;