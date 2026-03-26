'use client';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';

interface Task {
  task_id: number;
  template_id: number;
  template_title: string;
  template_type: number;
  template_type_text: string;
  video_url: string;
  deadline: number;
  deadline_text: string;
  task_count: number;
  task_done: number;
  task_doing: number;
  task_reviewing: number;
  task_available: number;
  progress_percent: number;
  unit_price: string;
  total_price: string;
  status: number;
  status_text: string;
  is_combo: boolean;
  stage: number;
  stage_text: string;
  stage_status: number;
  stage_status_text: string;
  combo_task_id: number | null;
  parent_task_id: number | null;
  is_newbie: boolean;
  is_newbie_text: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const dyurl = "https://www.douyin.com/video/7598199346240228614";

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

export default function ActiveTabPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [originalTasks, setOriginalTasks] = useState<Task[]>([]); // 原始任务列表
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');           // 输入框内容
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedRef = useRef(false);

  // 获取任务列表数据（支持分页和搜索）
  const fetchTasks = async (page: number, keyword: string) => {
    try {
      const params = new URLSearchParams({
        status: '1',
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (keyword.trim()) {
        params.append('keyword', keyword.trim());
      }

      const apiUrl = `/api/task/getTasksList?${params.toString()}`;
      console.log('Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('API result:', result);

      if (result.code === 0) {
        if (result.data?.pagination) {
          console.log('Updating totalPages to:', result.data.pagination.total_pages);
          setTotalPages(result.data.pagination.total_pages || 1);
          console.log('Updating totalTasks to:', result.data.pagination.total);
          setTotalTasks(result.data.pagination.total || 0);
        }
        console.log('Returning tasks:', result.data?.tasks?.length || 0);
        return result.data?.tasks || [];
      } else if (result.code === 4012) {
        router.push('/publisher/auth/login');
        return [];
      } else {
        // 其他错误返回空数组
        console.log('API error:', result.code, result.message);
        return [];
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return [];
    }
  };

  // 加载数据（依赖页码）
  const loadTasks = async () => {
    console.log('loadTasks called with currentPage:', currentPage);
    setLoading(true);
    try {
      console.log('Fetching tasks for page:', currentPage);
      const newTasks = await fetchTasks(currentPage, '');
      console.log('Fetched tasks:', newTasks.length, 'tasks');
      setOriginalTasks(newTasks);
      setTasks(newTasks);
      console.log('Tasks state updated');
    } catch (error) {
      console.error('加载任务列表失败:', error);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  // 刷新数据（保留当前页码）
  const refreshTasks = async () => {
    try {
      const newTasks = await fetchTasks(currentPage, '');
      setOriginalTasks(newTasks);
      setTasks(newTasks);
      showCopySuccess('数据已更新');
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  };

  // 监听页码变化，重新加载数据
  useEffect(() => {
    console.log('useEffect triggered with currentPage:', currentPage);
    loadTasks();
  }, [currentPage, pageSize]);

  // 初始化轮询和可见性监听
  useEffect(() => {
    // 首次加载已在上面触发，这里只处理轮询
    const pollingInterval = 1 * 60 * 1000; // 1分钟
    pollingIntervalRef.current = setInterval(() => {
      refreshTasks();
    }, pollingInterval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshTasks();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // 空依赖，只运行一次

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

  // 处理分页切换
  const handlePageChange = (page: number) => {
    console.log('handlePageChange called with page:', page);
    if (page < 1 || page > totalPages) {
      console.log('Page out of range:', page, 'totalPages:', totalPages);
      return;
    }
    console.log('Setting currentPage to:', page);
    setCurrentPage(page);
  };

  // 显示复制成功提示
  const showCopySuccess = (message: string) => {
    setTooltipMessage(message);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  // 复制订单号
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      showCopySuccess('订单号已复制');
    }).catch(() => {
      // 静默处理
    });
  };

  // 复制评论
  const handleCopyComment = async (commentText: string): Promise<boolean> => {
    try {
      if (!commentText) throw new Error('评论内容为空');
      await navigator.clipboard.writeText(commentText);
      showCopySuccess('评论已复制');
      return true;
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = commentText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (success) showCopySuccess('评论已复制');
      return success;
    }
  };

  // 跳转到任务详情页
  const navigateToTaskDetail = (taskId: string) => {
    router.push(`/publisher/orders/task-detail/${taskId}`);
  };

  // 任务卡片组件
  const MainOrderCard: React.FC<{
    task: Task;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
  }> = ({ task, onCopyOrderNumber, onViewDetails, onReorder }) => {
    const handleCopy = () => {
      if (onCopyOrderNumber) onCopyOrderNumber(task.task_id.toString());
    };
    const handleViewDetails = () => {
      if (onViewDetails) {
        onViewDetails(task.task_id.toString());
      } else {
        navigateToTaskDetail(task.task_id.toString());
      }
    };
    const handleReorder = () => {
      if (onReorder) {
        onReorder(task.task_id.toString());
      } else {
        router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${task.task_id}&title=${encodeURIComponent(task.template_title)}&description=${encodeURIComponent(task.template_title)}&budget=${task.total_price}&subOrderCount=${task.task_count}`);
      }
    };

    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-5 bg-white">
        <div className="flex items-center overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
            单号：{task.task_id}
          </div>
          <div className="relative">
            <button className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm" onClick={handleCopy}>
              <span>⧉ 复制</span>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
          {task.is_newbie && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              新手任务
            </span>
          )}
        </div>
        <div>发布时间：{task.created_at}</div>
        <div>截止时间：{task.deadline_text}</div>
        <div className="w-full rounded-lg">任务类型：{task.template_title}</div>
        <div className="bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className="text-sm text-blue-600">任务视频链接：</p>
          <OpenVideoButton videoUrl={task.video_url} defaultUrl={dyurl} buttonText="复制链接" />
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
            <span className="text-white text-sm">总价</span>
            <span className="text-white text-sm block">¥{task.total_price}</span>
          </div>
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm">总数量</span>
            <span className="text-white text-sm block">{task.task_count}</span>
          </div>
        </div>
      </div>
    );
  };

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
          <h3 className="font-bold text-gray-800">进行中任务</h3>
          <span className="text-sm text-gray-500">共 {totalTasks || 0} 个任务</span>
        </div>

        <div className="flex-grow max-w-md">
          <div className="grid grid-cols-[79%_20%] gap-1">
            <div className="relative mr-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="h-5 w-5 text-gray-400" />
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
                onViewDetails={(orderId) => navigateToTaskDetail(orderId)}
                onReorder={(orderId) => {
                  // 补单逻辑
                  router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${orderId}&title=${encodeURIComponent(task.template_title)}&description=${encodeURIComponent(task.template_title)}&budget=${task.total_price}&subOrderCount=${task.task_count}`);
                }}
              />
            ))}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-gray-700 font-medium">
                    第 {currentPage} / {totalPages} 页
                  </span>
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