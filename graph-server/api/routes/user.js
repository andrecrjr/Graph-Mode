import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {RedisController} from "../controller/RedisController/index.js";
import logger from "../logs/index.js";

export const UserRouter = Router()
const redis = new RedisController();

UserRouter.post("/", authMiddleware, async (req, res) => {
    try {
        const data = req.body;

        if (!data?.person?.email) {
            return res.status(400).json({ error: "Invalid request: 'email' is required" });
        }

        const email = data[data["type"]]["email"];
        const userData = await redis.getKey(`notion-${email}`);

        delete data["tokens"];

        if (!userData) {
            logger.info(`User ${email} has no subscription`)
            return res.status(200).json({subscriptionId: null});
        }

        return res.status(200).json({ ...userData, ...data });
    } catch (error) {
        console.error("Error occurred while processing request:", error);

        return res.status(500).json({ error: "An internal server error occurred" });
    }
});

UserRouter.get("/:notionId", authMiddleware, async (req, res)=>{
    try {
        const { notionId } = req.params;
        const redis = new RedisController()
        const userData = await redis.getKey(`notion-${notionId}`)
        return res.json(userData)
    } catch (error) {
        console.log(error)
        return res.status(404).json({"error":"Problem to get User Data from Database"})
    }

})

UserRouter.delete("/:notionId", authMiddleware, async (req, res)=>{
    try {
        const { notionId } = req.params;
        const redis = new RedisController()
        const userData = await redis.deleteKey(`notion-${notionId}`)
        return res.json(userData)
    } catch (error) {
        console.log(error)
        return res.status(404).json({"error":"Problem to get User Data from Database"})
    }

})