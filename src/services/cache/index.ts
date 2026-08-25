import { CacheEntry } from '@/types';
import { CACHE_CONFIG } from '@/constants';
import { CompressionService } from '@/services/compression';

/**
 * LRU (Least Recently Used) Cache Manager
 * Implements an in-memory cache with automatic eviction of least-used items
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private accessOrder: string[] = [];
  private totalSize: number = 0;

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.delete(key);
      return null;
    }

    // Update access order (move to end)
    this.updateAccessOrder(key);
    return entry.value;
  }

  /**
   * Set value in cache with automatic compression
   */
  set(key: string, value: T, ttl: number = CACHE_CONFIG.ttl): void {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const compressed = CompressionService.compress(stringValue);
    const size = CompressionService.getSize(compressed);

    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.totalSize -= this.cache.get(key)!.size;
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      size,
    };

    this.cache.set(key, entry);
    this.totalSize += size;
    this.updateAccessOrder(key);

    // Evict if size exceeds limit
    this.evictIfNeeded();
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.totalSize -= entry.size;
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    return true;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.totalSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      totalSize: this.totalSize,
      maxSize: CACHE_CONFIG.maxSize,
      usagePercentage: ((this.totalSize / CACHE_CONFIG.maxSize) * 100).toFixed(2),
    };
  }

  /**
   * Update access order (LRU logic)
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Evict least recently used items
   */
  private evictIfNeeded(): void {
    while (this.totalSize > CACHE_CONFIG.maxSize && this.cache.size > 0) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.delete(lruKey);
      }
    }

    // Also evict if too many entries
    while (this.cache.size > CACHE_CONFIG.maxEntries) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.delete(lruKey);
      }
    }
  }
}

/**
 * Global cache instance for chapters and content
 */
export const chapterCache = new LRUCache<string>();
export const contentCache = new LRUCache<any>();
