// src/lib/rate-limit.ts

type RateLimiterOptions = {
    interval: number; // in ms
    uniqueTokenPerInterval?: number;
};

// In a real production setup, this generic in-memory cache should be replaced
// by a Redis implementation (e.g. @upstash/ratelimit) to persist across serverless instances.
export default function rateLimit(options: RateLimiterOptions) {
    const tokenCache = new Map<string, number[]>();

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();
                const timestamps = tokenCache.get(token) || [];

                // Clear old timestamps
                const recentTimestamps = timestamps.filter(ts => now - ts < options.interval);

                if (recentTimestamps.length >= limit) {
                    reject(new Error('Rate limit exceeded'));
                } else {
                    recentTimestamps.push(now);
                    tokenCache.set(token, recentTimestamps);
                    resolve();
                }
            }),
    };
}
