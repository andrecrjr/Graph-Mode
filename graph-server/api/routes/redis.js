import { Router } from "express";
import { RedisController } from "../controller/RedisController/index.js";
import logger from "../logs/index.js";

const redisRouter = Router()

redisRouter.get("/healthcheck", async (req, res)=>{
    try {
        const redis = new RedisController()
        const ok = await redis.healthcheckRedis()
        return res.status(200).json({"redis_service": ok})
    } catch (error) {
        logger.error(`Error no redis healthcheck ${error}`)
        return res.status(200).json({"redis_service": error})
    }

})

export {redisRouter}