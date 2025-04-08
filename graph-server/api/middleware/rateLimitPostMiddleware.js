import { RedisController } from '../controller/RedisController/index.js';
import logger from '../logs/index.js';
import { vipMiddleware, ACCOUNT_TIERS } from './vipMiddleware.js';

// Default values from environment variables with fallbacks
const MAX_NOTES_FREE = parseInt(process.env.MAX_NOTES) || 2; // Maximum fast notes allowed per day for free users
const DAILY_TIME = 86400;  // 86400 seconds = 24 hours

/**
 * Rate limit middleware for POST requests
 * Uses the centralized VIP middleware to determine user status
 */
export const rateLimitMiddleware = async (req, res, next) => {
    // First apply the VIP middleware to determine user status
    await vipMiddleware(req, res, async () => {
        try {
            const redis = new RedisController();
            const userId = req.userId; // Set by vipMiddleware
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const rateLimitKey = `rate_limit:${userId}:${today}`;

            // VIP users bypass rate limiting
            if (req.isVip) {
                // Clear any existing rate limit for VIP users
                await redis.deleteKey(rateLimitKey);
                next();
                return;
            }

            // Free user rate limiting logic
            const currentCount = parseInt(await redis.getKey(rateLimitKey) || 0);

            if (currentCount >= req.maxNotes) {
                logger.info(`Free user reached daily limit ${rateLimitKey}`);
                return res.status(429).json({
                    error: true,
                    tier: req.userTier,
                    message: 'Daily limit reached. Please upgrade to premium for unlimited access.',
                    currentUsage: currentCount,
                    maxLimit: req.maxNotes
                });
            }

            // Track usage for free users
            await redis.setKey(rateLimitKey, currentCount + 1, DAILY_TIME);
            logger.info(`Free user count: ${userId}-${currentCount + 1}/${req.maxNotes}`);

            // Set usage stats on request
            req.usageCount = currentCount + 1;

            next();
            return;
        } catch (error) {
            logger.error('Rate limit middleware error:', error);
            res.status(500).json({ error: true, message: 'Internal server error' });
        }
    });
};
