import { Server } from 'socket.io';
import logger from '../../logs/index.js';
import socketAuthMiddleware from '../../middleware/socketAuthMiddleware.js';
import { NotionStreamingService } from '../StreamingProcessor/NotionStreamingService.js';

/**
 * Socket.io server implementation for streaming Notion block data
 * 
 * This controller handles real-time streaming of Notion block data to clients,
 * with support for rate limiting, VIP users, and incremental updates.
 */
class SocketController {
    // Constants
    static MAX_REQUEST_COUNT = 5;

    constructor() {
        this.io = null;
    }

    /**
     * Initialize the Socket.io server
     * @param {Object} server - HTTP server instance
     * @returns {Object} The initialized io server instance
     */
    initServer(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CORS_ALLOWED_ORIGINS.split(","),
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Apply authentication middleware
        this.io.use(socketAuthMiddleware);

        // Register event handlers
        this.registerEventHandlers();

        return this.io;
    }

    /**
     * Register Socket.io event handlers
     */
    registerEventHandlers() {
        this.io.on('connection', (socket) => {
            const username = socket.handshake.query?.user || 'unknown';
            const userTier = socket.userTier || 'free';

            logger.info(`Client connected: ${socket.id}, user: ${username}, tier: ${userTier}`);

            // Initialize streaming service for this socket
            const streamingService = new NotionStreamingService(socket);

            // Handle block data request
            socket.on('fetchBlocks', async (data) => {
                await streamingService.handleFetchBlocks(data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`Client disconnected: ${socket.id}`);
            });
        });
    }
}

// Create controller instance
const socketController = new SocketController();

// Export public methods
export function initSocketServer(server) {
    return socketController.initServer(server);
}

export default {
    initSocketServer
};
