import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {RedisController} from "../controller/RedisController/index.js";

export const UserRouter = Router()

UserRouter.post("/", authMiddleware, async (req, res)=>{
    try {
        const data = req.body;
        console.log("data", data)
        const redis = new RedisController()
        const userData = await redis.getKey(`notion-${data?.person?.email}`)
        delete data["tokens"]
        if(!userData){
            const updateDataWithSubsctption =  {...data, "subscriptionId": null}
            await redis.setKey(`notion-${data.person.email}`, updateDataWithSubsctption)
            return res.json(updateDataWithSubsctption)
        }
        return res.json({subscriptionId: userData["subscriptionId"], ...data})
    } catch (error) {
        console.log(error)
        return res.json({error:"Some server problem found"})
    }

})


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