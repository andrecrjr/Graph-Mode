import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import streamRouter from './routes/streamRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

import { pageRouter } from './routes/CRUDNotion.js';
import { webhookStriperRouter } from "./routes/webhook.js"
import { UserRouter } from './routes/user.js';
import { redisRouter } from './routes/redis.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;


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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use("/", router)
app.use("/user", UserRouter)
app.use("/translate", pageRouter)
app.use("/redis", redisRouter)
app.use("/stream", streamRouter)

// Inicializa o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
