'use client';
import React from 'react';
import OrderStatus, { OrderStatusType } from '../../order/OrderStatus';
import OrderTaskType, { TaskType } from '../../order/OrderTaskType';
import { CheckCircleOutlined, CloseCircleOutlined,EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { useState } from 'react';


interface AuditOrderCardProps {
  order: {
    id: string;
    taskTitle: string;
    commenterName: string;
    submitTime: string;
    content: string;
    images: string[];
    status: string;
    orderNumber?: string;
    updatedTime?: string;
    submittedLinkUrl?: string;
  };
  onCopyOrderNumber: (orderNumber: string) => void;
  onOrderReview: (orderId: string, action: 'approve' | 'reject') => void;
  onImageClick: (imageUrl: string) => void;
}

const AuditOrderCard: React.FC<AuditOrderCardProps> = ({
  order,
  onCopyOrderNumber,
  onOrderReview,
  onImageClick
}) => {
  // 图片预览状态
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // 评论链接状态
  const [reviewLink, setReviewLink] = useState('');
  // 链接上传状态
  const [linkUploadStatus, setLinkUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  // 处理复制订单号
  const handleCopyOrderNumber = () => {
    onCopyOrderNumber(order.orderNumber || order.id);
  };

  // 处理图片点击
  const handleImageClick = (imageUrl: string) => {
    onImageClick(imageUrl);
  };

  // 处理查看详情
  const handleViewDetails = () => {
    // 这里可以添加查看详情的逻辑
    console.log('View order details:', order.id);
  };

  // 处理评论链接变更
  const handleReviewLinkChange = (value: string) => {
    setReviewLink(value);
    // 模拟上传过程
    setLinkUploadStatus('uploading');
    setTimeout(() => {
      setLinkUploadStatus('success');
    }, 1000);
  };

  // 处理图片预览
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsPreviewOpen(true);
    // 如果外部有onImageClick回调，也调用它
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
  };

  // 处理审核操作
  const handleApprove = () => {
    onOrderReview(order.id, 'approve');
  };

  const handleReject = () => {
    onOrderReview(order.id, 'reject');
  };

  // 获取状态类型
  const getOrderStatusType = (status?: string): OrderStatusType => {
    if (!status) {
      return OrderStatusType.PENDING;
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return OrderStatusType.PENDING;
      case 'processing':
        return OrderStatusType.PROCESSING;
      case 'reviewing':
      case '待审核':
        return OrderStatusType.REVIEWING;
      case 'completed':
      case 'approved':
        return OrderStatusType.COMPLETED;
      case 'rejected':
        return OrderStatusType.REJECTED;
      case 'cancelled':
        return OrderStatusType.CANCELLED;
      default:
        return OrderStatusType.PENDING;
    }
  };

  // 获取任务类型
  const getTaskType = (taskTitle: string): TaskType => {
    if (taskTitle.includes('账号租赁')) {
      return TaskType.ACCOUNT_RENTAL;
    } else if (taskTitle.includes('视频发布')) {
      return TaskType.VIDEO_PUBLISH;
    } else {
      return TaskType.COMMENT;
    }
  };

  return (
    <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-2 bg-white">
      {/* 订单号 */}
      <div className="flex items-center mb-2 overflow-hidden">
        <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
          订单号：{order.orderNumber || order.id}
        </div>
        <button 
          className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
          onClick={handleCopyOrderNumber}
        >
          <span>⧉ 复制</span>
        </button>
      </div>
      
      {/* 订单状态和任务类型 - 同一行且独立占一行 */}
      <div className="flex items-center mb-2 space-x-4">
        <OrderStatus status={getOrderStatusType(order.status)} />
        <OrderTaskType type={getTaskType(order.taskTitle)} />
      </div>
      
      {/* 价格和状态信息 */}
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <span className="text-sm text-black font-medium">订单单价：</span>
          <span className="text-sm text-black">¥6.00</span>
        </div>
      </div>
      
      {/* 时间信息 - 各自独占一行 */}
      <div className="text-sm text-black mb-2">
        发布时间：2025-10-15 12:00:00
      </div>
      <div className="text-sm text-black mb-2">
        提交时间：2025-10-15 14:00:00
      </div>
      
      {/* 领取用户信息展示 */}
      <div className="text-black text-sm mb-2 w-full rounded-lg">
          要求：组合任务，中下评评论
      </div>

      <div className="text-sm text-red-500 mb-2">温馨提示：审核过程中如目标视频丢失，将以接单员完成任务截图为准给予审核结算</div>

      <div className="mb-2 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
        <p className='mb-2  text-sm text-blue-600'>已完成评论点击进入：</p>
        <div className="flex items-center gap-2">
          <a 
            href={order.submittedLinkUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
          >
            <span className="mr-1">⦿</span> 打开视频
          </a>
          {order.submittedLinkUrl && (
            <button
              className="bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
              onClick={() => {
                // 确保submittedLinkUrl存在
                if (order.submittedLinkUrl) {
                  navigator.clipboard.writeText(order.submittedLinkUrl).then(() => {
                    // 创建临时提示元素
                    const tooltip = document.createElement('div');
                    tooltip.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                    tooltip.innerText = '链接已复制';
                    document.body.appendChild(tooltip);
                    // 2秒后移除提示
                    setTimeout(() => {
                      document.body.removeChild(tooltip);
                    }, 2000);
                  }).catch(() => {
                    // 静默处理复制失败
                  });
                }
              }}
            >
              <span className="mr-1">📋</span> 复制链接
            </button>
          )}
        </div>
      </div>

      {/* 截图显示区域 - 自适应高度，居中显示 */}
      <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
        <div className='text-sm text-blue-600 pl-2 py-2'>完成任务截图上传：</div>
        {order.images && order.images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {order.images.map((imageUrl, index) => (
              <div 
                key={index}
                className="w-full h-[100px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:shadow-md flex items-center justify-center"
                onClick={() => handleImagePreview(imageUrl)}
              >
                <img 
                  src={imageUrl} 
                  alt={`任务截图 ${index + 1}`} 
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

      {/* 按钮区域 */}
        <div className="mt-4 flex gap-2">
          <button 
            className="flex-1 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={handleApprove}
          >
            审核通过
          </button>
          <button 
            className="flex-1 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={handleReject}
          >
            驳回订单
          </button>
        </div>
        
        {/* 图片预览模态框 - 适配手机端 */}
        {isPreviewOpen && previewImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4"
            onClick={closeImagePreview}
          >
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                closeImagePreview();
              }}
            >
              ✕
            </button>
            <div className="relative w-full max-w-[90vw] h-[80vh]">
              <img 
                src={previewImage} 
                alt="预览图片" 
                className="w-full h-full object-contain" 
              />
            </div>
            <p className="absolute bottom-4 text-white text-sm">点击空白处或关闭按钮返回</p>
          </div>
        )}
    </div>
  );
};

export default AuditOrderCard;