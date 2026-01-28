'use client';

// 页面缓存管理器，实现页面回退缓存机制

// 页面缓存项类型定义
export interface PageCacheItem {
  state: any; // 页面状态数据
  scrollPosition: number; // 滚动位置
  timestamp: number; // 缓存时间戳
  expiry: number; // 缓存过期时间（毫秒）
  metadata?: Record<string, any>; // 额外的元数据
}

// 页面缓存配置类型
export interface PageCacheConfig {
  defaultExpiry?: number; // 默认缓存过期时间（毫秒）
  maxCacheSize?: number; // 最大缓存大小
  enableScrollRestore?: boolean; // 是否启用滚动位置恢复
  enableStateCache?: boolean; // 是否启用状态缓存
  enableBackgroundRefresh?: boolean; // 是否启用后台刷新
}

// 默认缓存配置
const DEFAULT_CONFIG: Required<PageCacheConfig> = {
  defaultExpiry: 30 * 60 * 1000, // 默认30分钟
  maxCacheSize: 50, // 默认最多缓存50个页面
  enableScrollRestore: true,
  enableStateCache: true,
  enableBackgroundRefresh: true,
};

// 页面缓存类
class PageCache {
  // 缓存存储
  private cache: Map<string, PageCacheItem> = new Map();
  // 缓存配置
  private config: Required<PageCacheConfig>;
  // 页面导航监听
  private navigationListener: ((event: PopStateEvent) => void) | null = null;
  // 当前页面信息
  private currentPage: {
    key: string;
    scrollPosition: number;
  } | null = null;

  constructor(config: PageCacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initNavigationListener();
    this.initScrollListener();
  }

  // 初始化导航监听器
  private initNavigationListener() {
    if (typeof window === 'undefined') return;

    this.navigationListener = (event: PopStateEvent) => {
      // 检测回退导航
      if (event.state && event.state.navigationType === 'back') {
        const currentPath = window.location.pathname + window.location.search;
        const cacheKey = this.generateCacheKey(currentPath);
        this.restorePage(cacheKey);
      } else {
        // 保存当前页面状态
        this.saveCurrentPage();
      }
    };

    window.addEventListener('popstate', this.navigationListener);
    window.addEventListener('beforeunload', () => {
      this.saveCurrentPage();
    });
  }

  // 初始化滚动监听器
  private initScrollListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', () => {
      if (this.currentPage) {
        this.currentPage.scrollPosition = window.scrollY;
      }
    }, { passive: true });
  }

  // 生成缓存键
  public generateCacheKey(path: string): string {
    return `page_cache_${path.replace(/\//g, '_').replace(/\?/g, '_').replace(/=/g, '_').replace(/&/g, '_')}`;
  }

  // 保存当前页面状态
  public saveCurrentPage() {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname + window.location.search;
    const cacheKey = this.generateCacheKey(currentPath);
    
    // 获取当前页面状态（如果有）
    const pageState = this.getCurrentPageState();

    // 保存页面缓存
    this.savePage(cacheKey, pageState, window.scrollY);
  }

  // 获取当前页面状态（可由页面组件通过全局API设置）
  private currentPageState: any = null;

  // 设置当前页面状态
  public setPageState(state: any) {
    this.currentPageState = state;
  }

  // 获取当前页面状态
  private getCurrentPageState(): any {
    return this.currentPageState;
  }

  // 保存页面缓存
  public savePage(
    key: string,
    state: any,
    scrollPosition: number,
    metadata?: Record<string, any>
  ) {
    if (!this.config.enableStateCache && !this.config.enableScrollRestore) return;

    const cacheItem: PageCacheItem = {
      state,
      scrollPosition,
      timestamp: Date.now(),
      expiry: this.config.defaultExpiry,
      metadata,
    };

    // 保存到缓存
    this.cache.set(key, cacheItem);

    // 检查缓存大小
    this.enforceCacheSizeLimit();

    // 同时保存到localStorage，以便页面刷新后仍然有效
    this.saveToLocalStorage();
  }

  // 恢复页面缓存
  public restorePage(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;

    // 检查缓存是否过期
    if (Date.now() > cacheItem.timestamp + cacheItem.expiry) {
      this.cache.delete(key);
      return false;
    }

    // 恢复滚动位置
    if (this.config.enableScrollRestore && typeof window !== 'undefined') {
      window.scrollTo(0, cacheItem.scrollPosition);
    }

    // 恢复页面状态（通过回调或事件通知）
    if (this.config.enableStateCache && cacheItem.state) {
      this.notifyStateRestore(cacheItem.state);
    }

    return true;
  }

  // 通知状态恢复（可由页面组件监听）
  private stateRestoreListeners: Array<(state: any) => void> = [];

  // 添加状态恢复监听器
  public onStateRestore(listener: (state: any) => void) {
    this.stateRestoreListeners.push(listener);
    return () => {
      this.stateRestoreListeners = this.stateRestoreListeners.filter(l => l !== listener);
    };
  }

  // 通知状态恢复
  private notifyStateRestore(state: any) {
    this.stateRestoreListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('状态恢复监听器执行失败:', error);
      }
    });
  }

  // 检查缓存大小限制
  private enforceCacheSizeLimit() {
    if (this.cache.size > this.config.maxCacheSize) {
      // 按时间戳排序，删除最旧的缓存
      const sortedCache = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = sortedCache.slice(0, this.cache.size - this.config.maxCacheSize);
      toDelete.forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  // 保存到localStorage
  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('page_cache_data', JSON.stringify(cacheData));
    } catch (error) {
      console.error('保存页面缓存到localStorage失败:', error);
    }
  }

  // 从localStorage加载
  public loadFromLocalStorage() {
    if (typeof window === 'undefined') return;

    try {
      const cachedData = localStorage.getItem('page_cache_data');
      if (cachedData) {
        const cacheEntries = JSON.parse(cachedData) as Array<[string, PageCacheItem]>;
        
        // 过滤过期的缓存
        const now = Date.now();
        const validEntries = cacheEntries.filter(([_, item]) => 
          now <= item.timestamp + item.expiry
        );

        this.cache = new Map(validEntries);
        this.enforceCacheSizeLimit();
      }
    } catch (error) {
      console.error('从localStorage加载页面缓存失败:', error);
    }
  }

  // 获取页面缓存
  public getPageCache(key: string): PageCacheItem | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;

    // 检查缓存是否过期
    if (Date.now() > cacheItem.timestamp + cacheItem.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cacheItem;
  }

  // 删除页面缓存
  public deletePageCache(key: string): void {
    this.cache.delete(key);
    this.saveToLocalStorage();
  }

  // 清除所有页面缓存
  public clearAllCache(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('page_cache_data');
    }
  }

  // 获取缓存大小
  public getCacheSize(): number {
    return this.cache.size;
  }

  // 检查页面是否有缓存
  public hasCache(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;

    // 检查缓存是否过期
    return Date.now() <= cacheItem.timestamp + cacheItem.expiry;
  }

  // 为特定路径生成缓存键并检查
  public hasPathCache(path: string): boolean {
    const key = this.generateCacheKey(path);
    return this.hasCache(key);
  }

  // 为特定路径生成缓存键并获取
  public getPathCache(path: string): PageCacheItem | null {
    const key = this.generateCacheKey(path);
    return this.getPageCache(key);
  }

  // 为特定路径生成缓存键并保存
  public savePathCache(
    path: string,
    state: any,
    scrollPosition: number,
    metadata?: Record<string, any>
  ): void {
    const key = this.generateCacheKey(path);
    this.savePage(key, state, scrollPosition, metadata);
  }

  // 为特定路径生成缓存键并删除
  public deletePathCache(path: string): void {
    const key = this.generateCacheKey(path);
    this.deletePageCache(key);
  }

  // 更新缓存配置
  public updateConfig(config: PageCacheConfig): void {
    this.config = { ...this.config, ...config };
  }

  // 销毁实例（清理监听器）
  public destroy(): void {
    if (typeof window !== 'undefined' && this.navigationListener) {
      window.removeEventListener('popstate', this.navigationListener);
      window.removeEventListener('beforeunload', () => {
        this.saveCurrentPage();
      });
    }
  }
}

// 导出单例实例
const pageCacheInstance = new PageCache();

// 页面加载时从localStorage加载缓存
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    pageCacheInstance.loadFromLocalStorage();
  });
}

// 导出页面缓存实例
export const pageCache = pageCacheInstance;

// 导出工具函数
export const savePageState = (state: any) => {
  pageCache.setPageState(state);
  pageCache.saveCurrentPage();
};

export const getPageCache = (path: string) => {
  return pageCache.getPathCache(path);
};

export const hasPageCache = (path: string) => {
  return pageCache.hasPathCache(path);
};

export const deletePageCache = (path: string) => {
  pageCache.deletePathCache(path);
};

export const clearAllPageCache = () => {
  pageCache.clearAllCache();
};

export const onPageStateRestore = (listener: (state: any) => void) => {
  return pageCache.onStateRestore(listener);
};

// 导出默认实例
export default pageCacheInstance;
