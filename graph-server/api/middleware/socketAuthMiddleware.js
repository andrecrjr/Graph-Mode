import { NotionAPI } from "../controller/services/notion.js";
import logger from "../logs/index.js";
import { vipMiddleware } from "./vipMiddleware.js";

/**
 * Socket.io middleware that validates Notion tokens
 * and sets up the NotionAPI instance for the socket.
 * Adapted from the HTTP authMiddleware.
 */
export const socketAuthMiddleware = async (socket, next) => {
    try {
        // Get token from socket handshake auth or headers
        const AUTH = socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization;

        if (!AUTH) {
            const err = new Error('Authorization token missing');
            return next(err);
        }

        // Create NotionAPI instance with auth token
        socket.notionAPI = new NotionAPI(null, AUTH);

        // Set user for the NotionAPI if provided in handshake query
        const user = socket.handshake.query?.user;
        if (user) {
            socket.notionAPI = new NotionAPI(null, AUTH, user);

            // Create mock req and res objects for vipMiddleware
            const mockReq = {
                notionAPI: socket.notionAPI,
                query: { user }
            };

            const mockRes = {
                setHeader: (name, value) => {
                    // Store headers as socket data for reference
                    if (!socket.headers) socket.headers = {};
                    socket.headers[name] = value;
                }
            };

            // Run VIP middleware with mock objects
            await vipMiddleware(mockReq, mockRes, async () => {
                // Apply VIP status to NotionAPI
                socket.notionAPI.isVip = mockReq.isVip;
                socket.notionAPI.userTier = mockReq.userTier;

                // Store VIP status and tier on socket for easy access
                socket.isVip = mockReq.isVip;
                socket.userTier = mockReq.userTier;
                socket.requestLimit = mockReq.requestLimit || 5;

                // Set up rate limit based on VIP status
                await socket.notionAPI.setRateLimit();

                next();
            });
        } else {
            next();
        }
    } catch (error) {
        logger.error("Socket auth middleware error:", error);
        const err = new Error("Authentication error");
        next(err);
    }
};

export default socketAuthMiddleware; 