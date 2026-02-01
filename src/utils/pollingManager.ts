// 智能轮询管理器
// 实现轮询任务管理、智能调整轮询频率、优先级管理等功能

// 轮询优先级枚举
export enum PollingPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 轮询任务接口
export interface PollingTask {
  id: string;
  url: string;
  interval: number; // 轮询间隔（毫秒）
  priority: PollingPriority;
  smartInterval?: boolean; // 是否启用智能间隔调整
  incrementalUpdate?: boolean; // 是否启用增量更新
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// 轮询任务状态接口
interface PollingTaskState extends PollingTask {
  timerId: NodeJS.Timeout | null;
  lastExecution: number;
  isRunning: boolean;
  currentInterval: number;
}

// 轮询管理器类
class PollingManager {
  private tasks: Map<string, PollingTaskState> = new Map();
  private isPageVisible: boolean = true;
  private networkStatus: boolean = navigator.onLine;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    if (this.isInitialized) return;

    // 页面可见性变化监听
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = document.visibilityState === 'visible';
        this.adjustPollingBasedOnVisibility();
      });
    }

    // 网络状态变化监听
    window.addEventListener('online', () => {
      this.networkStatus = true;
      this.restartPollingAfterNetworkChange();
    });

    window.addEventListener('offline', () => {
      this.networkStatus = false;
      this.pauseAllPolling();
    });

    this.isInitialized = true;
  }

  /**
   * 添加轮询任务
   */
  addTask(task: PollingTask): void {
    if (this.tasks.has(task.id)) {
      console.warn(`Polling task with id ${task.id} already exists.`);
      return;
    }

    const taskState: PollingTaskState = {
      ...task,
      timerId: null,
      lastExecution: 0,
      isRunning: false,
      currentInterval: task.interval
    };

    this.tasks.set(task.id, taskState);
  }

  /**
   * 启动轮询任务
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn(`Polling task with id ${taskId} not found.`);
      return;
    }

    if (task.isRunning) {
      console.warn(`Polling task with id ${taskId} is already running.`);
      return;
    }

    this.executeTask(taskId);
    task.isRunning = true;
  }

  /**
   * 停止轮询任务
   */
  stopTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn(`Polling task with id ${taskId} not found.`);
      return;
    }

    if (task.timerId) {
      clearTimeout(task.timerId);
      task.timerId = null;
    }

    task.isRunning = false;
  }

  /**
   * 移除轮询任务
   */
  removeTask(taskId: string): void {
    this.stopTask(taskId);
    this.tasks.delete(taskId);
  }

  /**
   * 启动所有轮询任务
   */
  startAllTasks(): void {
    this.tasks.forEach((task, taskId) => {
      this.startTask(taskId);
    });
  }

  /**
   * 停止所有轮询任务
   */
  stopAllTasks(): void {
    this.tasks.forEach((task, taskId) => {
      this.stopTask(taskId);
    });
  }

  /**
   * 执行轮询任务
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || !task.isRunning) return;

    try {
      // 模拟API请求
      // 实际项目中应该使用增强的axios实例
      const response = await fetch(task.url, {
        method: 'GET',
        headers: task.headers,
        // 可以添加其他配置
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      task.onSuccess(data);
      task.lastExecution = Date.now();

      // 安排下一次执行
      this.scheduleNextExecution(taskId);
    } catch (error) {
      task.onError(error);
      // 即使出错也要安排下一次执行
      this.scheduleNextExecution(taskId);
    }
  }

  /**
   * 安排下一次执行
   */
  private scheduleNextExecution(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task || !task.isRunning) return;

    // 计算下一次执行的间隔
    let nextInterval = task.currentInterval;

    // 智能调整间隔
    if (task.smartInterval) {
      nextInterval = this.calculateSmartInterval(task);
    }

    // 清除之前的定时器
    if (task.timerId) {
      clearTimeout(task.timerId);
    }

    // 安排下一次执行
    task.timerId = setTimeout(() => {
      this.executeTask(taskId);
    }, nextInterval);
  }

  /**
   * 计算智能轮询间隔
   */
  private calculateSmartInterval(task: PollingTaskState): number {
    // 页面不可见时，延长轮询间隔
    if (!this.isPageVisible) {
      return task.interval * 3; // 延长3倍
    }

    // 网络状态不佳时，延长轮询间隔
    if (!this.networkStatus) {
      return task.interval * 2; // 延长2倍
    }

    // 页面可见且网络正常时，使用正常间隔
    return task.interval;
  }

  /**
   * 根据页面可见性调整轮询
   */
  private adjustPollingBasedOnVisibility(): void {
    this.tasks.forEach((task, taskId) => {
      if (task.smartInterval && task.isRunning) {
        // 重新安排下一次执行，使用新的间隔
        if (task.timerId) {
          clearTimeout(task.timerId);
          this.scheduleNextExecution(taskId);
        }
      }
    });
  }

  /**
   * 暂停所有轮询
   */
  private pauseAllPolling(): void {
    this.tasks.forEach((task) => {
      if (task.timerId) {
        clearTimeout(task.timerId);
        task.timerId = null;
      }
    });
  }

  /**
   * 网络恢复后重启轮询
   */
  private restartPollingAfterNetworkChange(): void {
    this.tasks.forEach((task, taskId) => {
      if (task.isRunning && !task.timerId) {
        this.scheduleNextExecution(taskId);
      }
    });
  }

  /**
   * 获取所有轮询任务
   */
  getAllTasks(): PollingTaskState[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取轮询任务状态
   */
  getTaskStatus(taskId: string): PollingTaskState | undefined {
    return this.tasks.get(taskId);
  }
}

// 导出单例实例
export const pollingManager = new PollingManager();

// 导出轮询任务添加函数
export const addPollingTask = (task: PollingTask): void => {
  pollingManager.addTask(task);
};

// 导出轮询任务启动函数
export const startPollingTask = (taskId: string): void => {
  pollingManager.startTask(taskId);
};

// 导出轮询任务停止函数
export const stopPollingTask = (taskId: string): void => {
  pollingManager.stopTask(taskId);
};

// 导出轮询任务移除函数
export const removePollingTask = (taskId: string): void => {
  pollingManager.removeTask(taskId);
};