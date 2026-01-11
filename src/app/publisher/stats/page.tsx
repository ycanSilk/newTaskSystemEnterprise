'use client';

import React, { useState } from 'react';

export default function PublisherStatsPage() {
  const [activeTab, setActiveTab] = useState('OverView');
  const [dateRange, setDateRange] = useState('week'); // 'today' | 'week' | 'month'
  
  // 模拟数据
  const statsData = {
    today: {
      publishedTasks: 12,
      completedTasks: 8,
      totalSpent: 156.80,
      pendingReview: 3
    },
    week: {
      publishedTasks: 45,
      completedTasks: 38,
      totalSpent: 892.50,
      pendingReview: 7
    },
    month: {
      publishedTasks: 189,
      completedTasks: 165,
      totalSpent: 3847.20,
      pendingReview: 24
    }
  };

  const currentStats = statsData[dateRange as keyof typeof statsData];

  // 任务分类统计
  const categoryStats = [
    { category: '评论任务', count: 65, spent: 428.50, color: 'bg-blue-50 text-blue-600' },
    { category: '账号租赁', count: 48, spent: 735.20, color: 'bg-green-50 text-green-600' },
    { category: '视频发布', count: 32, spent: 358.90, color: 'bg-orange-50 text-orange-600' }
  ];

  // 效果统计
  const effectStats = [
    { metric: '平均完成率', value: '87.3%', trend: '+2.5%', color: 'text-green-600' },
    { metric: '平均单价', value: '¥4.85', trend: '+0.32', color: 'text-green-600' },
    { metric: '用户满意度', value: '4.8分', trend: '+0.1', color: 'text-green-600' },
    { metric: '复购率', value: '73.2%', trend: '-1.2%', color: 'text-red-500' }
  ];

  return (
    <div className="pb-20">
      {/* 时间范围选择 */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => setDateRange('today')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'today' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          今日
        </button>
        <button
          onClick={() => setDateRange('week')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'week' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          本周
        </button>
        <button
          onClick={() => setDateRange('month')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'month' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          本月
        </button>
      </div>

      {/* 核心数据概览 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">核心数据</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{currentStats.publishedTasks}</div>
              <div className="text-xs text-blue-700">发布任务</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{currentStats.completedTasks}</div>
              <div className="text-xs text-green-700">完成任务</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-600">¥{currentStats.totalSpent}</div>
              <div className="text-xs text-orange-700">总支出</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600">{currentStats.pendingReview}</div>
              <div className="text-xs text-purple-700">待审核</div>
            </div>
          </div>
        </div>
      </div>

      {/* 任务分类统计 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">分类统计</h3>
          <div className="space-y-3">
            {categoryStats.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs ${item.color}`}>
                    {item.category}
                  </div>
                  <div className="text-sm text-gray-600">{item.count}个任务</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-800">¥{item.spent}</div>
                  <div className="text-xs text-gray-500">
                    {((item.spent / currentStats.totalSpent) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 效果分析 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">效果分析</h3>
          <div className="grid grid-cols-2 gap-3">
            {effectStats.map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{item.metric}</div>
                <div className="font-bold text-gray-800 mb-1">{item.value}</div>
                <div className={`text-xs ${item.color}`}>
                  {item.trend.startsWith('+') ? '↗️' : '↘️'} {item.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">趋势分析</h3>
          
          {/* 简化的图表显示 */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">任务完成率</span>
                <span className="text-sm font-medium text-green-600">87.3%</span>
              </div>
              <div className="bg-gray-200 h-2 rounded">
                <div className="bg-green-500 h-2 rounded" style={{width: '87.3%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">预算使用率</span>
                <span className="text-sm font-medium text-orange-600">73.8%</span>
              </div>
              <div className="bg-gray-200 h-2 rounded">
                <div className="bg-orange-500 h-2 rounded" style={{width: '73.8%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">用户参与度</span>
                <span className="text-sm font-medium text-blue-600">91.5%</span>
              </div>
              <div className="bg-gray-200 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded" style={{width: '91.5%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="mx-4 mt-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-500 text-xl">💡</span>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">优化建议</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• 评论任务表现稳定，建议保持当前投入</p>
                <p>• 账号租赁收益较高，可考虑扩大规模</p>
                <p>• 视频发布单价有提升空间，建议优化内容质量</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}