"use client"
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DownloadOutlined, MessageOutlined, UserOutlined, DollarOutlined, CalendarOutlined, FileTextOutlined, TrophyOutlined, ShareAltOutlined, LikeOutlined, LockOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons';
// 定义后端API返回的子订单数据类型
interface ApiSubOrder {
  id: string;
  mainTaskId: string;
  mainTaskTitle: string;
  mainTaskPlatform: string;
  workerId: string | null;
  workerName: string | null;
  agentId: string | null;
  agentName: string | null;
  commentGroup: string;
  commentType: string;
  unitPrice: number;
  userReward: number;
  agentReward: number;
  status: string;
  acceptTime: string | null;
  expireTime: string | null;
  submitTime: string | null;
  completeTime: string | null;
  settleTime: string | null;
  submittedImages: string[] | null;
  submittedLinkUrl: string | null;
  submittedComment: string | null;
  verificationNotes: string | null;
  rejectReason: string | null;
  cancelReason: string | null;
  cancelTime: string | null;
  releaseCount: number;
  settled: boolean;
  verifierId: string | null;
  verifierName: string | null;
  createTime: string;
  updateTime: string;
  taskDescription: string | null;
  taskRequirements: string | null;
  taskDeadline: string | null;
  remainingMinutes: number | null;
  isExpired: boolean | null;
  isAutoVerified: boolean | null;
  canSubmit: boolean | null;
  canCancel: boolean | null;
  canVerify: boolean | null;
  verifyResult: string | null;
  verifyTime: string | null;
  verifyComment: string | null;
  settlementStatus: string | null;
  settlementTime: string | null;
  settlementRemark: string | null;
  workerRating: number | null;
  workerComment: string | null;
  publisherRating: number | null;
  publisherComment: string | null;
  firstGroupComment: string | null;
  secondGroupComment: string | null;
  firstGroupImages: string[] | null;
  secondGroupImages: string[] | null;
}

// 定义前端展示使用的子订单数据类型
export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: string;
  commentContent: string;
  submitTime: string;
  submitLink: string;
  screenshots: string[];
  reviewTime?: string;
  reward?: number;
  content?: string;
  createTime?: string;
  updateTime?: string;
}

// 定义任务详情数据类型
interface TaskDetail {
  id: string;
  publisherId: string;
  publisherName: string | null;
  title: string;
  description: string;
  platform: string;
  taskType: string;
  status: string;
  totalQuantity: number;
  completedQuantity: number;
  availableCount: number;
  unitPrice: number;
  totalAmount: number;
  deadline: string;
  requirements: string;
  publishedTime: string;
  completedTime: string | null;
  createTime: string;
  updateTime: string;
  pendingSubTaskCount: number | null;
  acceptedSubTaskCount: number | null;
  submittedSubTaskCount: number | null;
  completedSubTaskCount: number | null;
  completionRate: number | null;
  remainingDays: number | null;
  isExpired: boolean | null;
  publisherAvatar: string | null;
  publisherTaskCount: number | null;
  publisherSuccessRate: number | null;
  commentDetail: any | null;
  canAccept: boolean | null;
  cannotAcceptReason: string | null;
}

// 订单详情页面组件
const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string || '';

  const [order, setOrder] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('commentTime-desc');
  const [activeTab, setActiveTab] = useState<'suborders' | 'history'>('suborders');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [subOrderFilter, setSubOrderFilter] = useState('all');
  const [subOrders, setSubOrders] = useState<SubOrder[]>([]);

  // 定义获取订单详情的函数，使其可以在其他地方调用
  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      // 调用publishertasks/maintaskdetail API获取订单详情数据
      const response = await fetch('/api/task/maintaskdetail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId: orderId })
      });
      
      // 无论HTTP状态码如何，都尝试解析JSON响应体
      const data = await response.json().catch(() => ({
        success: false,
        message: '无效的响应格式',
        data: null
      }));
      
      // 根据响应状态码和data.success字段判断请求是否成功
      if (!response.ok || !data.success || !data.data) {
        const errorMessage = data.message || `请求失败: ${response.statusText || '未知错误'}`;
        console.error('API响应错误:', response.status, errorMessage);
        throw new Error(errorMessage);
      }
      setOrder(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单详情失败，请稍后重试';
      setError(errorMessage);
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // 从后端API获取子订单数据
  const fetchSubOrders = async () => {
    try {
      // 调用subtasklist API获取子订单数据
      const response = await fetch('/api/task/subtasklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          taskId: orderId,
          page: 0,
          size: 10,
          sortField: 'createTime',
          sortOrder: 'DESC'
        })
      });
      
      // 解析响应数据
      const data = await response.json();
      
      // 检查响应是否成功
      if (!response.ok || !data.success || !data.data) {
        const errorMessage = data.message || `获取子订单失败: ${response.statusText || '未知错误'}`;
        console.error('获取子订单API响应错误:', response.status, errorMessage);
        // 发生错误时使用空数组
        setSubOrders([]);
        return;
      }
      
      // 确保list是数组类型
      const apiSubOrders: ApiSubOrder[] = Array.isArray(data.data.list) ? data.data.list : [];
      
      // 将API返回的数据映射到前端展示需要的格式
      const formattedSubOrders: SubOrder[] = apiSubOrders.map((apiSubOrder) => ({
        id: apiSubOrder.id,
        orderId: apiSubOrder.mainTaskId,
        userId: apiSubOrder.workerId || '',
        userName: apiSubOrder.workerName || '未分配',
        status: apiSubOrder.status.toLowerCase(), // 转换为小写以匹配现有逻辑
        commentContent: apiSubOrder.submittedComment || apiSubOrder.firstGroupComment || '暂无评论内容',
        submitTime: apiSubOrder.submitTime || apiSubOrder.createTime,
        submitLink: apiSubOrder.submittedLinkUrl || '',
        screenshots: apiSubOrder.submittedImages || apiSubOrder.firstGroupImages || []
      }));
      
      setSubOrders(formattedSubOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取子订单失败，请稍后重试';
      console.error('Failed to fetch sub orders:', err);
      // 发生错误时使用空数组
      setSubOrders([]);
    }
  };

  // 组件加载时获取订单详情和子订单数据
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
      fetchSubOrders();
    }
  }, [orderId]);

  // 处理返回按钮点击
  const handleBack = () => {
    router.push('/publisher/orders');
  };

  // 处理审核操作
  const handleReview = async (subOrderId: string, approve: boolean) => {
    try {
      // 调用审核API
      const response = await fetch(`/api/suborders/${subOrderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: approve ? 'accept' : 'reject' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `审核操作失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 重新获取订单详情和子订单数据以更新状态
      await fetchOrderDetail();
      fetchSubOrders();
      
      alert('审核成功');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '审核操作失败，请稍后重试';
      console.error('审核操作失败:', error);
      alert(`审核失败: ${errorMessage}`);
    }
  };  

  // 获取子订单状态文本和样式
  const getSubOrderStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      'pending': { text: '待处理', className: 'bg-blue-500 text-white rounded-md px-2' },
      'processing': { text: '进行中', className: 'bg-blue-500 text-white rounded-md px-2' },
      'reviewing': { text: '待审核', className: 'bg-blue-500 text-white rounded-md px-2' },
      'completed': { text: '已完成', className: 'bg-blue-500 text-white rounded-md px-2' },
      'rejected': { text: '已驳回', className: 'bg-blue-500 text-white rounded-md px-2' }
    };
    return statusMap[status] || { text: status, className: 'bg-blue-500 text-white rounded-md px-2' };
  };

  // 筛选子订单
  const getFilteredSubOrders = () => {
    if (subOrderFilter === 'all') {
      return subOrders;
    }
    return subOrders.filter(subOrder => subOrder.status === subOrderFilter);
  };

  // 子订单卡片组件
  const SubOrderCard: React.FC<{ subOrder: SubOrder; index: number }> = ({ subOrder, index }) => {
    const router = useRouter();
    const statusInfo = getSubOrderStatusInfo(subOrder.status);
    const isReviewable = subOrder.status === 'reviewing';

    const handleCopy = () => {
      navigator.clipboard.writeText(subOrder.id);
      // 显示短暂提示
      const copyBtn = document.getElementById(`suborder-copy-notification-${index}`);
      if (copyBtn) {
        copyBtn.style.display = 'inline';
        setTimeout(() => {
          copyBtn.style.display = 'none';
        }, 2000);
      }
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        {/* 订单头部信息 */}
        <div className="mb-2">
          {/* 订单编号区域 */}
          <div className="flex items-center mb-2">
            <div className='w-[83%] flex items-center'>
              <span className="text-sm">订单编号：</span>
              <span className="flex-1 whitespace-nowrap overflow-hidden">{subOrder.id}</span>
            </div>
            <div className='w-[15%] flex items-right justify-end float-right'>
              <button
                onClick={handleCopy}
                className="text-blue-500 text-sm text-right mr-2"
              >
                复制
              </button>
              <p id={`suborder-copy-notification-${index}`} style={{display: 'none', marginLeft: '8px', color: 'green'}} className="text-sm">已复制！</p>
            </div>
          </div>
          {/* 订单状态与领取用户区域 */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              领取用户：<span className="font-medium">{subOrder.userName}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-sm mb-1">评论内容：</p>
          <div className="bg-blue-50 border border-blue-500 p-2 rounded">
            <p className="text-sm">{subOrder.commentContent}</p>
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-sm">提交时间：</p>
          <p className="font-medium">{formatDate(subOrder.submitTime)}</p>
        </div>
        
        <div className="mb-2">
          <p className="text-sm mb-2">提交链接：</p>
          <div className='bg-blue-50 border border-blue-500 p-2 rounded'>
            <a 
              href={subOrder.submitLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 break-all whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-full"
            >
              {subOrder.submitLink}
            </a>
          </div>
          
        </div>
        
        {subOrder.screenshots.length > 0 && (
          <div>
            <p className="text-sm mb-2">提交截图：</p>
            <div className="bg-gray-100 rounded flex items-center justify-center cursor-pointer" onClick={() => setSelectedScreenshot(subOrder.screenshots[0])}>
              <img 
                src={subOrder.screenshots[0]} 
                alt="评论截图" 
                className="max-h-40 object-contain" 
              />
            </div>
          </div>
        )}
        
        {/* 待审核订单的操作按钮 */}
        {isReviewable && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex space-x-3 sm:space-x-4 w-full">
              <button
                onClick={() => handleReview(subOrder.id, true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
              >
                通过
              </button>
              <button
                onClick={() => handleReview(subOrder.id, false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                驳回
              </button>
            </div>
          </div>
        )}
        {/* 查看详情按钮 - 所有订单都显示 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={() => router.push(`/publisher/orders/task-detail/${orderId}/suborders-detail/${subOrder.id}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 处理导出订单
  const handleExport = async () => {
    try {
      if (!orderId) {
        throw new Error('无效的订单ID');
      }
      
      const response = await fetch(`/api/orders/${orderId}/export`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '导出失败');
      }

      // 处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_${orderId}_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导出失败，请稍后重试';
      console.error('导出失败:', error);
      alert(`导出失败: ${errorMessage}`);
    }
  };

  // 复制到剪贴板功能
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态对应的中文名称和样式
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      'IN_PROGRESS': { text: '进行中', className: 'bg-blue-500 text-white', icon: <ClockCircleOutlined className="h-4 w-4" /> },
      'COMPLETED': { text: '已完成', className: 'bg-blue-100 text-blue-800', icon: <CheckCircleOutlined className="h-4 w-4" /> },
      'PENDING': { text: '待处理', className: 'bg-blue-100 text-blue-800', icon: <ClockCircleOutlined className="h-4 w-4" /> },
      'CANCELLED': { text: '已取消', className: 'bg-blue-100 text-blue-800', icon: <ExclamationCircleOutlined className="h-4 w-4" /> }
    };
    return statusMap[status] || { text: status, className: 'bg-blue-100 text-blue-800', icon: <ExclamationCircleOutlined className="h-4 w-4" /> };
  };

  // 获取任务类型对应的图标和文本
  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { text: string; icon: React.ReactNode; className: string }> = {
      'COMMENT': { text: '评论任务', icon: <MessageOutlined className="h-5 w-5" />, className: 'text-blue-500' }
    };
    return typeMap[type] || { text: '未知类型', icon: <FileTextOutlined className="h-5 w-5" />, className: 'text-gray-500' };
  };

  // 计算子订单统计信息
  const getSubOrderStats = () => {
    if (!order) return { total: 0, pending: 0, processing: 0, reviewing: 0, completed: 0, rejected: 0, cancelled: 0 };
    
    const stats = {
      total: order.totalQuantity,
      pending: order.pendingSubTaskCount || 0,
      processing: order.acceptedSubTaskCount || 0,
      reviewing: order.submittedSubTaskCount || 0,
      completed: order.completedQuantity,
      rejected: 0,
      cancelled: 0
    };

    return stats;
  };

  // 计算完成进度
  const getCompletionRate = () => {
    if (!order || !order.totalQuantity || order.totalQuantity === 0) return 0;
    // 使用后端计算的完成率，如果没有则自行计算
    if (order.completionRate !== null) return order.completionRate;
    return Math.round((order.completedQuantity / order.totalQuantity) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-24"></div>
            <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded-md"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded-md"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回订单列表
          </button>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ExclamationCircleOutlined className="h-12 w-12 text-red-500" />
              <p className="text-gray-700 text-lg font-medium">{error || '订单不存在或已被删除'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回订单列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSubOrderStats();
  const completionRate = getCompletionRate();
  const typeInfo = getTypeInfo(order.taskType);
  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回订单列表
          </button>

          {/* 订单头部信息 */}
          <div className="bg-white shadow-sm rounded-lg px-5 py-3 mb-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">订单信息</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
            </div>
            
            {/* 订单基本信息 */}
                <div className="mb-4">
                  {/* 订单标题和订单类型在同一行显示 */}
                  <div className="space-y-2 text-sm">
                        <p className="text-gray-700">• 任务标题：{order.title}</p>
                        <div className="flex items-center mb-2 w-full overflow-hidden">
                          <div className="w-[80%] overflow-hidden text-overflow-ellipsis whitespace-nowrap">• 主任务单号：{order.id}</div>
                          <div className="w-[5%]"></div>
                          <div className="w-[15%]">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.id || '');
                                const copyBtn = document.getElementById('copy-notification');
                                if (copyBtn) {
                                  copyBtn.style.display = 'inline';
                                  setTimeout(() => {
                                    copyBtn.style.display = 'none';
                                  }, 2000);
                                }
                              }}
                              className="text-blue-600 w-full text-center"
                              disabled={!order.id}
                            >
                              复制
                            </button>
                            <p id="copy-notification" style={{display: 'none', marginLeft: '8px', color: 'green'}} className="text-sm">已复制！</p>
                          </div>
                        </div>
                        <p className="text-gray-700">• 任务类型：{typeInfo.text}</p>
                        <p className="text-gray-700">• 发布时间：{order.publishedTime}</p>
                        <p className="text-gray-700">• 截至时间：{order.deadline}</p>
                        <p className="text-gray-700">• 已完成子任务数量：{order.completedQuantity}</p>
                        <p className="text-gray-700">• 未完成子任务数量：{order.availableCount}</p>
                        <div className="mb-4">
                          <p className="text-sm mb-2">任务描述</p>
                          <div className="bg-blue-50 p-3 rounded-sm text-sm border border-blue-500 ">
                            {order.description}
                          </div>
                        </div>
                         <div className="mb-4">
                          <p className="text-sm">任务要求</p>
                          <div className="bg-blue-50 p-3 rounded-sm text-sm border border-blue-500 ">
                            {order.description}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm">评论详情</p>
                          <div className="bg-blue-50 p-3 rounded-sm text-sm border border-blue-500 ">
                            {JSON.stringify(order.commentDetail)}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm">视频链接</p>
                          <div className="bg-blue-50 p-3 rounded-sm text-sm border border-blue-500 mb-2">
                            {JSON.stringify(order.commentDetail)}
                          </div>
                          <button
                            onClick={() => {
                              // 假设order.commentDetail中包含视频链接，如果是复杂对象可以进一步解析
                              const videoUrl = typeof order.commentDetail === 'string' ? order.commentDetail : JSON.stringify(order.commentDetail);
                              if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
                                window.open(videoUrl, '_blank');
                              } else {
                                alert('无效的视频链接');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                          >
                            打开视频
                          </button>
                        </div>
                  </div>
            </div>
            {/* 订单进度 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-gray-900">完成进度</h3>
                <span className="text-sm font-medium text-blue-600">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            
            {/* 订单统计 - 同一行均等宽度 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-blue-500 mb-1">总价</div>
                <div className="text-sm font-bold text-gray-900">¥{order.totalAmount}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-green-500 mb-1">单价</div>
                <div className="text-sm font-bold text-gray-900">¥{order.unitPrice.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-purple-500 mb-1">总数</div>
                <div className="text-sm font-bold text-gray-900">{order.totalQuantity}</div>
              </div>
            </div>

            <div>            
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">子任务统计</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                        <div className="text-sm text-blue-700">进行中</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.reviewing}</div>
                        <div className="text-sm text-orange-700">待审核</div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-sm text-green-700">已完成</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-yellow-700">待处理</div>
                      </div>
                    </div>
                  </div>
            </div>
        </div>
          


          {/* 标签页 - 调整为均等宽度 */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('suborders')}
                  className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'suborders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  子订单 ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  操作历史
                </button>
              </nav>
            </div>
            
            {/* 标签页内容 */}
            <div className="">
              {activeTab === 'suborders' && (
                <div>
                  {/* 子任务统计 - 重构为选项卡交互形式 */}
                  <div className="bg-white rounded-lg shadow-sm p-2">
                    {/* 子任务列表 */}
                    <div className="mt-6">
                      {/* 筛选子订单 */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="w-full">
                            <select
                              value={subOrderFilter}
                              onChange={(e) => setSubOrderFilter(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="all">全部状态</option>
                              <option value="pending">待处理</option>
                              <option value="processing">进行中</option>
                              <option value="reviewing">待审核</option>
                              <option value="completed">已完成</option>
                              <option value="rejected">已驳回</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* 动态渲染子订单列表 */}
                      <div className="space-y-4">
                        {getFilteredSubOrders().map((subOrder, index) => (
                          <SubOrderCard key={subOrder.id} subOrder={subOrder} index={index} />
                        ))}
                      </div>
                      
                      {/* 无数据提示 */}
                      {getFilteredSubOrders().length === 0 && (
                        <div className="text-center py-8 border border-gray-200 border-dashed rounded-lg">
                          <p className="text-gray-500">暂无符合条件的子订单</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className='p-3'>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">任务时间线</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <ClockCircleOutlined className="text-gray-500" />
                      <span>创建时间: {order.createTime ? formatDate(order.createTime) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <ClockCircleOutlined className="text-gray-500" />
                      <span>发布时间: {order.publishedTime ? formatDate(order.publishedTime) : 'N/A'}</span>
                    </div>
                    {order.completedTime && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <ClockCircleOutlined className="text-gray-500" />
                        <span>完成时间: {formatDate(order.completedTime)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-700">
                      <ClockCircleOutlined className="text-gray-500" />
                      <span>更新时间: {order.updateTime ? formatDate(order.updateTime) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* 图片查看大图模态框 */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedScreenshot(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedScreenshot} 
              alt="大图预览" 
              className="max-w-full max-h-[90vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;