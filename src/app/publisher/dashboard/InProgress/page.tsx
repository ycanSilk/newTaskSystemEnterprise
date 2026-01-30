'use client';
import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';
// 导入任务类型定义
import { Task } from '../../../types/task/getTasksListTypes';

const dyurl = "https://www.douyin.com/root/search/%E5%8E%86%E5%8F%B2?aid=f899c1f2-9412-482f-899a-707dc155272c&modal_id=7401070415860239656&type=general"

// 获取平台中文名称
const getPlatformName = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'DOUYIN': '抖音'
  };
  return platformMap[platform] || platform;
};

// 获取任务状态中文名称
const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'IN_PROGRESS': '进行中',
    'IN_PENDING': '待审核',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

// 获取任务类型中文名称
const getTaskTypeName = (taskType: string): string => {
  const taskTypeMap: Record<string, string> = {
    'COMMENT': '评论任务'
  };
  return taskTypeMap[taskType] || taskType;
};

// 组件Props接口
interface ActiveTabPageProps {
  tasks: Task[];
}

export default function ActiveTabPage({ tasks }: ActiveTabPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在UI中处理
  };

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
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-5 bg-white space-y-2">
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
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center p-1 text-sm  bg-blue-100 text-blue-700`}>
            任务状态：{task.status_text}
          </span>
          <span className="inline-flex items-center p-1 text-sm  bg-blue-100 text-blue-700">
            任务类型：评论任务
          </span>
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
          <a 
            href={task.video_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm  inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              // 复制评论（不使用await，避免返回Promise）
              handleCopyComment(task.video_url).then(() => {
                // 设置当前视频URL并打开模态框
                setCurrentVideoUrl(task.video_url);
                setIsModalOpen(true);
              });
            }}
          >
             打开视频
          </a>
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
      {/* 打开视频确认模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">提示</h3>
            <p className="text-gray-700 mb-6">是否需要打开抖音APP？</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  console.log("传递的url",currentVideoUrl)
                  // 打开视频链接，确保使用完整的URL格式
                  let videoUrl = dyurl;
                  // 清理URL，移除可能的localhost前缀
                  if (videoUrl.includes('localhost:3000')) {
                    videoUrl = videoUrl.replace(/http:\/\/localhost:3000/, '');
                  }
                  // 确保URL以http://或https://开头
                  if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
                    videoUrl = 'http://' + videoUrl;
                  }
                  // 打开视频链接
                  window.open(videoUrl);
                  // 关闭模态框
                  setIsModalOpen(false);
                  
                }}
              >
                确定
              </button>
            </div>
          </div>
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