import {RedisController} from '../controller/RedisController/index.js';
import logger from '../logs/index.js';

const MAX_NOTES = process.env.MAX_NOTES || 5; // Maximum fast notes allowed per day
const DAILY_TIME = 86400;  // 86400 seconds = 24 hours

export const rateLimitMiddleware = async (req, res, next) => {
    try {
        const redis = new RedisController();
        const userId = req.query?.user || 'anonymous'; // Replace with user ID from your auth logic
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const getUserAccount = await redis.getKey(`notion-${userId}`)
        const rateLimitKey = `rate_limit:${userId}:${today}`;
        if(getUserAccount){
            await redis.deleteKey(rateLimitKey)
            next()
            return;
        }
        
        const currentCount = await redis.getKey(rateLimitKey) || 0;
        if (currentCount >= MAX_NOTES) {
            logger.info(`User reached daily fast note limit ${rateLimitKey}`)
            return res.status(429).json({
                error: true,
                message: 'Daily fast notes limit reached. Try again tomorrow.',
            });
        }

        await redis.setKey(rateLimitKey, currentCount + 1, DAILY_TIME);
        logger.info(`User count: ${req.query.user}-${currentCount+1}`)

        next();
        return;
    } catch (error) {
        console.error('Rate limit middleware error:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
};
