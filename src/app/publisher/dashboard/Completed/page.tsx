'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';
// 导入任务类型定义
import { Task } from '../../../types/task/getTasksListTypes';

// 组件Props接口
interface CompletedTabPageProps {
  tasks: Task[];
}

export default function CompletedTabPage({ tasks }: CompletedTabPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 视频模态框状态
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

  // 过滤最近订单
  const filterRecentOrders = (tasks: Task[]) => {
    return tasks.filter(task => {
      const taskTime = new Date(task.created_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return taskTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (tasks: Task[]) => {
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
        <div className="flex items-center space-x-3 mb-1 pb-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm  bg-blue-100 text-blue-700`}>
            任务状态：{task.status_text}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm  bg-blue-100 text-blue-700">
            任务类型：评论任务
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
          <a 
            href={task.video_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm  inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              // 复制评论
              handleCopyComment(task.template_title);
              // 设置当前视频URL并打开模态框
              setCurrentVideoUrl(task.video_url);
              setIsModalOpen(true);
            }}
          >
             打开视频
          </a>
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

        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white  py-2 px-4 rounded-md transition-colors"
            onClick={handleViewDetails}
          >
            查看详情
          </button>
          <button
            onClick={handleReorder}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors ml-2"
          >
            再次下单
          </button>
        </div>
      </div>
    );
  };

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
                  // 打开视频链接
                  window.open(currentVideoUrl, '_blank');
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
    </div>
  );
}