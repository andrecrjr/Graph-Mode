import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';

import { pageRouter } from './routes/CRUDNotion.js';
import {webhookStriperRouter} from "./routes/webhook.js"
import { UserRouter } from './routes/user.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;


const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(",");

app.use("/webhook", webhookStriperRouter);

app.use(cors({
  origin: function (origin, callback) {
    if(!origin){
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
app.use("/translate", pageRouter)


// Inicializa o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
