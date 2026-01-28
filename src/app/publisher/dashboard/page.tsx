'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';
// 懒加载四个对应状态的页面组件
const OverViewTabPage = dynamic(() => import('./OverView/page'), {
  loading: () => <div className="flex justify-center items-center py-20">加载中...</div>,
  ssr: false
});
const ActiveTabPage = dynamic(() => import('./InProgress/page'), {
  loading: () => <div className="flex justify-center items-center py-20">加载中...</div>,
  ssr: false
});
const AwaitingReviewTabPage = dynamic(() => import('./AwaitingReview/page'), {
  loading: () => <div className="flex justify-center items-center py-20">加载中...</div>,
  ssr: false
});
const CompletedTabPage = dynamic(() => import('./Completed/page'), {
  loading: () => <div className="flex justify-center items-center py-20">加载中...</div>,
  ssr: false
});
// 懒加载URL重定向提示框组件
const URLRedirection = dynamic(() => import('../../../components/promptBox/URLRedirection'), {
  loading: () => null,
  ssr: false
});

// 导入检查支付密码的API响应类型
import { CheckWalletPwdApiResponse } from '../../types/paymentWallet/checkWalletPwdTypes';

// 导入加载组件，用于状态加载中显示
import { Loading } from '@/components/ui';
// 导入任务列表API响应类型
import { GetTasksListResponse, Task, TaskStats, OrderStats } from '../../types/task/getTasksListTypes';

export default function PublisherDashboardPage() {
  // 获取搜索参数，用于从URL中读取tab值
  const searchParams = useSearchParams();
  // 获取路由对象，用于页面跳转
  const router = useRouter();
  // 从URL参数中获取tab值，如果没有则默认显示概览页
  const tabFromUrl = searchParams?.get('tab') || 'OverView';
  // 设置当前激活的tab状态
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // 添加强制刷新状态，用于发布任务成功后刷新列表
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 添加URL重定向提示框状态
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  // 页面回退缓存状态
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const [cachedTasks, setCachedTasks] = useState<Task[]>([]);
  const [isUsingCache, setIsUsingCache] = useState(false);
  
  // 滚动位置缓存
  const scrollPositionRef = useRef<number>(0);
  
  // 使用优化工具
  const { globalFetch, savePageState, addRefreshTask, removeRefreshTask, refreshTask } = useOptimization();

  // 确保页面加载时默认显示tab=OverView参数
  useEffect(() => {
    if (!searchParams?.has('tab')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', 'OverView');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);
  
  // 使用原生状态管理获取任务列表数据
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 保存滚动位置
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 获取任务列表数据的函数
  const fetchTasks = async (): Promise<Task[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('开始获取任务列表数据');
      
      // 使用全局fetch包装器，获得缓存和重试等优化功能
      const result: GetTasksListResponse = await globalFetch('/api/task/getTasksList', {
        method: 'GET'
      }, {
        // 启用缓存，缓存时间5分钟
        enableCache: true,
        expiry: 5 * 60 * 1000,
        // 启用自动重试
        enableRetry: true,
        retryCount: 3,
        retryDelay: 1000
      });
      
      console.log('获取任务列表数据成功:', result);
      
      if (result.code === 0) {
        // 保存页面状态
        savePageState({ tasks: result.data.tasks, activeTab });
        return result.data.tasks;
      } else {
        throw new Error(result.message || '获取任务列表失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取任务列表失败';
      console.error('获取任务列表失败:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log('获取任务列表数据完成，设置loading为false');
      setLoading(false);
    }
  };

  // 组件挂载时获取任务列表
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('开始初始化任务列表');
        
        // 检查是否是回退导航
        if (isBackNavigation) {
          // 尝试从localStorage获取缓存数据
          const cacheKey = `dashboard_cache_${activeTab}`;
          const cachedData = localStorage.getItem(cacheKey);
          
          if (cachedData) {
            try {
              const parsedData = JSON.parse(cachedData);
              setCachedTasks(parsedData.tasks || []);
              setIsUsingCache(true);
              setLoading(false); // 立即设置loading为false，使用缓存数据
              
              // 恢复滚动位置
              if (parsedData.scrollPosition) {
                window.scrollTo(0, parsedData.scrollPosition);
              }
            } catch (e) {
              console.error('解析缓存失败:', e);
            }
          }
        }
        
        // 获取最新数据
        const tasksData = await fetchTasks();
        setTasks(tasksData);
        
        // 缓存数据
        const cacheKey = `dashboard_cache_${activeTab}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          tasks: tasksData,
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        }));
        
        // 重置回退状态
        setIsBackNavigation(false);
        setIsUsingCache(false);
        
        console.log('初始化任务列表成功');
      } catch (error) {
        console.error('初始化任务列表失败:', error);
        // 确保在错误情况下也设置loading为false
        setLoading(false);
      }
    };

    initialize();
  }, [activeTab]); // 移除isBackNavigation依赖，避免重复执行

  // 监听路由变化，检测回退导航
  useEffect(() => {
    const handlePopState = () => {
      if (history.state && history.state.navigationType === 'back') {
        setIsBackNavigation(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 组件挂载时添加刷新任务
  useEffect(() => {
    // 添加页面可见性刷新任务
    addRefreshTask('dashboard_visibility_refresh', async () => {
      if (document.visibilityState === 'visible') {
        console.log('dashboard: 页面重新可见，刷新任务列表');
        const tasksData = await fetchTasks();
        setTasks(tasksData);
      }
    }, {
      interval: 3600000, // 1小时轮询
      debounceTime: 300, // 300ms防抖
      enabled: true
    });

    // 添加定时轮询任务
    addRefreshTask('dashboard_polling_refresh', async () => {
      console.log('dashboard: 定时刷新任务列表');
      const tasksData = await fetchTasks();
      setTasks(tasksData);
    }, {
      interval: 3600000, // 1小时轮询
      enabled: true
    });

    // 清理函数
    return () => {
      removeRefreshTask('dashboard_visibility_refresh');
      removeRefreshTask('dashboard_polling_refresh');
    };
  }, []);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 更新URL参数
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // 检查支付密码状态
  const checkWalletPassword = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return true;
    }

    // 检查是否已提示过（会话级别，使用sessionStorage）
    const hasPrompted = sessionStorage.getItem('hasPromptedPaymentPassword');
    if (hasPrompted) {
      console.log('dashboard: 本次会话已提示过支付密码设置，跳过检查');
      return true;
    }
    
    try {
      const response = await fetch('/api/paymentWallet/checkWalletPwd', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result: CheckWalletPwdApiResponse = await response.json();
      
      console.log('dashboard: 支付密码检查结果:', result);
      
      if (result.success && result.data && !result.data.has_password) {
        setShowRedirectModal(true);
        console.log('dashboard: 用户未设置支付密码，显示提示');
        sessionStorage.setItem('hasPromptedPaymentPassword', 'true');
        return false;
      } else {
        sessionStorage.setItem('hasPromptedPaymentPassword', 'true');
        return true;
      }
    } catch (error) {
      console.error('支付密码检查失败:', error);
      return true;
    }
  };

  // 组件挂载时检查支付密码（只检查一次）
  useEffect(() => {
    console.log('dashboard: 开始检查支付密码');
    checkWalletPassword();
  }, []);

  // 计算统计数据
  const calculateTaskStats = (): TaskStats => {
    // 使用当前任务或缓存任务
    const currentTasks = tasks.length > 0 ? tasks : cachedTasks;
    
    return {
      publishedCount: currentTasks.length,
      acceptedCount: currentTasks.reduce((sum, task) => sum + task.task_doing, 0),
      submittedCount: currentTasks.reduce((sum, task) => sum + task.task_reviewing, 0),
      completedCount: currentTasks.reduce((sum, task) => sum + task.task_done, 0),
      totalEarnings: parseFloat(currentTasks.reduce((sum, task) => sum + parseFloat(task.total_price), 0).toFixed(2)),
      pendingEarnings: 0,
      todayEarnings: 0,
      monthEarnings: 0,
      passedCount: 0,
      rejectedCount: 0,
      passRate: 0,
      avgCompletionTime: 0,
      ranking: 0,
      agentTasksCount: 0,
      agentEarnings: 0,
      invitedUsersCount: 0
    };
  };

  // 计算订单统计数据
  const calculateOrderStats = (): OrderStats => {
    const currentTasks = tasks.length > 0 ? tasks : cachedTasks;
    
    return {
      acceptedCount: currentTasks.reduce((sum, task) => sum + task.task_doing, 0),
      submittedCount: currentTasks.reduce((sum, task) => sum + task.task_reviewing, 0),
      completedCount: currentTasks.reduce((sum, task) => sum + task.task_done, 0)
    };
  };

  // 根据状态过滤任务
  const inProgressTasks = (tasks.length > 0 ? tasks : cachedTasks).filter(task => 
    task.status === 1 && task.status_text === '进行中'
  );

  const awaitingReviewTasks = (tasks.length > 0 ? tasks : cachedTasks).filter(task => 
    task.task_reviewing > 0
  );

  const completedTasks = (tasks.length > 0 ? tasks : cachedTasks).filter(task => 
    task.status !== 1 || task.status_text === '已完成'
  );

  // 生成统计数据
  const taskStats = calculateTaskStats();
  const orderStats = calculateOrderStats();

  return (
    <div className="pb-20">
      {/* 只保留4个切换按钮 */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-1">
        <button
          onClick={() => handleTabChange('OverView')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'OverView' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          概览
        </button>
        <button
          onClick={() => handleTabChange('InProgress')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'InProgress' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          进行中
        </button>
        <button
          onClick={() => handleTabChange('AwaitingReview')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'AwaitingReview' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          待审核
        </button>
        <button
          onClick={() => handleTabChange('Completed')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'Completed' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          已完成
        </button>
      </div>

      {/* 显示加载状态 */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loading />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <Suspense fallback={<div className="flex justify-center items-center py-20">加载中...</div>}>
          {activeTab === 'OverView' && (
            <OverViewTabPage 
              taskStats={taskStats}
              orderStats={orderStats}
              loading={isUsingCache}
            />
          )}
          {activeTab === 'InProgress' && (
            <ActiveTabPage tasks={inProgressTasks} />
          )}
          {activeTab === 'AwaitingReview' && (
            <AwaitingReviewTabPage />
          )}
          {activeTab === 'Completed' && (
            <CompletedTabPage tasks={completedTasks} />
          )}
        </Suspense>
      )}

      {/* URL重定向提示框 */}
      <Suspense fallback={null}>
        {URLRedirection && (
          <URLRedirection
            isOpen={showRedirectModal}
            message="您尚未设置支付密码，请先设置"
            buttonText="前往设置"
            redirectUrl="/publisher/profile/paymentsettings/setpaymentpwd"
            onClose={() => setShowRedirectModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
