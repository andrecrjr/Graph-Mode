import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import BlocknoteToNotionTranslateController from "../controller/Translator/index.js"

const router = Router()


router.post('/page', authMiddleware, async (req, res)=>{
    const translate = new BlocknoteToNotionTranslateController()
    const data = await translate.postHandler(req)
    res.status(200).json(data)
})

export {router as pageRouter};