import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';

import { pageRouter } from './routes/CRUDNotion.js';
import {webhookStriperRouter} from "./routes/webhook.js"


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(",");

app.use(cors({
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    if (!allowedOrigins.includes(origin)) {
      const msg = 'A política de CORS não permite acesso deste domínio.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use("/", router)
app.use("/translate", pageRouter)
app.use("/webhook", webhookStriperRouter)

// Inicializa o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
