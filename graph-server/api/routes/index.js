import { Router } from "express";
import {fetchBlockChildrenRecursively} from "../controller/index.js"
import { fileURLToPath } from 'url';

import ElementProcessor from "../controller/ElementProcessor/index.js"
import mock from "../controller/mock.json" with {type: "json"};
import path from "path";
import dotenv from 'dotenv';
import { authMiddleware } from "../middleware/authMiddleware.js";
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), "../../");

const router = Router()


router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

router.get('/blocks/:blockId', authMiddleware, async (req, res) => {
  const { blockId } = req.params;
  try {
    const elementProcessor = new ElementProcessor();
    const firstParent = await req.notionAPI.fetchBlockChildren(blockId, false, false);
    elementProcessor.processParent(firstParent)
    const elements = await fetchBlockChildrenRecursively(blockId, req.notionAPI, elementProcessor, firstParent.id);
    res.json([...elements,{rateLimit:!req.notionAPI.getRateLimit()}]);
  } catch (error) {
    console.log(error)
    res.status(404).json({ error: `Erro ao buscar filhos do bloco: ${error.message}` });
  }
});

router.get("/only/:blockId", authMiddleware, async(req, res)=>{
  try {
    const { blockId } = req.params;
    const elements = await req.notionAPI.fetchBlockChildren(blockId);
    res.json(elements);
  } catch (error) {
    console.error('Erro ao buscar filhos do bloco:', error);
    res.status(404).json({ error: 'Erro ao buscar filhos do bloco' });
  }
})


router.post("/search", authMiddleware, async (req, res)=>{
   try {
    const elements = await req.notionAPI.fetchSearch(req.headers.authorization, req.body.query);
    res.json(elements);
  } catch (error) {
    console.error('Erro ao buscar filhos do bloco:', error);
    res.status(404).json({ error: 'Erro ao buscar filhos do bloco' });
  }
})

router.get("/mock", (req, res)=>{
  res.json(mock)
})

export default router