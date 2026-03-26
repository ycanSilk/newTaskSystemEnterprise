'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
// 导入放大镜任务列表的类型定义
import type { GetMagnifierTaskListApiResponse, MagnifierTaskItem } from '@/api/types/task/getMagnifierTaskListTypes';
// 导入打开视频按钮组件
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';


const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function CompletedTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<MagnifierTaskItem[]>([]);
  const [originalTasks, setOriginalTasks] = useState<MagnifierTaskItem[]>([]); // 原始任务列表
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState(''); // 输入框内容
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(20);

  // 处理搜索点击（前端过滤）
  const handleSearch = () => {
    console.log('Search button clicked with term:', searchTerm);
    if (!searchTerm.trim()) {
      // 搜索框为空，显示所有任务
      setTasks(originalTasks);
    } else {
      // 只过滤任务ID匹配的任务
      const filteredTasks = originalTasks.filter(task => 
        task.id.toString().includes(searchTerm.trim())
      );
      console.log('Filtered tasks:', filteredTasks.length, 'tasks');
      setTasks(filteredTasks);
    }
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // API调用 - 获取放大镜任务列表
  const fetchMagnifierTasks = async (page: number = 1) => {
    try {
      // 直接使用fetch
      const response = await fetch(`/api/task/getMagnifierTaskList?page=${page}&page_size=${pageSize}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const result: GetMagnifierTaskListApiResponse = await response.json();
      
      if (result.code === 0) {
        // 更新分页信息
        if (result.data) {
          // 计算总页数
          const totalPages = Math.ceil((result.data.total || 0) / (result.data.pageSize || 10));
          setTotalPages(totalPages > 0 ? totalPages : 1);
        }
        return result.data.list || [];
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
      console.error('获取放大镜任务列表失败:', error);
      return [];
    }
  };

  // 刷新任务列表数据
  const refreshTasks = async () => {
    try {
      const newTasks = await fetchMagnifierTasks(currentPage);
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
      const newTasks = await fetchMagnifierTasks(page);
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
        const initialTasks = await fetchMagnifierTasks(currentPage);
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
    const intervalId = setInterval(() => {
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
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage]);

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
          <h3 className="font-bold text-gray-800">放大镜任务</h3>
          <span className="text-sm text-gray-500">共 {tasks.length} 个任务</span>
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
        {tasks.length > 0 ? (
          <>
            {tasks.map((task) => (
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
