import { Router } from "express";
import { RedisController } from "../controller/RedisController/index.js";
import logger from "../logs/index.js";

const redisRouter = Router()

redisRouter.get("/healthcheck", async (req, res)=>{
    const redis = new RedisController()
    try {
        const ok = await redis.healthcheckRedis()
        res.json({redis_service: ok})
    } catch (error) {
        logger.error(`Error no redis healthcheck ${error}`)
    }

})

export {redisRouter}