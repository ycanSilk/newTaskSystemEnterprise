'use client';

// API缓存工具，用于处理API请求缓存、重复请求拦截和缓存失效机制

// 缓存项类型定义
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// 缓存配置类型
interface CacheConfig {
  expiry?: number; // 缓存过期时间（毫秒）
  enableCache?: boolean; // 是否启用缓存
  enableDeduplication?: boolean; // 是否启用重复请求去重
}

// 默认缓存配置
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  expiry: 5 * 60 * 1000, // 默认5分钟
  enableCache: true,
  enableDeduplication: true,
};

// API缓存类
class ApiCache {
  // 缓存存储
  private cache: Map<string, CacheItem<any>> = new Map();
  // 正在进行的请求
  private pendingRequests: Map<string, Promise<any>> = new Map();
  // 缓存键前缀
  private cacheKeyPrefix = 'api_cache_';

  // 生成缓存键
  private generateCacheKey(url: string, options?: RequestInit): string {
    const { method = 'GET', body } = options || {};
    const keyParts = [url, method];
    
    // 如果有请求体，也加入缓存键
    if (body) {
      keyParts.push(typeof body === 'string' ? body : JSON.stringify(body));
    }
    
    // 生成哈希值作为缓存键
    const hash = this.generateHash(keyParts.join('|'));
    return `${this.cacheKeyPrefix}${hash}`;
  }

  // 生成简单的哈希值
  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // 检查缓存是否有效
  private isCacheValid(cacheItem: CacheItem<any>): boolean {
    return Date.now() < cacheItem.timestamp + cacheItem.expiry;
  }

  // 从缓存获取数据
  private getFromCache<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;
    
    if (this.isCacheValid(cacheItem)) {
      return cacheItem.data;
    }
    
    // 缓存过期，移除
    this.cache.delete(key);
    return null;
  }

  // 设置缓存
  private setCache<T>(key: string, data: T, expiry: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  // 清除缓存
  public clearCache(pattern?: string): void {
    if (pattern) {
      // 清除匹配模式的缓存
      Array.from(this.cache.keys()).forEach((key) => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      // 清除所有缓存
      this.cache.clear();
    }
  }

  // 执行API请求
  public async fetch<T>(
    url: string,
    options?: RequestInit,
    config: CacheConfig = {}
  ): Promise<T> {
    // 合并配置
    const mergedConfig = { ...DEFAULT_CACHE_CONFIG, ...config };
    const { expiry, enableCache, enableDeduplication } = mergedConfig;

    // 生成缓存键
    const cacheKey = this.generateCacheKey(url, options);

    // 检查缓存
    if (enableCache) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // 检查是否有正在进行的相同请求
    if (enableDeduplication && this.pendingRequests.has(cacheKey)) {
      const pendingRequest = this.pendingRequests.get(cacheKey);
      if (pendingRequest) {
        return pendingRequest;
      }
    }

    // 创建新的请求
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          ...options,
          credentials: 'include', // 确保携带cookie
        });

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 缓存响应数据
        if (enableCache) {
          this.setCache(cacheKey, data, expiry);
        }

        return data;
      } finally {
        // 请求完成后移除
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // 存储请求
    if (enableDeduplication) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  // 使缓存失效
  public invalidateCache(pattern: string): void {
    this.clearCache(pattern);
  }

  // 获取缓存大小
  public getCacheSize(): number {
    return this.cache.size;
  }
}

// 导出单例实例
export const apiCache = new ApiCache();

// 导出工具函数
export const fetchWithCache = <T>(
  url: string,
  options?: RequestInit,
  config?: CacheConfig
): Promise<T> => {
  return apiCache.fetch<T>(url, options, config);
};

// 导出缓存失效函数
export const invalidateCache = (pattern: string): void => {
  apiCache.invalidateCache(pattern);
};

// 导出清除所有缓存函数
export const clearAllCache = (): void => {
  apiCache.clearCache();
};
