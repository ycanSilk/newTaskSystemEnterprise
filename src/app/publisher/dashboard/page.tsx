'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// 导入React Query的useQuery hook
import { useQuery } from '@tanstack/react-query';
// 导入四个对应状态的页面组件
import OverViewTabPage from './OverView/page';
import ActiveTabPage from './InProgress/page';
import AwaitingReviewTabPage from './AwaitingReview/page';
import CompletedTabPage from './Completed/page';
// 导入检查支付密码的API响应类型
import { CheckWalletPwdApiResponse } from '../../types/paymentWallet/checkWalletPwdTypes';
// 导入URL重定向提示框组件
import URLRedirection from '../../../components/promptBox/URLRedirection';

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

  // 确保页面加载时默认显示tab=OverView参数
  useEffect(() => {
    if (!searchParams?.has('tab')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', 'OverView');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);
  
  // 使用React Query获取任务列表数据
  const {
    data: tasksData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks', refreshTrigger],
    queryFn: async (): Promise<Task[]> => {
      // 调用后端API获取任务列表
      const response = await fetch('/api/task/getTasksList', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: GetTasksListResponse = await response.json();
      
      if (result.code === 0) {
        return result.data.tasks;
      } else {
        throw new Error(result.message || '获取任务列表失败');
      }
    },
    staleTime: 30 * 1000, // 30秒的缓存时间
    refetchOnWindowFocus: true, // 窗口聚焦时重新请求
  });
  
  // 获取任务数据
  const tasks = tasksData || [];
  
  // 添加页面可见性变化监听，当页面重新可见时刷新任务列表
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('dashboard handleVisibilityChange: 页面重新可见，刷新任务列表');
        refetch();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);
  
  // 添加组件挂载后延迟刷新，确保能获取到最新数据
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [refetch]);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 使用URL参数格式更新当前页面的选项卡状态
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // 使用React Query检查支付密码状态
  const { refetch: refetchWalletPassword } = useQuery({
    queryKey: ['walletPassword'],
    queryFn: async (): Promise<boolean> => {
      // 只有在浏览器环境中才调用API
      if (typeof window === 'undefined') {
        return true; // 默认认为已设置
      }

      // 检查是否已经提示过支付密码设置
      const hasPromptedPaymentPassword = localStorage.getItem('hasPromptedPaymentPassword');
      if (hasPromptedPaymentPassword) {
        console.log('dashboard checkWalletPassword: 已经提示过支付密码设置，跳过检查');
        return true;
      }
      
      // 调用检查支付密码API，使用正确的端点
      const response = await fetch('/api/paymentWallet/checkWalletPwd', {
        method: 'GET',
        credentials: 'include'
      });
      
      // 解析API响应
      const result: CheckWalletPwdApiResponse = await response.json();
      
      console.log('dashboard checkWalletPassword: 检查结果:', result);
      console.log('当前登录用户是否设置里密码',result.data?.has_password);
      
      // 如果请求成功且用户未设置支付密码
      if (result.success && result.data && !result.data.has_password) {
        // 显示自定义提示弹窗
        setShowRedirectModal(true);
        console.log('dashboard checkWalletPassword: 用户未设置支付密码，显示提示弹窗');
        // 标记已经提示过
        localStorage.setItem('hasPromptedPaymentPassword', 'true');
        return false;
      } else {
        console.log('dashboard checkWalletPassword: 用户已设置支付密码，不显示提示弹窗');
        console.log('当前登录用户是否设置里密码',result.data?.has_password);
        // 标记已经检查过
        localStorage.setItem('hasPromptedPaymentPassword', 'true');
        // 如果已经显示了弹窗，关闭它
        if (showRedirectModal) {
          setShowRedirectModal(false);
        }
        return true;
      }
    },
    enabled: false, // 手动触发
    staleTime: 5 * 60 * 1000, // 5分钟的缓存时间
  });

  // 在组件挂载时检查支付密码
  useEffect(() => {
    console.log('dashboard useEffect: 开始检查支付密码');
    refetchWalletPassword();
  }, []);

  // 监听页面可见性变化，当页面重新可见时检查支付密码
  useEffect(() => {
    // 只有在浏览器环境中才添加事件监听器
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('dashboard handleVisibilityChange: 页面重新可见，检查支付密码');
        refetchWalletPassword();
      }
    };

    // 监听visibilitychange事件
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // 清理事件监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchWalletPassword]);

  // 计算统计数据
  const calculateTaskStats = (): TaskStats => {
    // 这里可以根据实际需求计算统计数据
    // 暂时返回模拟数据
    return {
      publishedCount: tasks.length,
      acceptedCount: tasks.reduce((sum, task) => sum + task.task_doing, 0),
      submittedCount: tasks.reduce((sum, task) => sum + task.task_reviewing, 0),
      completedCount: tasks.reduce((sum, task) => sum + task.task_done, 0),
      totalEarnings: parseFloat(tasks.reduce((sum, task) => sum + parseFloat(task.total_price), 0).toFixed(2)),
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
    return {
      acceptedCount: tasks.reduce((sum, task) => sum + task.task_doing, 0),
      submittedCount: tasks.reduce((sum, task) => sum + task.task_reviewing, 0),
      completedCount: tasks.reduce((sum, task) => sum + task.task_done, 0)
    };
  };
  
  // 根据状态过滤任务
  const inProgressTasks = tasks.filter(task => task.status === 1 && task.status_text === '进行中');
  const awaitingReviewTasks = tasks.filter(task => task.task_reviewing > 0);
  const completedTasks = tasks.filter(task => task.status !== 1 || task.status_text === '已完成');
  
  // 生成统计数据
  const taskStats = calculateTaskStats();
  const orderStats = calculateOrderStats();

  return (
    <div className="pb-20">
      {/* 只保留这4个切换按钮的布局和框架 */}
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
          <div className="text-red-500">{error instanceof Error ? error.message : '获取数据失败'}</div>
        </div>
      ) : (
        // 直接嵌入4个对应状态的页面组件，并传递数据
        <>
          {activeTab === 'OverView' && (
            <OverViewTabPage 
              taskStats={taskStats}
              orderStats={orderStats}
              loading={false}
            />
          )}
          {activeTab === 'InProgress' && (
            <ActiveTabPage 
              tasks={inProgressTasks}
            />
          )}
          {activeTab === 'AwaitingReview' && (
            <AwaitingReviewTabPage />
          )}
          {activeTab === 'Completed' && (
            <CompletedTabPage 
              tasks={completedTasks}
            />
          )}
        </>
      )}
      
      {/* URL重定向提示框组件 */}
      <URLRedirection
        isOpen={showRedirectModal}
        message="您尚未设置支付密码，请先设置支付密码"
        buttonText="前往设置"
        redirectUrl="/publisher/profile/paymentsettings/setpaymentpwd"
        onClose={() => setShowRedirectModal(false)}
      />
    </div>
  );
}