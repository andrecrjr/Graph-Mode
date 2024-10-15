import Redis  from 'ioredis'
import logger from '../../logs/index.js';

export class RedisController {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port:  process.env.REDIS_PORT,        
      password: process.env.REDIS_PASSWORD
    });
  }

  async setKey(key, value, expireTime = null) {
    try {
      await this.redis.set(key, JSON.stringify(value));
      if (expireTime) {
        await this.redis.expire(key, expireTime);
      }
    } catch (err) {
      logger.error(`Erro ao definir a chave ${key}:`, err);
    }
  }

  async getKey(key) {
    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.info(`Valor da chave ${key}: ${value}`);
        return JSON.parse(value);
      } else {
        return null;
      }
    } catch (err) {
      logger.error(`Erro ao obter a chave ${key}:`, err);
    }
  }

  // Atualizar uma chave existente (simplesmente sobrescreve o valor)
  async updateKey(key, value) {
    try {
      const exists = await this.redis.exists(key);
      if (exists) {
        await this.setKey(key, value);
        logger.info(`Chave ${key} atualizada com sucesso.`);
      }
    } catch (err) {
      logger.error(`Erro ao atualizar a chave ${key}:`, err);
    }
  }

  // Deletar uma chave do Redis
  async deleteKey(key) {
    try {
      const result = await this.redis.del(key);
      if (result === 1) {
        logger.info(`Chave ${key} deletada com sucesso.`);
      }
    } catch (err) {
      logger.error(`Erro ao deletar a chave ${key}:`, err);
    }
  }

  // Fechar a conexão Redis (opcional, caso necessário)
  async closeConnection() {
    try {
      await this.redis.quit();
      logger.warn('Conexão com o Redis fechada.');
    } catch (err) {
      logger.error('Erro ao fechar a conexão com o Redis:', err);
    }
  }
}