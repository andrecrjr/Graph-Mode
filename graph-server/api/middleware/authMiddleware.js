import { NotionAPI } from "../controller/services/notion.js";

export const authMiddleware = async (req, res, next) => {

  const AUTH = req.headers?.authorization;
  
  if (!AUTH) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }
  
  req.notionAPI = new NotionAPI(null, AUTH);
  if(!!req.query?.user){
    req.notionAPI = new NotionAPI(null, AUTH, req.query.user);
    await req.notionAPI.setRateLimit()
  }
  next();
}