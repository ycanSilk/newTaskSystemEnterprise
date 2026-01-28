'use client';

// 开发工具，提供缓存管理和性能分析工具

// 导入核心工具
import globalFetchInstance from '@/utils/globalFetch';
import pageCacheInstance from '@/utils/pageCache';
import refreshStrategyInstance from '@/utils/refreshStrategy';

// 性能指标类型
export interface PerformanceMetrics {
  // 页面加载
  navigationStart: number;
  domContentLoaded: number;
  loadEventEnd: number;
  
  // API请求
  apiRequestCount: number;
  apiRequestTime: number;
  apiCacheHitRate: number;
  
  // 缓存
  cacheSize: number;
  cacheHitCount: number;
  cacheMissCount: number;
  
  // 内存
  memoryUsage: number;
  
  // 其他
  timestamp: number;
}

// 开发工具类
class OptimizationTools {
  // 性能指标
  private performanceMetrics: PerformanceMetrics = {
    navigationStart: 0,
    domContentLoaded: 0,
    loadEventEnd: 0,
    apiRequestCount: 0,
    apiRequestTime: 0,
    apiCacheHitRate: 0,
    cacheSize: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    memoryUsage: 0,
    timestamp: Date.now(),
  };

  // 初始化性能监控
  public initPerformanceMonitoring() {
    if (typeof window === 'undefined' || !performance) return;

    // 记录导航开始时间
    this.performanceMetrics.navigationStart = performance.timing.navigationStart;

    // 监听DOM内容加载完成
    window.addEventListener('DOMContentLoaded', () => {
      this.performanceMetrics.domContentLoaded = performance.now();
      this.logPerformanceMetrics();
    });

    // 监听页面加载完成
    window.addEventListener('load', () => {
      this.performanceMetrics.loadEventEnd = performance.now();
      this.logPerformanceMetrics();
    });

    console.log('🔧 性能监控已初始化');
  }

  // 获取性能指标
  public getPerformanceMetrics(): PerformanceMetrics {
    // 更新缓存相关指标
    this.performanceMetrics.cacheSize = globalFetchInstance.getCacheSize();
    this.performanceMetrics.timestamp = Date.now();

    // 尝试获取内存使用情况
    if (typeof window !== 'undefined' && (window as any).performance && (window as any).performance.memory) {
      this.performanceMetrics.memoryUsage = (window as any).performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    return { ...this.performanceMetrics };
  }

  // 记录API请求
  public recordApiRequest(duration: number, cacheHit: boolean) {
    this.performanceMetrics.apiRequestCount++;
    this.performanceMetrics.apiRequestTime += duration;

    if (cacheHit) {
      this.performanceMetrics.cacheHitCount++;
    } else {
      this.performanceMetrics.cacheMissCount++;
    }

    // 更新缓存命中率
    const totalRequests = this.performanceMetrics.cacheHitCount + this.performanceMetrics.cacheMissCount;
    if (totalRequests > 0) {
      this.performanceMetrics.apiCacheHitRate = this.performanceMetrics.cacheHitCount / totalRequests;
    }
  }

  // 记录性能指标
  public logPerformanceMetrics() {
    const metrics = this.getPerformanceMetrics();
    
    console.log('📊 性能指标:', {
      // 页面加载
      pageLoadTime: metrics.loadEventEnd - metrics.navigationStart,
      domContentLoadedTime: metrics.domContentLoaded - metrics.navigationStart,
      
      // API请求
      apiRequestCount: metrics.apiRequestCount,
      avgApiRequestTime: metrics.apiRequestCount > 0 ? metrics.apiRequestTime / metrics.apiRequestCount : 0,
      apiCacheHitRate: (metrics.apiCacheHitRate * 100).toFixed(2) + '%',
      
      // 缓存
      cacheSize: metrics.cacheSize,
      cacheHitCount: metrics.cacheHitCount,
      cacheMissCount: metrics.cacheMissCount,
      
      // 内存
      memoryUsage: metrics.memoryUsage.toFixed(2) + ' MB',
      
      timestamp: new Date(metrics.timestamp).toISOString(),
    });
  }

  // 缓存管理工具
  public getCacheInfo() {
    return {
      // 全局fetch缓存
      globalFetchCache: {
        size: globalFetchInstance.getCacheSize(),
      },
      
      // 页面缓存
      pageCache: {
        size: pageCacheInstance.getCacheSize(),
      },
      
      // 刷新策略
      refreshStrategy: {
        taskCount: refreshStrategyInstance.getAllTasks().length,
      },
    };
  }

  // 清除所有缓存
  public clearAllCache() {
    console.log('🔧 清除所有缓存');
    
    // 清除全局fetch缓存
    globalFetchInstance.clearCache();
    
    // 清除页面缓存
    pageCacheInstance.clearAllCache();
    
    console.log('✅ 所有缓存已清除');
  }

  // 导出性能数据
  public exportPerformanceData() {
    const data = {
      performance: this.getPerformanceMetrics(),
      cache: this.getCacheInfo(),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimization-performance-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('📥 性能数据已导出');
  }

  // 生成优化建议
  public generateOptimizationSuggestions() {
    const metrics = this.getPerformanceMetrics();
    const suggestions: string[] = [];

    // 页面加载时间检查
    const pageLoadTime = metrics.loadEventEnd - metrics.navigationStart;
    if (pageLoadTime > 3000) {
      suggestions.push('⚠️ 页面加载时间过长（超过3秒），建议优化首屏资源加载');
    }

    // API请求时间检查
    const avgApiTime = metrics.apiRequestCount > 0 ? metrics.apiRequestTime / metrics.apiRequestCount : 0;
    if (avgApiTime > 1000) {
      suggestions.push('⚠️ API请求平均时间过长（超过1秒），建议优化API响应速度');
    }

    // 缓存命中率检查
    if (metrics.apiCacheHitRate < 0.5) {
      suggestions.push('⚠️ 缓存命中率过低（低于50%），建议增加缓存策略');
    }

    // 缓存大小检查
    if (metrics.cacheSize > 100) {
      suggestions.push('⚠️ 缓存大小过大（超过100项），建议设置缓存大小限制');
    }

    // 内存使用检查
    if (metrics.memoryUsage > 500) {
      suggestions.push('⚠️ 内存使用过高（超过500MB），建议检查内存泄漏');
    }

    // 输出建议
    if (suggestions.length > 0) {
      console.log('💡 优化建议:');
      suggestions.forEach(suggestion => {
        console.log('  ' + suggestion);
      });
    } else {
      console.log('✅ 性能指标良好，继续保持！');
    }

    return suggestions;
  }

  // 监控模式
  public startMonitoringMode() {
    console.log('🔍 监控模式已启动');

    // 定期记录性能指标
    const interval = setInterval(() => {
      this.logPerformanceMetrics();
      this.generateOptimizationSuggestions();
    }, 5000); // 每5秒记录一次

    return () => clearInterval(interval);
  }

  // 调试工具
  public debugCache() {
    console.log('🔧 缓存调试信息:');
    console.log('全局fetch缓存大小:', globalFetchInstance.getCacheSize());
    console.log('页面缓存大小:', pageCacheInstance.getCacheSize());
    console.log('刷新任务数量:', refreshStrategyInstance.getAllTasks().length);
  }

  // 模拟网络延迟
  public simulateNetworkDelay(delay: number) {
    console.log(`⏱ 模拟网络延迟: ${delay}ms`);
    
    // 保存原始fetch
    const originalFetch = window.fetch;
    
    // 重写fetch
    window.fetch = async (url, options) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return originalFetch(url, options);
    };

    return () => {
      window.fetch = originalFetch;
      console.log('✅ 网络延迟模拟已关闭');
    };
  }

  // 模拟缓存失效
  public simulateCacheInvalidation() {
    console.log('🔄 模拟缓存失效');
    
    // 清除所有缓存
    this.clearAllCache();
    
    // 触发刷新
    refreshStrategyInstance.refreshAllTasks();
    
    console.log('✅ 缓存失效模拟完成');
  }
}

// 导出单例实例
const optimizationToolsInstance = new OptimizationTools();

// 导出开发工具
export const optimizationTools = optimizationToolsInstance;

// 导出工具函数
export const initPerformanceMonitoring = () => optimizationTools.initPerformanceMonitoring();
export const getPerformanceMetrics = () => optimizationTools.getPerformanceMetrics();
export const logPerformanceMetrics = () => optimizationTools.logPerformanceMetrics();
export const exportPerformanceData = () => optimizationTools.exportPerformanceData();
export const generateOptimizationSuggestions = () => optimizationTools.generateOptimizationSuggestions();
export const startMonitoringMode = () => optimizationTools.startMonitoringMode();
export const debugCache = () => optimizationTools.debugCache();
export const clearAllCache = () => optimizationTools.clearAllCache();
export const simulateNetworkDelay = (delay: number) => optimizationTools.simulateNetworkDelay(delay);
export const simulateCacheInvalidation = () => optimizationTools.simulateCacheInvalidation();

// 开发模式自动初始化
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 延迟初始化，避免影响页面加载
  setTimeout(() => {
    optimizationTools.initPerformanceMonitoring();
    console.log('🔧 开发工具已初始化');
  }, 1000);
}

// 导出默认实例
export default optimizationToolsInstance;

// 全局调试工具（仅开发模式）
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).optimizationTools = optimizationTools;
  console.log('🔧 全局调试工具已添加到window.optimizationTools');
}
