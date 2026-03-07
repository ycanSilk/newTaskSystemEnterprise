'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
// 导入放大镜任务列表的类型定义
import type { GetMagnifierTaskListApiResponse, MagnifierTaskItem } from '@/api/types/task/getMagnifierTaskListTypes';
// 导入打开视频按钮组件
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';

const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function CompletedTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<MagnifierTaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 使用优化工具
  const { globalFetch } = useOptimization();

  // 处理搜索
  const handleSearch = () => {
    // 只有点击搜索按钮时才进行搜索过滤
    setCurrentSearchTerm(searchTerm);
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // API调用 - 获取放大镜任务列表
  const fetchMagnifierTasks = async () => {
    try {
      // 使用全局fetch包装器，获得缓存和重试等优化功能
      const result: GetMagnifierTaskListApiResponse = await globalFetch('/api/task/getMagnifierTaskList', {
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
        return result.data.list || [];
      }
      return [];
    } catch (error) {
      console.error('获取放大镜任务列表失败:', error);
      return [];
    }
  };

  // 刷新任务列表数据
  const refreshTasks = async () => {
    try {
      const newTasks = await fetchMagnifierTasks();
      setTasks(newTasks);
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  };

  // 过滤最近订单
  const filterRecentOrders = (tasks: MagnifierTaskItem[]) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      const taskTime = new Date(task.created_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return taskTime >= sevenDaysAgo;
    });
  };

  // 搜索订单 - 只支持ID搜索
  const searchOrders = (tasks: MagnifierTaskItem[]) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    if (!currentSearchTerm.trim()) return tasks;
    const searchTermStr = currentSearchTerm.trim();
    
    const filtered = tasks.filter(task => {
      const idMatch = task.id.toString() === searchTermStr;
      return idMatch;
    });
    return filtered;
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

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchMagnifierTasks();
        setTasks(initialTasks);
      } catch (error) {
        console.error('初始化任务列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // MainOrderCard组件定义，使用MagnifierTaskItem类型
  const MainOrderCard = ({ task, onCopyOrderNumber, onCopyComment, onViewDetails, onReorder }: {
    task: MagnifierTaskItem;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onCopyComment?: (comment: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
  }) => {
    const router = useRouter();

    // 处理复制订单号 - 仅调用父组件传入的方法
    const handleCopyOrderNumber = () => {
      if (onCopyOrderNumber) {
        onCopyOrderNumber(task.id.toString());
      }
    };

    // 处理查看详情
    const handleViewDetails = () => {
      if (onViewDetails) {
        onViewDetails(task.id.toString());
      } else {
        router.push(`/publisher/orders/task-detail/${task.id}`);
      }
    };

    // 处理补单
    const handleReorder = () => {
      if (onReorder) {
        onReorder(task.id.toString());
      } else {
        // 跳转到新的补单页面
        router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${task.id}&title=${encodeURIComponent(task.title)}&description=${encodeURIComponent(task.title)}&budget=${task.total_price}&subOrderCount=${task.task_count}`);
      }
    };

    // 格式化截止时间
    const formatDeadline = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('zh-CN');
    };

    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
        <div className="flex items-center mb-1 overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
            任务ID：{task.id}
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
            放大镜任务
          </span>
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          发布时间：{task.created_at}
        </div>
        <div className="mb-1 text-sm text-black text-sm ">
          截止时间：{formatDeadline(task.deadline)}
        </div>
        <div className="text-black text-sm mb-1 w-full rounded-lg">
           任务要求：{task.title}
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          任务描述：{task.recommend_marks[0]?.comment || ''}
        </div>
        <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className='mb-1  text-sm text-blue-600'>任务视频链接：</p>
          <OpenVideoButton 
            videoUrl={task.video_url}
            defaultUrl={dyurl}
            buttonText="复制链接"
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

      {/* 页面标题和搜索框 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">放大镜任务</h3>
          <span className="text-sm text-gray-500">共 {filteredTasks.length} 个任务</span>
        </div>
        
        {/* 内置搜索功能 */}
        <div className="flex-grow max-w-md">
          <div className="grid grid-cols-[79%_20%] gap-1">
            <div className="relative mr-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="搜索任务ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md whitespace-nowrap"
            >
              搜索
            </button>
          </div>
        </div>
      </div>
      
      {/* 任务列表 */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <MainOrderCard
              key={task.id}
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
