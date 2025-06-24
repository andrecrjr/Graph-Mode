import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import router from './routes/index.js';

// Load environment variables first
dotenv.config();

import { pageRouter } from './routes/CRUDNotion.js';
import { webhookStriperRouter } from "./routes/webhook.js"
import { UserRouter } from './routes/user.js';
import { redisRouter } from './routes/redis.js';
import { socketRouter } from './routes/socket.js';
import SocketController from './controller/SocketController/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io server
SocketController.initSocketServer(server);

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(",");

app.use("/webhook", webhookStriperRouter);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (!allowedOrigins.includes(origin)) {
      const msg = 'A política de CORS não permite acesso deste domínio.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use("/", router)
app.use("/user", UserRouter)
app.use("/redis", redisRouter)
app.use("/socket", socketRouter)

// Inicializa o servidor HTTP com Express e Socket.io
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} com suporte a WebSockets`);
});
