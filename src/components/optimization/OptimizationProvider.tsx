'use client';

import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

// 导入核心工具
import globalFetchInstance, { globalFetch, GlobalFetchConfig } from '@/utils/globalFetch';
import pageCacheInstance, { PageCacheConfig } from '@/utils/pageCache';
import refreshStrategyInstance, { RefreshStrategyConfig } from '@/utils/refreshStrategy';

// 优化配置类型
export interface OptimizationConfig {
  globalFetch?: GlobalFetchConfig;
  pageCache?: PageCacheConfig;
  refreshStrategy?: RefreshStrategyConfig;
  enablePerformanceMonitoring?: boolean;
  enableDevelopmentMode?: boolean;
}

// 优化上下文类型
interface OptimizationContextType {
  // 核心工具实例
  globalFetch: typeof globalFetch;
  pageCache: typeof pageCacheInstance;
  refreshStrategy: typeof refreshStrategyInstance;
  
  // 工具函数
  savePageState: (state: any) => void;
  addRefreshTask: (id: string, callback: () => Promise<void> | void, options?: any) => void;
  removeRefreshTask: (id: string) => void;
  refreshTask: (id: string) => void;
  refreshAllTasks: () => void;
  
  // 状态
  isOptimized: boolean;
  performanceMetrics: Record<string, number>;
  
  // 配置
  config: OptimizationConfig;
  updateConfig: (config: OptimizationConfig) => void;
}

// 创建优化上下文
const OptimizationContext = createContext<OptimizationContextType | undefined>(undefined);

// 优化提供者组件属性类型
interface OptimizationProviderProps {
  children: ReactNode;
  config?: OptimizationConfig;
}

// 优化提供者组件
export function OptimizationProvider({ children, config = {} }: OptimizationProviderProps) {
  // 状态
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number>>({});
  const [currentConfig, setCurrentConfig] = useState<OptimizationConfig>(config);

  // 初始化优化工具
  useEffect(() => {
    // 标记优化已启用
    setIsOptimized(true);

    // 启用开发模式日志
    if (currentConfig.enableDevelopmentMode && process.env.NODE_ENV === 'development') {
      console.log('🔧 优化提供者已初始化', {
        config: currentConfig,
        timestamp: new Date().toISOString(),
      });
    }

    // 启用性能监控
    if (currentConfig.enablePerformanceMonitoring) {
      startPerformanceMonitoring();
    }

    // 清理函数
    return () => {
      // 清理性能监控
      if (currentConfig.enablePerformanceMonitoring) {
        stopPerformanceMonitoring();
      }

      // 清理优化工具
      if (currentConfig.enableDevelopmentMode && process.env.NODE_ENV === 'development') {
        console.log('🔧 优化提供者已清理');
      }
    };
  }, [currentConfig]);

  // 性能监控
  const startPerformanceMonitoring = () => {
    if (typeof window === 'undefined') return;

    // 监控页面加载时间
    if (performance && performance.mark) {
      performance.mark('optimization_start');

      // 监听页面加载完成
      window.addEventListener('load', () => {
        performance.mark('optimization_load');
        performance.measure('page_load_time', 'optimization_start', 'optimization_load');

        const measures = performance.getEntriesByName('page_load_time');
        if (measures.length > 0) {
          setPerformanceMetrics(prev => ({
            ...prev,
            pageLoadTime: measures[0].duration,
          }));
        }
      });

      // 监听首屏渲染完成
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          performance.mark('optimization_first_paint');
          performance.measure('first_paint_time', 'optimization_start', 'optimization_first_paint');

          const measures = performance.getEntriesByName('first_paint_time');
          if (measures.length > 0) {
            setPerformanceMetrics(prev => ({
              ...prev,
              firstPaintTime: measures[0].duration,
            }));
          }
        });
      }
    }
  };

  const stopPerformanceMonitoring = () => {
    // 清理性能监控资源
    if (typeof window !== 'undefined' && performance && performance.clearMarks) {
      performance.clearMarks('optimization_start');
      performance.clearMarks('optimization_load');
      performance.clearMarks('optimization_first_paint');
      performance.clearMeasures('page_load_time');
      performance.clearMeasures('first_paint_time');
    }
  };

  // 工具函数
  const savePageState = (state: any) => {
    pageCacheInstance.setPageState(state);
    pageCacheInstance.saveCurrentPage();
  };

  const addRefreshTask = (id: string, callback: () => Promise<void> | void, options?: any) => {
    refreshStrategyInstance.addTask(id, callback, options);
  };

  const removeRefreshTask = (id: string) => {
    refreshStrategyInstance.removeTask(id);
  };

  const refreshTask = (id: string) => {
    refreshStrategyInstance.refreshTask(id);
  };

  const refreshAllTasks = () => {
    refreshStrategyInstance.refreshAllTasks();
  };

  const updateConfig = (newConfig: OptimizationConfig) => {
    setCurrentConfig(prev => ({ ...prev, ...newConfig }));
  };

  // 上下文值
  const contextValue = useMemo<OptimizationContextType>(() => ({
    // 核心工具实例
    globalFetch: globalFetch,
    pageCache: pageCacheInstance,
    refreshStrategy: refreshStrategyInstance,
    
    // 工具函数
    savePageState,
    addRefreshTask,
    removeRefreshTask,
    refreshTask,
    refreshAllTasks,
    
    // 状态
    isOptimized,
    performanceMetrics,
    
    // 配置
    config: currentConfig,
    updateConfig,
  }), [isOptimized, performanceMetrics, currentConfig]);

  return (
    <OptimizationContext.Provider value={contextValue}>
      {children}
    </OptimizationContext.Provider>
  );
}

// 自定义Hook，用于访问优化上下文
export function useOptimization(): OptimizationContextType {
  const context = useContext(OptimizationContext);
  if (context === undefined) {
    throw new Error('useOptimization must be used within an OptimizationProvider');
  }
  return context;
}

// 导出工具Hook
export function useGlobalFetch() {
  const { globalFetch } = useOptimization();
  return globalFetch;
}

export function usePageCache() {
  const { pageCache } = useOptimization();
  return pageCache;
}

export function useRefreshStrategy() {
  const { refreshStrategy } = useOptimization();
  return refreshStrategy;
}

// 导出默认组件
export default OptimizationProvider;
