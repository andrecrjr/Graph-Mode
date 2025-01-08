import {RedisController} from '../controller/RedisController/index.js';
import logger from '../logs/index.js';

const MAX_POSTS = 10; // Maximum posts allowed per day
const DAILY_TIME = 86400;  // 86400 seconds = 24 hours

export const rateLimitMiddleware = async (req, res, next) => {
    try {
        const redis = new RedisController();
        const userId = req.query?.user || 'anonymous'; // Replace with user ID from your auth logic
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const getUserAccount = await redis.getKey(`notion-${userId}`)
        if(getUserAccount){
            next()
        }
        const rateLimitKey = `rate_limit:${userId}:${today}`;
        
        const currentCount = await redis.getKey(rateLimitKey) || 0;
        if (currentCount >= MAX_POSTS) {
            logger.info(`User reached daily fast note limit ${rateLimitKey}`)
            return res.status(429).json({
                error: true,
                message: 'Daily fast notes limit reached. Try again tomorrow.',
            });
        }

        await redis.setKey(rateLimitKey, currentCount + 1, DAILY_TIME);
        logger.info(`${req.query.user}`)

        next(); // Allow the request to proceed
    } catch (error) {
        console.error('Rate limit middleware error:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
};
