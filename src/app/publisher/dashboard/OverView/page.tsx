'use client';

import * as React from 'react';
// 导入类型定义
import { TaskStats, OrderStats } from '../../../types/task/getTasksListTypes';

// 组件Props接口
interface OverviewTabPageProps {
  taskStats: TaskStats;
  orderStats: OrderStats;
  loading?: boolean;
  error?: string | null;
}

export default function OverviewTabPage({ 
  taskStats, 
  orderStats, 
  loading = false, 
  error = null 
}: OverviewTabPageProps) {
  
  // 格式化金额显示
  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="mx-4 mt-6 space-y-6">
      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center p-8 bg-white rounded-md shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">加载数据中...</span>
        </div>
      )}
      
      {/* 错误状态 */}
      {error && (
        <div className="bg-white p-6 rounded-md shadow-md text-center">
          <div className="text-red-500 mb-2"><span className="mr-2">⚠️</span>获取数据失败</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      )}
      
      {/* 数据已加载完成 */}
      {!loading && !error && taskStats && (
        <>
          {/* 我的数据部分 */}
          <div className='bg-white p-3 rounded-md shadow-md'>
            <h2 className="text-md mb-3">我的数据</h2>
            
            {/* 总览统计 */}
            <div className="mb-4"></div>
            
            {/* 数据统计卡片 - 2x2网格布局 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-green-300">
                <div className="text-sm text-green-600 mb-1">总任务数</div>
                <div className="text-xl text-green-600">{taskStats.publishedCount}</div>
              </div>
              
              <div className="bg-blue-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-blue-300">
                <div className="text-sm text-blue-600 mb-1">进行中</div>
                <div className="text-xl text-blue-600">{taskStats.acceptedCount}</div>
              </div>
              
              <div className="bg-orange-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-orange-300">
                <div className="text-sm text-orange-600 mb-1">总投入</div>
                <div className="text-xl text-orange-600">{formatCurrency(taskStats.totalEarnings)}</div>
              </div>
              <div className="bg-purple-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-purple-300">
                <div className="text-sm text-purple-600 mb-1">平均客单价</div>
                <div className="text-xl text-purple-600">{taskStats.publishedCount > 0 ? formatCurrency(taskStats.totalEarnings / taskStats.publishedCount) : '¥0.00'}</div>
              </div>
            </div>
          </div>
          
          {/* 子订单统计部分 */}
          <div className='bg-white p-3 rounded-md shadow-md'>
            <h2 className="text-md mb-3">子订单统计</h2>
            
            {/* 子订单统计卡片 - 4列网格布局 */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-blue-300">
                <div className="text-xl text-blue-600 mb-1">{orderStats.acceptedCount}</div>
                <div className="text-xs text-blue-600">进行中</div>
              </div>
              <div className="bg-green-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-green-300">
                <div className="text-xl text-green-600 mb-1">{orderStats.completedCount}</div>
                <div className="text-xs text-green-600">已完成</div>
              </div>
              <div className="bg-orange-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-orange-300">
                <div className="text-xl text-orange-600 mb-1">{orderStats.submittedCount}</div>
                <div className="text-xs text-orange-600">待审核</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-yellow-300">
                <div className="text-xl text-yellow-600 mb-1">{taskStats.publishedCount - taskStats.acceptedCount}</div>
                <div className="text-xs text-yellow-600">已发布</div>
              </div>
            </div>
          </div>
          
          {/* 额外的数据展示部分 */}
          <div className='bg-white p-3 rounded-md shadow-md'>
            <h2 className="text-md mb-3">其他统计信息</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-indigo-300">
                <div className="text-sm text-indigo-600 mb-1">通过率</div>
                <div className="text-xl text-indigo-600">{taskStats.passRate}%</div>
              </div>
              <div className="bg-pink-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-pink-300">
                <div className="text-sm text-pink-600 mb-1">平均完成时间(分钟)</div>
                <div className="text-xl text-pink-600">{taskStats.avgCompletionTime}</div>
              </div>
              <div className="bg-teal-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-teal-300">
                <div className="text-sm text-teal-600 mb-1">排行榜排名</div>
                <div className="text-xl text-teal-600">#{taskStats.ranking}</div>
              </div>
            </div>
          </div>
          

        </>
      )}
    </div>
  );
}
