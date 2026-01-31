'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';
// 导入任务类型定义
import { PendingTask, PendingTasksListResponse } from '../../../types/task/pendingTasksListTypes';
import { Task,
  SingleTaskItem,
  ComboTaskItem,
  BaseTaskItem,
  ComboInfo } from '../../../types/task/getTasksListTypes';
// 导入打开视频按钮组件
import OpenVideoButton from '@/components/button/taskbutton/OpenVideoButton';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';

const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function AwaitingReviewTabPage() {
  // 状态管理 - 只使用PendingTask类型
  const [awaitingReviewOrders, setAwaitingReviewOrders] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  // 显示复制成功提示
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 数据缓存和轮询相关
  const [lastFetchedData, setLastFetchedData] = useState<PendingTask[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 模态框状态
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [verificationNotes, setVerificationNotes] = useState<{[key: string]: string}>({});
  const [currentOrder, setCurrentOrder] = useState<PendingTask | null>(null);
  // 使用优化工具
  const { globalFetch } = useOptimization();

// API调用 - 获取待审核任务列表
  const fetchPendingTasks = async (disableCache = false) => {
    try {
      // 使用全局fetch包装器，获得缓存和重试等优化功能
      const data: PendingTasksListResponse = await globalFetch('/api/task/pendingTasksList', {
        method: 'GET',
        credentials: 'include'
      }, {
        // 启用缓存，缓存时间5分钟，但在审核操作后禁用缓存
        enableCache: !disableCache,
        expiry: 5 * 60 * 1000,
        // 启用自动重试
        enableRetry: true,
        retryCount: 3,
        retryDelay: 1000
      });
      
      if (data.success && data.data) {
        return data.data.list || [];
      }
      return [];
    } catch (error) {
      console.error('获取待审核任务列表失败:', error);
      return [];
    }
  };

  // 检查数据是否有变化
  const hasDataChanged = (newData: PendingTask[], oldData: PendingTask[]): boolean => {
    if (newData.length !== oldData.length) return true;
    
    // 比较任务ID，检查是否有新增或删除的任务
    const newTaskIds = new Set(newData.map(order => order.b_task_id));
    const oldTaskIds = new Set(oldData.map(order => order.b_task_id));
    
    if (newTaskIds.size !== oldTaskIds.size) return true;
    
    // 检查是否有不同的任务ID
    return !Array.from(newTaskIds).every(taskId => oldTaskIds.has(taskId));
  };

  // 刷新任务列表数据
  const refreshTasks = async (disableCache = false) => {
    try {
      const newTasks = await fetchPendingTasks(disableCache);
      
      // 与缓存数据对比
      if (hasDataChanged(newTasks, lastFetchedData)) {
        setAwaitingReviewOrders(newTasks);
        setLastFetchedData(newTasks);
        showCopySuccess('数据已更新');
      }
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    }
  };

  // 初始化数据和设置轮询
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchPendingTasks();
        setAwaitingReviewOrders(initialTasks);
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
        // 当页面重新可见时，主动刷新数据
        // 这将在切换到这个页面时触发
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
  // 图片查看器状态
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // 搜索和过滤功能将直接作用于传入的数据

  // 处理搜索函数已在其他位置定义

  // 处理订单审核
  const handleOrderReview = (order: PendingTask, action: string) => {
    setCurrentOrderId(order.b_task_id.toString());
    setCurrentOrder(order);
    if (action === 'approve') {
      setShowApproveModal(true);
    } else if (action === 'reject') {
      setRejectReason('');
      setShowRejectModal(true);
    }
  };

  // 确认审核通过
  const confirmApprove = async () => {
    if (!currentOrder) return;
    try {
      // 构建请求参数，使用正确的格式
      const requestData = {
        b_task_id: currentOrder.b_task_id,
        record_id: currentOrder.record_id,
        action: 'approve',
        reject_reason: verificationNotes[currentOrderId] || '默认审核通过'
      };
      
      const response = await fetch('/api/task/reviewTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showCopySuccess(data.message || '订单已审核通过');
        setShowApproveModal(false);
        // 重新获取订单列表，禁用缓存以确保获取最新数据
        await refreshTasks(true);
      } else {
        throw new Error(data.message || '审核失败');
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      showCopySuccess('审核失败，请重试');
    }
  };

  // 确认驳回
  const confirmReject = async () => {
    if (!currentOrder) return;
    // 使用模态框中的输入框的值作为驳回理由
    if (!rejectReason.trim()) {
      alert('请输入驳回理由');
      return;
    }
    
    try {
      // 构建请求参数，使用正确的格式
      const requestData = {
        b_task_id: currentOrder.b_task_id,
        record_id: currentOrder.record_id,
        action: 'reject',
        reject_reason: rejectReason
      };
      
      const response = await fetch('/api/task/reviewTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showCopySuccess(data.message || '订单已驳回');
        setShowRejectModal(false);
        // 重新获取订单列表，禁用缓存以确保获取最新数据
        await refreshTasks(true);
      } else {
        throw new Error(data.message || '驳回失败');
      }
    } catch (error) {
      console.error('驳回失败:', error);
      showCopySuccess('驳回失败，请重试');
    }
  };

  // 打开图片查看器
  const openImageViewer = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setShowImageViewer(true);
  };

  // 关闭图片查看器
  const closeImageViewer = () => {
    setShowImageViewer(false);
    setCurrentImageUrl('');
  };

  // 过滤最近订单
  const filterRecentOrders = (orders: PendingTask[]) => {
    return orders.filter(order => {
      if (!order.submitted_at) return false;
      
      const orderTime = new Date(order.submitted_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return orderTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (orders: PendingTask[]) => {
    if (!searchTerm.trim()) return orders;
    
    return orders.filter(order => {
      return (
        order.b_task_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.template_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recommend_mark?.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // 排序审核任务
  const sortAuditTasks = (orders: PendingTask[]) => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          // 只使用submitted_at字段
          const timeA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
          const timeB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
          return timeB - timeA;
        case 'status':
          // 待审核任务默认状态为待审核
          return '待审核'.localeCompare('待审核');
        default:
          return 0;
      }
    });
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }



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

  // 获取过滤和搜索后的订单
  const filteredOrders = sortAuditTasks(searchOrders(filterRecentOrders(awaitingReviewOrders)));
  
  // 处理搜索
  const handleSearch = () => {
    // 由于我们直接使用传入的数据，搜索将在前端过滤中体现
    // 不需要额外的API调用
  };

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 统一的复制成功提示 - 全局管理 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}
      
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title="待审核的订单"
        totalCount={awaitingReviewOrders.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewAllUrl="/publisher/allsuborders"
        onViewAllClick={() => router.push('/publisher/orders')}
      />
      
      {/* 视频模态框已移除，使用OpenVideoButton组件 */}

      {/* 子订单列表 - 内联实现AuditOrderCard功能 */}
      {filteredOrders.map((order, index) => (
          <div key={`pending-${order.b_task_id}-${index}`} className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
            {/* 订单号 */}
            <div className="flex items-center mb-1 overflow-hidden">
              <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
                订单号：{order.b_task_id}
              </div>
              <div className="relative">
                <button 
                  className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
                  onClick={() => handleCopyOrderNumber(order.b_task_id.toString())}
                >
                  <span>⧉ 复制</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                任务类型：{order.template_title}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                任务阶段：待审核
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                任务状态：待审核
              </span>
            </div>
            {/* 价格和状态信息 */}
          <div className="text-sm text-black font-medium mb-1">单价：{order.reward_amount}</div>
          <div className="text-sm text-black mb-1">提交时间：{order.submitted_at}</div>           
          {/* 领取用户信息展示 */}
          <div className="text-black text-sm mb-1 w-full rounded-lg">评论员：{order.c_username || '未知'}</div>
          <div className="text-black text-sm mb-1 w-full rounded-lg">评论类型：{order.template_title}</div>
          <div className="flex items-start justify-between mb-1 text-blue-600">任务的要求评论：{order.recommend_mark?.comment || ''}</div>
          <div className="text-sm text-red-500 mb-1">温馨提示：审核过程中如目标视频或评论丢失，将以接单员完成任务截图为准给予审核结算</div>
          <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
            <p className='mb-1  text-sm text-blue-600'>已完成评论点击进入：</p>
            <div className="flex gap-2 flex-wrap">
              <OpenVideoButton 
                videoUrl={order.comment_url}
                defaultUrl={dyurl}
                buttonText="打开抖音"
              />
              
              {/* 查看提交的图片组件 */}
              {Array.isArray(order.screenshots) && order.screenshots.length > 0 && (
                <button
                  className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
                  onClick={() => {
                    // 打开图片查看器
                    setCurrentImageUrl(order.screenshots[0]);
                    setShowImageViewer(true);
                  }}
                >
                  查看图片 ({order.screenshots.length})
                </button>
              )}
            </div>
            <p className='text-sm text-blue-600'>提交的截图：</p>
            {/* 图片缩略图展示 */}
            {Array.isArray(order.screenshots) && order.screenshots.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {order.screenshots.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`提交的截图 ${index + 1}`}
                    className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setCurrentImageUrl(imgUrl);
                      setShowImageViewer(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 审核备注输入框 */}
          <div className="mb-4 border border-blue-500 rounded-lg p-2 bg-blue-50">
            <label className="block text-sm font-medium text-blue-600 mb-1">审核备注</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y min-h-[50px]"
              placeholder="请输入审核备注信息..."
              value={verificationNotes[order.b_task_id.toString()] || ''}
              onChange={(e) => setVerificationNotes(prev => ({...prev, [order.b_task_id.toString()]: e.target.value}))}
              disabled={false}
            />
          </div>

          {/* 按钮区域 */}
            <div className="mt-4 flex gap-2 justify-end">
              <button 
                className="py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                onClick={() => handleOrderReview(order, 'approve')}
                disabled={false}
              >
                审核通过
              </button>
              <button 
                className="py-2 px-4 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                onClick={() => handleOrderReview(order, 'reject')}
                disabled={false}
              >
                驳回订单
              </button>
            </div>
        </div>
      ))}
    
    {/* 审核通过确认模态框 */}
    {showApproveModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 w-[90%] max-w-md">
          <h3 className="text-lg font-medium mb-3">确认审核通过</h3>
          <p className="text-gray-600 mb-4">您确定要审核通过这个订单吗？</p>
          <div className="flex justify-end gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowApproveModal(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              onClick={confirmApprove}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* 驳回订单模态框 */}
    {showRejectModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 w-full max-w-md">
          <h3 className="text-lg font-medium mb-3">驳回订单</h3>
          <p className="text-gray-600 mb-1">请输入驳回理由：</p>
          <textarea 
            className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px]"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因..."
          />
          <div className="flex justify-end gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowRejectModal(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              onClick={confirmReject}
            >
              确定驳回
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* 图片查看器 */}
    {showImageViewer && (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ">
        <button 
          className="absolute top-4 right-4 text-white text-2xl bg-blue-500 p-2 rounded-full"
          onClick={closeImageViewer}
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
        </button>
        <div 
            className="relative max-w-[300px] max-h-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={currentImageUrl} 
              alt="预览图片" 
              className="max-w-[300px] max-h-[600px] object-contain"
            />
          </div>
      </div>
    )}
    
    </div>
  );
}