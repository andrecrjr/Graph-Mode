import { NotionAPI } from "../controller/services/notion.js";
import logger from "../logs/index.js";
import { vipMiddleware } from "./vipMiddleware.js";

/**
 * Authentication middleware that validates Notion tokens
 * and sets up the NotionAPI instance for the request.
 * Also configures VIP status detection.
 * 
 * Accepts tokens from:
 * - Authorization header (standard API requests)
 * - token query parameter (for SSE connections)
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in header or query parameter
    // SSE connections cannot send custom headers, so we need to support query params
    const headerAuth = req.headers?.authorization;
    const queryAuth = req.query?.token;
    const AUTH = headerAuth || queryAuth;

    if (!AUTH) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    // Format the token to ensure it's in the correct format
    const formattedToken = AUTH.startsWith('Bearer ') ? AUTH : `Bearer ${AUTH}`;

    // Create NotionAPI instance with auth token
    req.notionAPI = new NotionAPI(null, formattedToken);

    // Set user for the NotionAPI if provided
    if (req.query?.user) {
      req.notionAPI = new NotionAPI(null, formattedToken, req.query.user);

      // Set up VIP middleware
      await vipMiddleware(req, res, async () => {
        // Apply VIP status to NotionAPI
        req.notionAPI.isVip = req.isVip;
        req.notionAPI.userTier = req.userTier;

        // Set up rate limit based on VIP status (for backward compatibility)
        await req.notionAPI.setRateLimit();

        // Add request limit to the headers for client reference
        res.setHeader('X-Rate-Limit-Max', req.requestLimit || 5);
        res.setHeader('X-User-Tier', req.userTier);

        next();
      });
    } else {
      next();
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};