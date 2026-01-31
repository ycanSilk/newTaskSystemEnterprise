'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';
// 导入任务类型定义
import { Task } from '../../../types/task/getTasksListTypes';
// 导入打开视频按钮组件
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';

const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 获取平台中文名称
const getPlatformName = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'DOUYIN': '抖音'
  };
  return platformMap[platform] || platform;
};



// 获取任务类型中文名称
const getTaskTypeName = (taskType: string): string => {
  const taskTypeMap: Record<string, string> = {
    'COMMENT': '评论任务'
  };
  return taskTypeMap[taskType] || taskType;
};

// 独立页面组件，不接收外部传入的数据
export default function ActiveTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [lastFetchedData, setLastFetchedData] = useState<Task[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在UI中处理
  };

  // 获取任务列表数据
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task/getTasksList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.list || [];
      }
      return [];
    } catch (error) {
      console.error('获取任务列表失败:', error);
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
      const newTasks = await fetchTasks();
      
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

  // 初始化数据和设置轮询
  useEffect(() => {
    // 首次获取数据
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchTasks();
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

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // 跳转到任务详情页
  const navigateToTaskDetail = (taskId: string) => {
    // 直接跳转到任务详情页，传递任务ID
    router.push(`/publisher/orders/task-detail/${taskId}`);
  };

  // 过滤最近订单 - 允许未来日期的任务
  const filterRecentOrders = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      try {
        const taskTime = new Date(task.created_at).getTime();
        // 对于未来日期的任务，也应该显示
        return !isNaN(taskTime);
      } catch (error) {
        return true; // 解析错误时也显示任务
      }
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

  // 复制评论功能 - 接受评论文本作为参数
  // 返回Promise表示复制操作是否成功
  const handleCopyComment = async (commentText: string): Promise<boolean> => {
    try {
      // 验证评论内容是否为空
      if (!commentText) {
        throw new Error('评论内容为空');
      }
      
      // 执行复制操作 - 优先使用现代Clipboard API
      try {
        await navigator.clipboard.writeText(commentText);
        showCopySuccess('评论已复制');
        return true;
      } catch {
        // 降级方案：使用document.execCommand（兼容旧版浏览器）
        const textArea = document.createElement('textarea');
        textArea.value = commentText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          showCopySuccess('评论已复制');
          return true;
        } else {
          throw new Error('降级复制方案失败');
        }
      }
    } catch (error) {
      // 静默处理复制失败
      return false;
    }
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }



  // 移除数据格式转换逻辑，直接使用API返回的原始数据

  // MainOrderCard组件定义，直接使用Task类型
  const MainOrderCard: React.FC<{
    task: Task;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
  }> = ({ task, onCopyOrderNumber, onViewDetails, onReorder }) => {
    const router = useRouter();

    // 处理复制订单号 - 仅调用父组件传入的方法
    const handleCopyOrderNumber = () => {
      if (onCopyOrderNumber) {
        onCopyOrderNumber(task.task_id.toString());
      }
    };

    // 处理查看详情
    const handleViewDetails = () => {
      if (onViewDetails) {
        // 调用父组件传入的方法
        onViewDetails(task.task_id.toString());
      } else {
        // 直接跳转到任务详情页
        navigateToTaskDetail(task.task_id.toString());
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
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-5 bg-white">
        <div className="flex items-center  overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate ">
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

        <div className="">
          发布时间：{task.created_at}
        </div>
        <div className=" ">
          截止时间：{task.deadline_text}
        </div>
        <div className="  w-full rounded-lg">
          任务要求：{task.template_title}
        </div>
        <div className="">
          任务描速：{task.template_title}
        </div>
        <div className=" bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className='  text-sm text-blue-600'>任务视频点击进入：</p>
          <OpenVideoButton 
            videoUrl={task.video_url}
            defaultUrl={dyurl}
            buttonText="打开抖音"
          />
        </div>
        
        {/* 子任务状态统计 */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-green-100 rounded-lg p-2 text-center">
            <span className="text-green-700 text-xs">已完成</span>
            <span className="text-green-700 text-sm font-medium block">{task.task_done || 0}</span>
          </div>
          <div className="bg-blue-100 rounded-lg p-2 text-center">
            <span className="text-blue-700 text-xs">执行中</span>
            <span className="text-blue-700 text-sm font-medium block">{task.task_doing || 0}</span>
          </div>
          <div className="bg-yellow-100 rounded-lg p-2 text-center">
            <span className="text-yellow-700 text-xs">待审核</span>
            <span className="text-yellow-700 text-sm font-medium block">{task.task_reviewing || 0}</span>
          </div>
          <div className="bg-purple-100 rounded-lg p-2 text-center">
            <span className="text-purple-700 text-xs">待领取</span>
            <span className="text-purple-700 text-sm font-medium block">{task.task_available || 0}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm ">总价</span>
            <span className="text-white text-sm block">¥{task.total_price}</span>
          </div>
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm ">总数量</span>
            <span className="text-white text-sm block">{task.task_count}</span>
          </div>
        </div>
          {/*
        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white  py-2 px-4 rounded-md transition-colors"
            onClick={handleViewDetails}
          >
            查看详情
          </button>
        </div>
        */}
      </div>
    );
  };

  // 获取过滤和搜索后的订单 - 默认按时间排序
  const filteredTasks = searchOrders(filterRecentOrders(tasks)).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 渲染任务列表
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
        title="进行中任务"
        totalCount={filteredTasks.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        viewAllUrl="/publisher/orders/active"
        onViewAllClick={() => router.push('/publisher/orders' as any)}
      />
      
      {/* 任务列表 */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <MainOrderCard
              key={task.task_id}
              task={task}
              onCopyOrderNumber={handleCopyOrderNumber}
              onViewDetails={(orderId) => {
                // 直接跳转到任务详情页
                navigateToTaskDetail(orderId);
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