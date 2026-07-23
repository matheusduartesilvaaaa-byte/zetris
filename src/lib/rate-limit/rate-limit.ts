interface Bucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Rate limit em memória. Correto para uma instância; em produção com
 * múltiplas instâncias, cada uma teria seu próprio balde — na prática
 * ainda protege (o limite fica "N por instância"), mas o ideal é migrar
 * para um contador Redis (`INCR` + `EXPIRE`) quando escalar
 * horizontalmente. Mesma lógica de troca de adaptador usada em cache/fila.
 */
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function rateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: maxRequests, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  const refillAmount = (elapsed / windowMs) * maxRequests;
  bucket.tokens = Math.min(maxRequests, bucket.tokens + refillAmount);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, remaining: Math.floor(bucket.tokens) };
}
