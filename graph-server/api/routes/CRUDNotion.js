import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import TranslateController from "../controller/Translator/index.js"

const router = Router()


router.post('/page', authMiddleware, async (req, res)=>{
    const translate = new TranslateController()
    const data = await translate.postHandler(req)
    res.status(200).json(data)
})

export {router as pageRouter};