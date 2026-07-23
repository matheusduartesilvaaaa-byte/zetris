import type { ICache } from "@/lib/cache/cache.interface";

interface Entry {
  value: unknown;
  expiresAt: number;
}

/**
 * Adaptador em memória: correto para uma única instância do servidor.
 * Limitação conhecida: em produção com múltiplas instâncias (escala
 * horizontal), cada instância teria seu próprio cache — não compartilhado.
 * Por isso `CacheService` troca automaticamente para `RedisCacheAdapter`
 * quando `REDIS_URL` está configurado, sem que quem consome o cache
 * precise saber qual dos dois está ativo.
 */
export class MemoryCacheAdapter implements ICache {
  private store = new Map<string, Entry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
