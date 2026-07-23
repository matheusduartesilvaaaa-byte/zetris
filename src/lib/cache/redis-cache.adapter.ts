import type { ICache } from "@/lib/cache/cache.interface";
import { logger } from "@/lib/logger";
import type Redis from "ioredis";

/**
 * Adaptador Redis. Requer a variável `REDIS_URL` e o pacote `ioredis`
 * instalado (já está no package.json). Se a conexão falhar, os erros são
 * logados e o valor tratado como cache-miss — nunca derruba a aplicação
 * por causa do cache.
 */
export class RedisCacheAdapter implements ICache {
  private client: Redis;

  constructor(redisUrl: string) {
    // Import dinâmico: evita que o pacote `ioredis` seja exigido em quem
    // não configurou Redis (o MemoryCacheAdapter nunca importa este arquivo).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis");
    this.client = new IORedis(redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true });
    this.client.on("error", (err: Error) => logger.error({ err }, "Erro de conexão com Redis"));
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      logger.error({ err: error, key }, "Falha ao ler cache Redis");
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), "PX", ttlMs);
    } catch (error) {
      logger.error({ err: error, key }, "Falha ao escrever cache Redis");
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error({ err: error, key }, "Falha ao remover cache Redis");
    }
  }
}
