'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
// Publisher auth storage removed
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';

// 确保导入类型和必要的依赖

// 定义数据类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

interface AwaitingReviewData {
  list: AwaitingReviewOrder[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface AwaitingReviewOrder {
  id: string;
  mainTaskId: string;
  mainTaskTitle: string;
  mainTaskPlatform: string;
  workerId: string;
  workerName: string;
  agentId: string;
  agentName: string;
  commentGroup: string;
  commentType: string;
  unitPrice: number;
  userReward: number;
  agentReward: number;
  status: string;
  acceptTime: string;
  expireTime: string;
  submitTime: string;
  completeTime: string;
  settleTime: string;
  submittedImages: string;
  submittedLinkUrl: string;
  submittedComment: string;
  verificationNotes: string;
  rejectReason: string;
  cancelReason: string;
  cancelTime: string;
  releaseCount: number;
  settled: boolean;
  verifierId: string;
  verifierName: string;
  createTime: string;
  updateTime: string;
  taskDescription: string;
  taskRequirements: string;
  taskDeadline: string;
  remainingMinutes: number;
  isExpired: boolean;
  isAutoVerified: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  canVerify: boolean;
  verifyResult: string;
  verifyTime: string;
  verifyComment: string;
  settlementStatus: string;
  settlementTime: string;
  settlementRemark: string;
  workerRating: number;
  workerComment: string;
  publisherRating: number;
  publisherComment: string;
  firstGroupComment: string;
  secondGroupComment: string;
  firstGroupImages: string;
  secondGroupImages: string;
}

interface AwaitingReviewTabPageProps {
  awaitingReviewOrders?: AwaitingReviewOrder[];
  awaitingReviewData?: AwaitingReviewData | null;
  loading?: boolean;
}

export default function AwaitingReviewTabPage({ 
  awaitingReviewOrders = [], 
  awaitingReviewData = null, 
  loading = false 
}: AwaitingReviewTabPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  // 显示复制成功提示
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 视频模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  // 模态框状态
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [verificationNotes, setVerificationNotes] = useState<{[key: string]: string}>({});
  const [currentOrder, setCurrentOrder] = useState<AwaitingReviewOrder | null>(null);
  // 图片查看器状态
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // 搜索和过滤功能将直接作用于传入的数据

  // 处理搜索函数已在其他位置定义

  // 处理订单审核
  const handleOrderReview = (order: AwaitingReviewOrder, action: string) => {
    setCurrentOrderId(order.id);
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
      // 构建请求参数
      const requestData = {
        subTaskId: currentOrderId,
        verifyResult: 'PASS',
        verifyNotes: verificationNotes[currentOrderId] || '',
        evidenceImages: currentOrder.submittedImages
      };
      
      const response = await fetch('/api/task/reviewtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success || data.code === 1) {
        showCopySuccess('订单已审核通过');
        setShowApproveModal(false);
        
        // 重新获取订单列表将由父组件处理，这里只需要显示成功提示
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
    if (!rejectReason.trim()) {
      alert('请输入驳回理由');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showCopySuccess('订单已驳回');
      setShowRejectModal(false);
      
      // 重新获取订单列表将由父组件处理，这里只需要显示成功提示
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
  const filterRecentOrders = (orders: any[]) => {
    return orders.filter(order => {
      const orderTime = new Date(order.submitTime).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return orderTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (orders: AwaitingReviewOrder[]) => {
    if (!searchTerm.trim()) return orders;
    
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mainTaskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.submittedComment.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 排序审核任务
  const sortAuditTasks = (orders: any[]) => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
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
        totalCount={awaitingReviewData?.total || awaitingReviewOrders.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewAllUrl="/publisher/allsuborders"
        onViewAllClick={() => router.push('/publisher/orders')}
      />
      
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

      {/* 子订单列表 - 内联实现AuditOrderCard功能 */}
      {filteredOrders.map((order, index) => (
        <div key={`pending-${order.id}-${index}`} className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
          {/* 订单号 */}
          <div className="flex items-center mb-1 overflow-hidden">
            <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
              订单号：{order.id}
            </div>
            <div className="relative">
              <button 
                className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
                onClick={() => handleCopyOrderNumber(order.id)}
              >
                <span>⧉ 复制</span>
              </button>
            </div>
          </div>
          
          {/* 订单状态和任务类型 - 同一行且独立占一行 */}
          <div className="flex items-center mb-1 space-x-4">
            <div className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
              {order.status === 'PENDING' ? '待审核' : order.status}
            </div>
            <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
              {order.mainTaskPlatform}
            </div>
          </div>
          
          {/* 价格和状态信息 */}
          <div className="mb-1">
            <div className="flex items-center mb-1">
              <span className="text-sm text-black font-medium">单价：</span>
              <span className="text-sm text-black">¥{order.unitPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {/* 时间信息 - 各自独占一行 */}
          <div className="text-sm text-black mb-1">
            发布时间：{order.createTime}
          </div>
          <div className="text-sm text-black mb-1">
            提交时间：{order.submitTime}
          </div>
          
          {/* 领取用户信息展示 */}
          <div className="text-black text-sm mb-1 w-full rounded-lg">
              评论员：{order.workerName}
          </div>
          <div className="text-black text-sm mb-1 w-full rounded-lg">
              评论类型：{order.commentType}
          </div>

          <div className="text-sm text-red-500 mb-1">温馨提示：审核过程中如目标视频丢失，将以接单员完成任务截图为准给予审核结算</div>
          
          {/* 评论展示和复制功能 */}
          {order.submittedComment && (
            <div className="mb-3 p-2 border border-gray-200 rounded-lg bg-blue-50">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">提交的评论：</span>
                <button
                  className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                  onClick={() => handleCopyComment(order.submittedComment || '')}
                >
                  <span className="mr-1">⧉</span> 复制评论
                </button>
              </div>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{order.submittedComment}</p>
            </div>
          )}

          <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
            <p className='mb-1  text-sm text-blue-600'>已完成评论点击进入：</p>
            <a 
              href={order.submittedLinkUrl || ''} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
              onClick={(e) => {
                e.preventDefault();
                // 复制视频链接
                if (order.submittedLinkUrl) {
                  navigator.clipboard.writeText(order.submittedLinkUrl).then(() => {
                    showCopySuccess('视频链接已复制');
                  }).catch(() => {
                    // 静默处理复制失败
                  });
                }
                // 设置当前视频URL并打开模态框
                setCurrentVideoUrl('https://v.douyin.com/oiunFce071s/');
                setIsModalOpen(true);
              }}
            >
              <span className="mr-1">⦿</span> 打开视频
            </a>
          </div>

          {/* 截图显示区域 - 自适应高度，居中显示 */}
          <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className='text-sm text-blue-600 pl-2 py-2'>完成任务截图上传：</div>
            {order.submittedImages ? (
              <div className="grid grid-cols-3 gap-2">
                {/* 假设submittedImages是逗号分隔的URL字符串 */}
                {order.submittedImages.split(',').map((imageUrl: string, imgIndex: number) => (
                  <div 
                    key={imgIndex}
                    className="w-[90px] h-[90px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:shadow-md flex items-center justify-center"
                    onClick={() => openImageViewer(imageUrl.trim())}
                  >
                    <img 
                      src={imageUrl.trim()} 
                      alt={`任务截图 ${imgIndex + 1}`} 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                      <span className="text-blue-600 text-xs opacity-0 hover:opacity-100 transition-opacity">点击放大</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">未上传截图</span>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-1 pl-2">
              点击可放大查看截图
            </p>
          </div>
          
          {/* 审核备注输入框 */}
          <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">审核备注（选填）</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y min-h-[80px]"
              placeholder="请输入审核备注信息..."
              value={verificationNotes[order.id] || ''}
              onChange={(e) => setVerificationNotes(prev => ({...prev, [order.id]: e.target.value}))}
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
                disabled={!order.canVerify}
              >
                驳回订单
              </button>
            </div>
        </div>
      ))}
    
    {/* 审核通过确认模态框 */}
    {showApproveModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 w-full max-w-md">
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
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <button 
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={closeImageViewer}
        >
          ×
        </button>
        <img 
          src={currentImageUrl} 
          alt="大图查看" 
          className="max-w-[90%] max-h-[90%] object-contain"
        />
      </div>
    )}
    
    </div>
  );
}