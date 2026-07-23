import type { ICache } from "@/lib/cache/cache.interface";
import { MemoryCacheAdapter } from "@/lib/cache/memory-cache.adapter";

/**
 * Fachada de cache usada por todo o sistema (feature flags, painel admin,
 * analytics engine). A troca de implementação (memória → Redis) acontece
 * apenas aqui, uma única vez — nenhum módulo consumidor precisa mudar.
 */
const globalForCache = globalThis as unknown as { cacheAdapter: ICache | undefined };

function resolveAdapter(): ICache {
  if (globalForCache.cacheAdapter) return globalForCache.cacheAdapter;

  let adapter: ICache;
  if (process.env.REDIS_URL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RedisCacheAdapter } = require("@/lib/cache/redis-cache.adapter");
    adapter = new RedisCacheAdapter(process.env.REDIS_URL);
  } else {
    adapter = new MemoryCacheAdapter();
  }

  globalForCache.cacheAdapter = adapter;
  return adapter;
}

export async function getOrSetCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cache = resolveAdapter();
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetcher();
  await cache.set(key, value, ttlMs);
  return value;
}

export async function invalidateCache(key: string) {
  await resolveAdapter().delete(key);
}

