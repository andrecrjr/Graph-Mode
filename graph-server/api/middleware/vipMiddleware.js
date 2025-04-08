import { RedisController } from '../controller/RedisController/index.js';
import logger from '../logs/index.js';

// Account tiers
export const ACCOUNT_TIERS = {
    FREE: 'free',
    PREMIUM: 'premium',
    LIFETIME: 'lifetime'
};

/**
 * Determines user tier based on subscription status
 * @param {Object} userData - User data from Redis
 * @returns {string} - Account tier
 */
export const getUserTier = (userData) => {
    if (!userData) return ACCOUNT_TIERS.FREE;

    // User with lifetime payment
    if (userData.lifetimePaymentId) return ACCOUNT_TIERS.LIFETIME;

    // User with active subscription
    if (userData.subscriptionId && !userData.cancelAtPeriodEnd) return ACCOUNT_TIERS.PREMIUM;

    // Default to free tier
    return ACCOUNT_TIERS.FREE;
};

/**
 * Checks user VIP status and sets appropriate request properties
 */
export const vipMiddleware = async (req, res, next) => {
    try {
        const redis = new RedisController();
        const userId = req.query?.user || req.headers['x-user-id'] || 'anonymous';

        // Skip VIP check for public routes if needed
        if (req.skipVipCheck) {
            next();
            return;
        }

        // Get user data from Redis
        const userData = await redis.getKey(`notion-${userId}`);
        const userTier = getUserTier(userData);

        // Set properties on request object for use in other middleware/routes
        req.userId = userId;
        req.userTier = userTier;
        req.isVip = userTier !== ACCOUNT_TIERS.FREE;
        req.userData = userData || {};

        // Set rate limits based on tier
        if (userTier === ACCOUNT_TIERS.FREE) {
            req.requestLimit = parseInt(process.env.LIMIT_NOTION_REFRESH) || 5;
            req.maxNotes = parseInt(process.env.MAX_NOTES) || 2;
        } else {
            // Unlimited for VIP users (using a high number)
            req.requestLimit = 1000;
            req.maxNotes = 1000;
        }

        // Log user tier detection
        logger.debug(`User ${userId} classified as ${userTier} tier`);

        // VIP status is now set on the request object, proceed
        next();
    } catch (error) {
        logger.error('VIP middleware error:', error);
        // Continue anyway to avoid breaking the application
        req.isVip = false;
        req.userTier = ACCOUNT_TIERS.FREE;
        next();
    }
}; 