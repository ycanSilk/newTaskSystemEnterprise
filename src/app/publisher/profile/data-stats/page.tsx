"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TaskCountData {
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

interface TaskCountResponse {
  code: number;
  message: string;
  data: TaskCountData;
  success: boolean;
  timestamp: number;
}

export default function DataStatsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('today'); // 'today' | 'week' | 'month'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskCountData, setTaskCountData] = useState<TaskCountResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/task/taskcount?dateRange=${dateRange}`);
        const data = await response.json();
        if (data.success) {
          setTaskCountData(data);
        } else {
          setError(data.message || 'Failed to fetch data.');
        }
      } catch (err) {
        setError('An error occurred. Please try again later.');
        console.error('Error fetching task count data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pb-8 flex justify-center items-center text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 pb-8 flex justify-center items-center text-xl text-red-600">Error: {error}</div>;
  }

  if (!taskCountData) {
    return <div className="min-h-screen bg-gray-50 pb-8 flex justify-center items-center text-xl">No data available.</div>;
  }

  const { data } = taskCountData;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 时间范围选择 */}
      <div className="mt-4 px-5">
        <div className="flex rounded-lg bg-white p-1 shadow-sm">
          <button
            onClick={() => setDateRange('today')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'today' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'week' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'month' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本月
          </button>
        </div>
      </div>

      {/* 核心数据概览 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">核心数据</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{data.publishedCount}</div>
              <div className="text-xs text-blue-700 mt-1">发布任务</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{data.completedCount}</div>
              <div className="text-xs text-green-700 mt-1">完成任务</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">¥{data.totalEarnings}</div>
              <div className="text-xs text-orange-700 mt-1">总支出</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{data.submittedCount}</div>
              <div className="text-xs text-purple-700 mt-1">待审核</div>
            </div>
          </div>
        </div>
      </div>

      {/* 订单数据总览 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">订单数据总览</h3>
          <div className="space-y-4">
            {/* 评论订单 */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-800">评论订单</div>
                </div>
                <div className="text-sm text-gray-500">{dateRange === 'today' ? '今日' : dateRange === 'week' ? '本周' : '本月'}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">订单总数</div>
                  <div className="font-bold text-gray-800">{data.publishedCount}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">已完成</div>
                  <div className="font-bold text-green-600">{data.completedCount}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">总支出</div>
                  <div className="font-bold text-orange-600">¥{data.totalEarnings}</div>
                </div>
              </div>
            </div>
            
            {/* 租赁订单 */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-800">租赁订单</div>
                </div>
                <div className="text-sm text-gray-500">{dateRange === 'today' ? '今日' : dateRange === 'week' ? '本周' : '本月'}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">订单总数</div>
                  <div className="font-bold text-gray-800">{data.agentTasksCount}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">进行中</div>
                  <div className="font-bold text-blue-600">{data.acceptedCount}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">总支出</div>
                  <div className="font-bold text-orange-600">¥{data.agentEarnings}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 效果分析 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">效果分析</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5">通过数</div>
              <div className="font-bold text-gray-800 mb-1.5">{data.passedCount}</div>
            </div>
            <div className="border border-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5">拒绝数</div>
              <div className="font-bold text-gray-800 mb-1.5">{data.rejectedCount}</div>
            </div>
            <div className="border border-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5">通过率</div>
              <div className="font-bold text-gray-800 mb-1.5">{data.passRate}%</div>
            </div>
            <div className="border border-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1.5">评价完成时间</div>
              <div className="font-bold text-gray-800 mb-1.5">{data.avgCompletionTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}