'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';
// 懒加载四个对应状态的页面组件
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
const MagnifyingGlassTabPage = dynamic(() => import('./MagnifyingGlass/page'), {
  loading: () => <div className="flex justify-center items-center py-20">加载中...</div>,
  ssr: false
});




// 导入加载组件，用于状态加载中显示
import { Loading } from '@/components/ui';
// 导入任务列表API响应类型
import { GetTasksListResponse, Task, OrderStats,Pagination } from '../../types/task/getTasksListTypes';
// 导入待审核任务列表API响应类型
import { PendingTasksListResponse } from '../../types/task/pendingTasksListTypes';

// 任务统计数据类型
interface TaskStats {
  publishedCount: number;
  acceptedCount: number;
  submittedCount: number;
  completedCount: number;
  totalEarnings: number;
  pendingEarnings: number;
  todayEarnings: number;
  monthEarnings: number;
  passedCount: number;
  rejectedCount: number;
  passRate: number;
  avgCompletionTime: number;
  ranking: number;
  agentTasksCount: number;
  agentEarnings: number;
  invitedUsersCount: number;
}

export default function PublisherDashboardPage() {
  // 获取搜索参数，用于从URL中读取tab值
  const searchParams = useSearchParams();
  // 获取路由对象，用于页面跳转
  const router = useRouter();
  // 从URL参数中获取tab值，如果没有则默认显示进行中页面
  const tabFromUrl = searchParams?.get('tab') || 'InProgress';
  // 设置当前激活的tab状态
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  // 滚动位置缓存
  const scrollPositionRef = useRef<number>(0);
  
  // 使用优化工具
  const { globalFetch, addRefreshTask, removeRefreshTask } = useOptimization();

  // 确保页面加载时默认显示tab=InProgress参数
  useEffect(() => {
    if (!searchParams?.has('tab')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', 'InProgress');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);
  


  // 保存滚动位置
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 更新URL参数
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };




  return (
    <div className="pb-20">
      {/* 只保留4个切换按钮 */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-1">        
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
        <button
          onClick={() => handleTabChange('MagnifyingGlass')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'MagnifyingGlass' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          放大镜任务
        </button>
      </div>

      <Suspense fallback={<div className="flex justify-center items-center py-20">加载中...</div>}>        
        {activeTab === 'InProgress' && (
          <ActiveTabPage  />
        )}
        {activeTab === 'AwaitingReview' && (
          <AwaitingReviewTabPage />
        )}
        {activeTab === 'Completed' && (
          <CompletedTabPage  />
        )}
        {activeTab === 'MagnifyingGlass' && (
          <MagnifyingGlassTabPage />
        )}
      </Suspense>

    </div>
  );
}
