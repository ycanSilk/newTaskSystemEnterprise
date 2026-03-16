'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';

// 定义子任务接口
interface SubOrder {
  id: string;
  status: string;
  commenterId?: string;
  commenterName?: string;
  commentContent?: string;
  commentTime?: string;
  screenshotUrl?: string;
}

// 定义历史任务接口
interface HistoryTask {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'main_progress' | 'main_completed' | string;
  statusText: string;
  statusColor: string;
  participants: number;
  maxParticipants: number;
  completed: number;
  inProgress: number;
  pending: number;
  pendingReview: number;
  publishTime: string;
  deadline: string;
  description: string;
  taskRequirements?: string;
  taskType?: string;
  subOrders?: SubOrder[];
}

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const TaskHistoryPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'status'>('time');

  // 获取历史任务数据
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 发送API请求
      const response = await fetch('/api/tasks', {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result: ApiResponse<HistoryTask[]> = await response.json();
      
      if (result.success) {
        setHistoryTasks(result.data || []);
      } else {
        throw new Error(result.message || '获取数据失败');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取数据异常');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchHistoryData();
  }, []);

  // 排序功能
  const getSortedTasks = () => {
    return [...historyTasks].sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'price') {
        return b.price - a.price;
      }
      return 0;
    });
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, taskType?: string) => {
    let url = '';
    
    // 根据任务类型决定跳转的详情页面
    if (taskType === 'account_rental') {
      url = `/publisher/dashboard/account-rental-detail?id=${encodeURIComponent(taskId)}`;
    } else if (taskType === 'video_send') {
      url = `/publisher/dashboard/video-send-detail?id=${encodeURIComponent(taskId)}`;
    } else {
      // 默认跳转到普通任务详情页
      url = `/publisher/dashboard/task-detail?id=${encodeURIComponent(taskId)}`;
    }
    
    router.push(url as never);
  };

  // 重试获取数据
  const handleRetry = () => {
    fetchHistoryData();
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <div className="text-black">加载中，请稍候...</div>
      </div>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 max-w-md w-full">
          <p className="mb-2 font-medium">获取数据失败</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  // 显示空状态
  if (historyTasks.length === 0) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="text-gray-400 mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">暂无历史订单</h3>
        <p className="text-black text-center max-w-md">
          您还没有任何历史订单记录。完成任务后，您可以在这里查看历史订单。
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* 页面标题和返回按钮 */}
      <div className="mx-4 mt-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
        >
          <LeftOutlined className="h-4 w-4 mr-1" /> 返回
        </button>

      </div>

      {/* 排序选择 */}
      <div className="mx-4 mt-6 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">全部历史订单</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'time' | 'price' | 'status')}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="time">按时间排序</option>
          <option value="price">按价格排序</option>
          <option value="status">按状态排序</option>
        </select>
      </div>

      {/* 任务列表 */}
      <div className="mx-4 mt-4">
        <div className="space-y-4">
          {getSortedTasks().map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 任务头部信息 */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[0]">
                  <div className="flex items-center  flex-wrap">
                    <div className="font-bold text-gray-800 truncate mb-2">任务需求：{task.title}</div>
                    <div className={`px-2 py-1 ml-0 mb-2 mr-2 rounded text-xs ${task.statusColor}`}>
                      {task.statusText}
                    </div>
                    {/* 任务类型显示 */}
                    {task.taskType && (
                      <div className="px-2 py-1 ml-0 mb-2 mr-2 bg-blue-100 text-blue-600 rounded text-xs">
                        {(() => {
                          const taskTypeMap: Record<string, string> = {
                            'comment_middle': '评论任务',
                            'account_rental': '租号任务',
                            'video_send': '视频推送任务'
                          };
                          return taskTypeMap[task.taskType] || task.taskType;
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-black space-y-1 mb-2">
                    <div>发布时间：{task.publishTime}</div>
                    <div>截止时间：{task.deadline}</div>   
                  </div>
                </div>
               
                {/* 总订单价格 */}
              </div>

              {/* 任务描述 */}
              <div className="mb-2">
                <h2 className='text-sm text-balck mb-2'>提交内容：</h2>
                <div className="text-sm text-black bg-gray-100 p-2 rounded mb-2">
                  {task.description}
                </div>
                {/* 订单单价 */}
                <div className="text-black text-sm ">
                  总金额：<span className="font-bold">¥{(task.price * task.maxParticipants).toFixed(2)}</span>
                </div>
                <div className="text-xs text-black mt-1">
                  订单单价：¥{task.price.toFixed(2)} /条
                </div>
              </div>

              {/* 子任务状态统计 */}
              {task.subOrders && task.subOrders.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-black mb-2">子任务状态统计</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      已完成：{task.subOrders.filter(sub => sub.status === 'sub_completed').length}
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      进行中：{task.subOrders.filter(sub => sub.status === 'sub_progress').length}
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                      待审核：{task.subOrders.filter(sub => sub.status === 'sub_pending_review').length}
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                      待领取：{task.subOrders.filter(sub => sub.status === 'waiting_collect').length}
                    </div>
                  </div>
                </div>
              )}

              {/* 参与情况 */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-black">订单进度</span>
                  <span className="text-sm text-gray-800">
                    {task.participants}/{task.maxParticipants}
                  </span>
                </div>
                <div className="relative bg-green-200 h-5 rounded overflow-hidden">
                  {/* 居中显示的百分比 */}
                  <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-medium text-sm z-10">
                    {Math.round((task.participants / task.maxParticipants) * 100)}%
                  </div>
                  <div 
                    className="bg-green-500 h-5 rounded transition-all duration-500 ease-out"
                    style={{width: `${(task.participants / task.maxParticipants) * 100}%`}}
                  ></div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex">
                <button
                  onClick={() => handleTaskAction(task.id, task.taskType)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskHistoryPage;