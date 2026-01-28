'use client';

// 全局fetch包装器，实现API请求缓存机制

// 缓存项类型定义
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// 缓存配置类型
export interface GlobalFetchConfig {
  expiry?: number; // 缓存过期时间（毫秒）
  enableCache?: boolean; // 是否启用缓存
  enableDeduplication?: boolean; // 是否启用重复请求去重
  enableDebounce?: boolean; // 是否启用请求防抖
  debounceTime?: number; // 防抖时间（毫秒）
  enableRetry?: boolean; // 是否启用自动重试
  retryCount?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

// 默认缓存配置
const DEFAULT_CONFIG: Required<GlobalFetchConfig> = {
  expiry: 5 * 60 * 1000, // 默认5分钟
  enableCache: true,
  enableDeduplication: true,
  enableDebounce: true,
  debounceTime: 300, // 默认300ms
  enableRetry: true,
  retryCount: 3, // 默认重试3次
  retryDelay: 1000, // 默认重试延迟1秒
};

// API缓存类
class GlobalFetch {
  // 缓存存储
  private cache: Map<string, CacheItem<any>> = new Map();
  // 正在进行的请求
  private pendingRequests: Map<string, Promise<any>> = new Map();
  // 防抖定时器
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  // 缓存键前缀
  private cacheKeyPrefix = 'global_fetch_cache_';

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

  // 使缓存失效
  public invalidateCache(pattern: string): void {
    this.clearCache(pattern);
  }

  // 获取缓存大小
  public getCacheSize(): number {
    return this.cache.size;
  }

  // 执行API请求
  public async fetch<T>(
    url: string,
    options?: RequestInit,
    config: GlobalFetchConfig = {}
  ): Promise<T> {
    // 合并配置
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const { 
      expiry, 
      enableCache, 
      enableDeduplication, 
      enableDebounce, 
      debounceTime,
      enableRetry,
      retryCount,
      retryDelay
    } = mergedConfig;

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

    // 处理防抖
    if (enableDebounce) {
      return new Promise((resolve, reject) => {
        // 清除之前的定时器
        if (this.debounceTimers.has(cacheKey)) {
          clearTimeout(this.debounceTimers.get(cacheKey)!);
        }

        // 设置新的定时器
        const timer = setTimeout(async () => {
          this.debounceTimers.delete(cacheKey);
          
          try {
            const result = await this.executeRequest<T>(url, options, cacheKey, mergedConfig);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, debounceTime);

        this.debounceTimers.set(cacheKey, timer);
      });
    }

    // 直接执行请求
    return this.executeRequest<T>(url, options, cacheKey, mergedConfig);
  }

  // 执行实际请求（带重试机制）
  private async executeRequest<T>(
    url: string,
    options?: RequestInit,
    cacheKey?: string,
    config?: Required<GlobalFetchConfig>
  ): Promise<T> {
    const { enableCache, enableDeduplication, enableRetry, retryCount, retryDelay, expiry } = config || DEFAULT_CONFIG;

    // 创建请求函数
    const requestFn = async (attempt: number = 0): Promise<T> => {
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
        if (enableCache && cacheKey) {
          this.setCache(cacheKey, data, expiry);
        }

        return data;
      } catch (error) {
        // 处理重试
        if (enableRetry && attempt < retryCount) {
          console.warn(`请求失败，${retryDelay}ms后重试 (${attempt + 1}/${retryCount})`, error);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return requestFn(attempt + 1);
        }
        throw error;
      }
    };

    // 创建请求Promise
    const requestPromise = requestFn();

    // 存储正在进行的请求
    if (enableDeduplication && cacheKey) {
      this.pendingRequests.set(cacheKey, requestPromise);

      // 请求完成后移除
      requestPromise.finally(() => {
        if (cacheKey) {
          this.pendingRequests.delete(cacheKey);
        }
      });
    }

    return requestPromise;
  }

  // 清除所有状态
  public clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// 导出单例实例
const globalFetchInstance = new GlobalFetch();

// 导出全局fetch函数
export const globalFetch = <T>(
  url: string,
  options?: RequestInit,
  config?: GlobalFetchConfig
): Promise<T> => {
  return globalFetchInstance.fetch<T>(url, options, config);
};

// 导出缓存管理函数
export const invalidateGlobalCache = (pattern: string): void => {
  globalFetchInstance.invalidateCache(pattern);
};

export const clearGlobalCache = (pattern?: string): void => {
  globalFetchInstance.clearCache(pattern);
};

export const getGlobalCacheSize = (): number => {
  return globalFetchInstance.getCacheSize();
};

export const clearAllGlobalState = (): void => {
  globalFetchInstance.clearAll();
};

// 导出默认实例
export default globalFetchInstance;
