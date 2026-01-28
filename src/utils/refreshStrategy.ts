'use client';

// 刷新策略管理器，实现全局被动刷新策略

// 刷新任务类型定义
export interface RefreshTask {
  id: string; // 任务ID
  callback: () => Promise<void> | void; // 刷新回调函数
  interval?: number; // 轮询间隔（毫秒）
  enabled?: boolean; // 是否启用
  lastExecuted?: number; // 上次执行时间
  debounceTime?: number; // 防抖时间（毫秒）
  metadata?: Record<string, any>; // 额外的元数据
}

// 刷新策略配置类型
export interface RefreshStrategyConfig {
  defaultInterval?: number; // 默认轮询间隔（毫秒）
  defaultDebounceTime?: number; // 默认防抖时间（毫秒）
  enablePageVisibilityRefresh?: boolean; // 是否启用页面可见性刷新
  enableGlobalPolling?: boolean; // 是否启用全局轮询
  maxConcurrentTasks?: number; // 最大并发任务数
}

// 默认配置
const DEFAULT_CONFIG: Required<RefreshStrategyConfig> = {
  defaultInterval: 60000, // 默认60秒
  defaultDebounceTime: 300, // 默认300ms
  enablePageVisibilityRefresh: true,
  enableGlobalPolling: true,
  maxConcurrentTasks: 10, // 默认最多10个并发任务
};

// 刷新策略类
class RefreshStrategy {
  // 刷新任务
  private tasks: Map<string, RefreshTask> = new Map();
  // 轮询定时器
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map();
  // 防抖定时器
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  // 配置
  private config: Required<RefreshStrategyConfig>;
  // 页面可见性监听器
  private visibilityListener: ((event: Event) => void) | null = null;
  // 正在执行的任务
  private runningTasks: Set<string> = new Set();

  constructor(config: RefreshStrategyConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initVisibilityListener();
  }

  // 初始化页面可见性监听器
  private initVisibilityListener() {
    if (typeof window === 'undefined' || !this.config.enablePageVisibilityRefresh) return;

    this.visibilityListener = (event: Event) => {
      if (document.visibilityState === 'visible') {
        this.refreshAllTasks();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityListener);
  }

  // 添加刷新任务
  public addTask(
    id: string,
    callback: () => Promise<void> | void,
    options?: Partial<Omit<RefreshTask, 'id' | 'callback'>>
  ): void {
    const task: RefreshTask = {
      id,
      callback,
      interval: options?.interval || this.config.defaultInterval,
      enabled: options?.enabled ?? true,
      lastExecuted: 0,
      debounceTime: options?.debounceTime || this.config.defaultDebounceTime,
      metadata: options?.metadata,
    };

    this.tasks.set(id, task);

    // 如果启用了轮询，启动轮询
    if (task.enabled && this.config.enableGlobalPolling) {
      this.startPolling(id);
    }
  }

  // 移除刷新任务
  public removeTask(id: string): void {
    // 清除轮询定时器
    if (this.pollingTimers.has(id)) {
      clearInterval(this.pollingTimers.get(id)!);
      this.pollingTimers.delete(id);
    }

    // 清除防抖定时器
    if (this.debounceTimers.has(id)) {
      clearTimeout(this.debounceTimers.get(id)!);
      this.debounceTimers.delete(id);
    }

    // 移除任务
    this.tasks.delete(id);
    this.runningTasks.delete(id);
  }

  // 启动轮询
  private startPolling(id: string): void {
    const task = this.tasks.get(id);
    if (!task || !task.enabled) return;

    // 清除之前的定时器
    if (this.pollingTimers.has(id)) {
      clearInterval(this.pollingTimers.get(id)!);
    }

    // 设置新的定时器
    const timer = setInterval(() => {
      this.executeTask(id);
    }, task.interval);

    this.pollingTimers.set(id, timer);
  }

  // 停止轮询
  public stopPolling(id: string): void {
    if (this.pollingTimers.has(id)) {
      clearInterval(this.pollingTimers.get(id)!);
      this.pollingTimers.delete(id);
    }
  }

  // 执行任务
  private async executeTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task || !task.enabled) return;

    // 检查是否已经在执行
    if (this.runningTasks.has(id)) return;

    // 检查并发任务数
    if (this.runningTasks.size >= this.config.maxConcurrentTasks) return;

    this.runningTasks.add(id);

    try {
      await task.callback();
      task.lastExecuted = Date.now();
    } catch (error) {
      console.error(`刷新任务执行失败 (${id}):`, error);
    } finally {
      this.runningTasks.delete(id);
    }
  }

  // 执行任务（带防抖）
  public executeTaskWithDebounce(id: string): void {
    const task = this.tasks.get(id);
    if (!task || !task.enabled) return;

    // 清除之前的定时器
    if (this.debounceTimers.has(id)) {
      clearTimeout(this.debounceTimers.get(id)!);
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.debounceTimers.delete(id);
      this.executeTask(id);
    }, task.debounceTime);

    this.debounceTimers.set(id, timer);
  }

  // 刷新所有任务
  public refreshAllTasks(): void {
    Array.from(this.tasks.keys()).forEach(id => {
      this.executeTaskWithDebounce(id);
    });
  }

  // 刷新指定任务
  public refreshTask(id: string): void {
    this.executeTaskWithDebounce(id);
  }

  // 启用任务
  public enableTask(id: string): void {
    const task = this.tasks.get(id);
    if (!task) return;

    task.enabled = true;

    // 启动轮询
    if (this.config.enableGlobalPolling) {
      this.startPolling(id);
    }
  }

  // 禁用任务
  public disableTask(id: string): void {
    const task = this.tasks.get(id);
    if (!task) return;

    task.enabled = false;

    // 停止轮询
    this.stopPolling(id);
  }

  // 检查任务是否存在
  public hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  // 获取任务
  public getTask(id: string): RefreshTask | undefined {
    return this.tasks.get(id);
  }

  // 获取所有任务
  public getAllTasks(): RefreshTask[] {
    return Array.from(this.tasks.values());
  }

  // 更新任务配置
  public updateTask(id: string, updates: Partial<RefreshTask>): void {
    const task = this.tasks.get(id);
    if (!task) return;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);

    // 如果更新了轮询间隔，重启轮询
    if (updates.interval && updatedTask.enabled) {
      this.startPolling(id);
    }
  }

  // 更新全局配置
  public updateConfig(config: RefreshStrategyConfig): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };

    // 如果启用状态发生变化，重新初始化监听器
    if (oldConfig.enablePageVisibilityRefresh !== this.config.enablePageVisibilityRefresh) {
      if (this.visibilityListener) {
        document.removeEventListener('visibilitychange', this.visibilityListener);
        this.visibilityListener = null;
      }
      this.initVisibilityListener();
    }

    // 如果全局轮询状态发生变化，重启所有轮询
    if (oldConfig.enableGlobalPolling !== this.config.enableGlobalPolling) {
      Array.from(this.tasks.keys()).forEach(id => {
        const task = this.tasks.get(id);
        if (task && task.enabled) {
          if (this.config.enableGlobalPolling) {
            this.startPolling(id);
          } else {
            this.stopPolling(id);
          }
        }
      });
    }
  }

  // 获取配置
  public getConfig(): Required<RefreshStrategyConfig> {
    return { ...this.config };
  }

  // 清除所有任务
  public clearAllTasks(): void {
    // 清除所有定时器
    Array.from(this.pollingTimers.values()).forEach(timer => {
      clearInterval(timer);
    });

    Array.from(this.debounceTimers.values()).forEach(timer => {
      clearTimeout(timer);
    });

    // 清空所有状态
    this.tasks.clear();
    this.pollingTimers.clear();
    this.debounceTimers.clear();
    this.runningTasks.clear();
  }

  // 获取运行状态
  public getStatus(): {
    taskCount: number;
    runningTaskCount: number;
    pollingTaskCount: number;
  } {
    return {
      taskCount: this.tasks.size,
      runningTaskCount: this.runningTasks.size,
      pollingTaskCount: this.pollingTimers.size,
    };
  }

  // 销毁实例
  public destroy(): void {
    // 清除监听器
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }

    // 清除所有任务
    this.clearAllTasks();
  }
}

// 导出单例实例
const refreshStrategyInstance = new RefreshStrategy();

// 导出刷新策略实例
export const refreshStrategy = refreshStrategyInstance;

// 导出工具函数
export const addRefreshTask = (
  id: string,
  callback: () => Promise<void> | void,
  options?: Partial<Omit<RefreshTask, 'id' | 'callback'>>
) => {
  refreshStrategy.addTask(id, callback, options);
};

export const removeRefreshTask = (id: string) => {
  refreshStrategy.removeTask(id);
};

export const refreshTask = (id: string) => {
  refreshStrategy.refreshTask(id);
};

export const refreshAllTasks = () => {
  refreshStrategy.refreshAllTasks();
};

export const enableRefreshTask = (id: string) => {
  refreshStrategy.enableTask(id);
};

export const disableRefreshTask = (id: string) => {
  refreshStrategy.disableTask(id);
};

export const updateRefreshTask = (id: string, updates: Partial<RefreshTask>) => {
  refreshStrategy.updateTask(id, updates);
};

export const updateRefreshStrategyConfig = (config: RefreshStrategyConfig) => {
  refreshStrategy.updateConfig(config);
};

// 导出默认实例
export default refreshStrategyInstance;
