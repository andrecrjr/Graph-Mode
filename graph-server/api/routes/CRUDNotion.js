import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import BlocknoteToNotionTranslateController from "../controller/Translator/index.js"

const router = Router()


router.post('/page', authMiddleware, async (req, res)=>{
    try {        
        const translate = new BlocknoteToNotionTranslateController()
        const data = await translate.postHandler(req)
        res.status(200).json(data)
    } catch (error) {
        res.status(404).json({error:true, message:error.message})
    }
})

export {router as pageRouter};