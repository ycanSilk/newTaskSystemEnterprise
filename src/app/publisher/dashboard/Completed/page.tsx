'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';
// 导入任务类型定义
import { Task,
  SingleTaskItem,
  ComboTaskItem,
  BaseTaskItem,
  ComboInfo,
  GetTasksListResponse } from '../../../types/task/getTasksListTypes';
// 导入打开视频按钮组件
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';

const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function CompletedTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 数据缓存和轮询相关
  const [lastFetchedData, setLastFetchedData] = useState<Task[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 使用优化工具
  const { globalFetch } = useOptimization();

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在UI中处理
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // API调用 - 获取已完成任务列表
  const fetchCompletedTasks = async () => {
    try {
      // 使用全局fetch包装器，获得缓存和重试等优化功能
      const result: GetTasksListResponse = await globalFetch('/api/task/getTasksList?status=2', {
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
      
      if (result.code === 0) {
        return result.data.tasks || [];
      }
      return [];
    } catch (error) {
      console.error('获取已完成任务列表失败:', error);
      return [];
    }
  };

  // 检查数据是否有变化
  const hasDataChanged = (newData: Task[], oldData: Task[]): boolean => {
    if (newData.length !== oldData.length) return true;
    
    // 比较任务ID，检查是否有新增或删除的任务
    const newTaskIds = new Set(newData.map(task => task.task_id));
    const oldTaskIds = new Set(oldData.map(task => task.task_id));
    
    if (newTaskIds.size !== oldTaskIds.size) return true;
    
    // 检查是否有不同的任务ID
    return !Array.from(newTaskIds).every(taskId => oldTaskIds.has(taskId));
  };

  // 刷新任务列表数据
  const refreshTasks = async () => {
    try {
      const newTasks = await fetchCompletedTasks();
      
      // 与缓存数据对比
      if (hasDataChanged(newTasks, lastFetchedData)) {
        setTasks(newTasks);
        setLastFetchedData(newTasks);
        showCopySuccess('数据已更新');
      }
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  };

  // 过滤最近订单
  const filterRecentOrders = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      const taskTime = new Date(task.created_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return taskTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    if (!searchTerm.trim()) return tasks;
    return tasks.filter(task => 
      task.task_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.template_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.template_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 显示复制成功提示
  const showCopySuccess = (message: string) => {
    setTooltipMessage(message);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      showCopySuccess('订单号已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 复制评论功能
  const handleCopyComment = (comment: string) => {
    navigator.clipboard.writeText(comment).then(() => {
      showCopySuccess('评论已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 初始化数据和设置轮询
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchCompletedTasks();
        setTasks(initialTasks);
        setLastFetchedData(initialTasks);
      } catch (error) {
        console.error('初始化任务列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // 设置被动轮询，每10分钟刷新一次
    const pollingInterval = 10 * 60 * 1000; // 10分钟
    pollingIntervalRef.current = setInterval(() => {
      refreshTasks();
    }, pollingInterval);

    // 监听页面可见性变化，当页面重新可见时刷新数据
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // MainOrderCard组件定义，直接使用Task类型
  const MainOrderCard = ({ task, onCopyOrderNumber, onCopyComment, onViewDetails, onReorder }: {
    task: Task;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onCopyComment?: (comment: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
  }) => {
    const router = useRouter();

    // 直接使用API返回的原始统计数据

    // 处理复制订单号 - 仅调用父组件传入的方法
    const handleCopyOrderNumber = () => {
      if (onCopyOrderNumber) {
        onCopyOrderNumber(task.task_id.toString());
      }
    };

    // 处理查看详情
    const handleViewDetails = () => {
      if (onViewDetails) {
        onViewDetails(task.task_id.toString());
      } else {
        router.push(`/publisher/orders/task-detail/${task.task_id}`);
      }
    };

    // 处理补单
    const handleReorder = () => {
      if (onReorder) {
        onReorder(task.task_id.toString());
      } else {
        // 跳转到新的补单页面
        router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${task.task_id}&title=${encodeURIComponent(task.template_title)}&description=${encodeURIComponent(task.template_title)}&budget=${task.total_price}&subOrderCount=${task.task_count}`);
      }
    };

    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
        <div className="flex items-center mb-1 overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
            任务ID：{task.task_id}
          </div>
          <div className="relative">
            <button 
              className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
              onClick={handleCopyOrderNumber}
            >
              <span>⧉ 复制</span>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {task.status_text}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {task.template_type_text}
          </span>
          {task.is_combo && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
               {task.stage_text}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
            {task.stage_status_text}
          </span>
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          发布时间：{task.created_at}
        </div>
        <div className="mb-1 text-sm text-black text-sm ">
          截止时间：{task.deadline_text}
        </div>
        <div className="text-black text-sm mb-1 w-full rounded-lg">
           任务要求：{task.template_title}
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          任务描述：{task.template_title}
        </div>
        <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className='mb-1  text-sm text-blue-600'>任务视频点击进入：</p>
          <OpenVideoButton 
            videoUrl={task.video_url}
            defaultUrl={dyurl}
            buttonText="打开抖音"
          />
        </div>
        
        <div className="flex gap-2 mb-1">
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">总价</span>
            <span className="text-white text-sm block">¥{task.total_price}</span>
          </div>
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">总数量</span>
            <span className="text-white text-sm block">{task.task_count}</span>
          </div>
        </div>
      </div>
    );
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 获取过滤和搜索后的订单 - 默认按时间排序，不再过滤最近7天的订单
  const filteredTasks = searchOrders(tasks).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 复制成功提示 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}

      {/* 使用标准模板组件 - 移除排序功能 */}
      <OrderHeaderTemplate
        title="已完成的订单"
        totalCount={filteredTasks.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        viewAllUrl="/publisher/orders/completed"
        onViewAllClick={() => router.push('/publisher/orders')}
      />
      
      {/* 任务列表 */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <MainOrderCard
              key={task.task_id}
              task={task}
              onCopyOrderNumber={handleCopyOrderNumber}
              onCopyComment={handleCopyComment}
              onViewDetails={(orderId: string) => {
                // 直接跳转到任务详情页
                router.push(`/publisher/orders/task-detail/${orderId}`);
              }}
              onReorder={(orderId) => handleTaskAction(orderId, 'reorder')}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">暂无相关任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
