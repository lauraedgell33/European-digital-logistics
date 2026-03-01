<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Centralized cache service with prefixed keys and group invalidation.
 *
 * Cache key convention:
 *   {entity}:{scope}:{identifier}:{hash}
 *
 * Groups allow bulk invalidation when data changes:
 *   - freight:*    → clear when any freight offer changes
 *   - vehicles:*   → clear when any vehicle offer changes
 *   - orders:*     → clear when orders change
 *   - dashboard:*  → clear when dashboard-relevant data changes
 *   - companies:*  → clear when company data changes
 *   - tenders:*    → clear when tenders change
 *   - matching:*   → clear when freight/vehicle data changes
 */
class CacheService
{
    private const STORE = 'redis';
    private const PREFIX = 'lm:';
    private const GROUP_INDEX_TTL = 86400; // 24h for group index keys

    /**
     * Get a cached value or compute and store it.
     */
    public static function remember(string $key, int $ttl, callable $callback, array $groups = []): mixed
    {
        $prefixedKey = self::PREFIX . $key;

        $value = Cache::store(self::STORE)->remember($prefixedKey, $ttl, $callback);

        // Register this key in each group's index for bulk invalidation
        foreach ($groups as $group) {
            self::registerInGroup($group, $prefixedKey);
        }

        return $value;
    }

    /**
     * Put a value in cache.
     */
    public static function put(string $key, mixed $value, int $ttl, array $groups = []): void
    {
        $prefixedKey = self::PREFIX . $key;
        Cache::store(self::STORE)->put($prefixedKey, $value, $ttl);

        foreach ($groups as $group) {
            self::registerInGroup($group, $prefixedKey);
        }
    }

    /**
     * Get a value from cache.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::store(self::STORE)->get(self::PREFIX . $key, $default);
    }

    /**
     * Delete a specific cache key.
     */
    public static function forget(string $key): bool
    {
        return Cache::store(self::STORE)->forget(self::PREFIX . $key);
    }

    /**
     * Invalidate all cache keys in a group.
     * Uses a version counter approach: bumping the version makes all old keys stale.
     */
    public static function invalidateGroup(string $group): void
    {
        $groupKey = self::PREFIX . 'group_keys:' . $group;
        $keys = Cache::store(self::STORE)->get($groupKey, []);

        if (!empty($keys)) {
            foreach ($keys as $key) {
                Cache::store(self::STORE)->forget($key);
            }
            Cache::store(self::STORE)->forget($groupKey);
        }

        // Also bump version counter so middleware-cached responses go stale
        $versionKey = self::PREFIX . 'version:' . $group;
        Cache::store(self::STORE)->increment($versionKey);

        Log::debug("Cache group invalidated: {$group}", ['keys_cleared' => count($keys)]);
    }

    /**
     * Invalidate multiple groups at once.
     */
    public static function invalidateGroups(array $groups): void
    {
        foreach ($groups as $group) {
            self::invalidateGroup($group);
        }
    }

    /**
     * Build a cache key for a user-scoped query.
     */
    public static function userKey(string $entity, int $userId, int $companyId, array $params = []): string
    {
        $parts = [$entity, "u{$userId}", "c{$companyId}"];
        if (!empty($params)) {
            ksort($params);
            $parts[] = md5(json_encode($params));
        }
        return implode(':', $parts);
    }

    /**
     * Build a cache key for a company-scoped query.
     */
    public static function companyKey(string $entity, int $companyId, array $params = []): string
    {
        $parts = [$entity, "c{$companyId}"];
        if (!empty($params)) {
            ksort($params);
            $parts[] = md5(json_encode($params));
        }
        return implode(':', $parts);
    }

    /**
     * Build a cache key for a public/shared query.
     */
    public static function publicKey(string $entity, array $params = []): string
    {
        $parts = [$entity, 'public'];
        if (!empty($params)) {
            ksort($params);
            $parts[] = md5(json_encode($params));
        }
        return implode(':', $parts);
    }

    /**
     * Register a cache key in a group index.
     */
    private static function registerInGroup(string $group, string $key): void
    {
        $groupKey = self::PREFIX . 'group_keys:' . $group;
        $keys = Cache::store(self::STORE)->get($groupKey, []);

        if (!in_array($key, $keys, true)) {
            $keys[] = $key;
            // Keep group index manageable — max 500 keys per group
            if (count($keys) > 500) {
                $keys = array_slice($keys, -400);
            }
            Cache::store(self::STORE)->put($groupKey, $keys, self::GROUP_INDEX_TTL);
        }
    }

    /**
     * Flush all LogiMarket cache (use sparingly).
     */
    public static function flushAll(): void
    {
        Cache::store(self::STORE)->flush();
        Log::warning('Full cache flush executed');
    }

    /**
     * Get cache statistics for monitoring.
     */
    public static function stats(): array
    {
        try {
            $redis = Cache::store(self::STORE)->getRedis()->connection('cache')->client();
            $info = $redis->info();

            return [
                'used_memory' => $info['used_memory_human'] ?? 'N/A',
                'connected_clients' => $info['connected_clients'] ?? 0,
                'total_keys' => $info['db1']['keys'] ?? 0,
                'hit_rate' => isset($info['keyspace_hits'], $info['keyspace_misses'])
                    ? round($info['keyspace_hits'] / max($info['keyspace_hits'] + $info['keyspace_misses'], 1) * 100, 2) . '%'
                    : 'N/A',
                'uptime_days' => round(($info['uptime_in_seconds'] ?? 0) / 86400, 1),
            ];
        } catch (\Throwable $e) {
            return ['error' => 'Redis not available: ' . $e->getMessage()];
        }
    }
}
