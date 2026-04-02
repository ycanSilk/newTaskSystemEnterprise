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


const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function CompletedTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [originalTasks, setOriginalTasks] = useState<Task[]>([]); // 原始任务列表
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState(''); // 输入框内容
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  // 数据缓存和轮询相关
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 处理搜索点击（前端过滤）
  const handleSearch = () => {
    console.log('Search button clicked with term:', searchTerm);
    if (!searchTerm.trim()) {
      // 搜索框为空，显示所有任务
      setTasks(originalTasks);
    } else {
      // 只过滤任务ID匹配的任务
      const filteredTasks = originalTasks.filter(task => 
        task.task_id.toString().includes(searchTerm.trim())
      );
      console.log('Filtered tasks:', filteredTasks.length, 'tasks');
      setTasks(filteredTasks);
    }
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // API调用 - 获取已完成任务列表
  const fetchCompletedTasks = async (page: number = 1) => {
    try {
      // 直接使用fetch
      const response = await fetch(`/api/task/getTasksList?status=2&page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const result: GetTasksListResponse = await response.json();
      
      if (result.code === 0) {
        // 更新分页信息
        if (result.data?.pagination) {
          setTotalPages(result.data.pagination.total_pages || 1);
        }
        return result.data.tasks || [];
      }
      return [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        // 如果是401错误，重定向到登录页
        router.push('/publisher/auth/login');
        return [];
      }
      if (error instanceof Error && error.message.includes('500')) {
        // 如果是500错误，重定向到登录页
        router.push('/publisher/auth/login');
        return [];
      }
      if (error instanceof Error && error.message.includes('403')) {
        // 如果是403错误，重定向到登录页
        router.push('/publisher/auth/login');
        return [];
      }
      if (error instanceof Error && error.message.includes('4011')) {
        // 如果是4011错误，重定向到登录页
        router.push('/publisher/auth/login');
        return [];
      }
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
      const newTasks = await fetchCompletedTasks(currentPage);
      setOriginalTasks(newTasks);
      setTasks(newTasks);
      showCopySuccess('数据已更新');
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
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

  // 分页处理函数
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setLoading(true);
    try {
      const newTasks = await fetchCompletedTasks(page);
      setOriginalTasks(newTasks);
      setTasks(newTasks);
    } catch (error) {
      console.error('获取任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据和设置轮询
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchCompletedTasks(currentPage);
        setOriginalTasks(initialTasks);
        setTasks(initialTasks);
      } catch (error) {
        console.error('初始化任务列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // 设置被动轮询，每1分钟刷新一次
    const pollingInterval = 1 * 60 * 1000; // 1分钟
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
  }, [currentPage]);

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
            单号：{task.task_id}
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

  return (
    <div className="mx-4 mt-6">
      {/* 复制成功提示 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}

      {/* 页面标题和搜索框 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">已完成的订单</h3>
          <span className="text-sm text-gray-500">共 {tasks.length} 个任务</span>
        </div>

        <div className="flex-grow max-w-md">
          <div className="grid grid-cols-[79%_20%] gap-1">
            <div className="relative mr-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索单号"
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
        {tasks.length > 0 ? (
          <>
            {tasks.map((task) => (
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
            ))}
            
            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-4">
                  {/* 上一页按钮 */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    上一页
                  </button>
                  
                  {/* 页码信息 */}
                  <span className="px-4 py-2 text-gray-700 font-medium">
                    第 {currentPage} / {totalPages} 页
                  </span>
                  
                  {/* 下一页按钮 */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    下一页
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">暂无相关任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
