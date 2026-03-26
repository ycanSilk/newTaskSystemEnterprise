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
// 导入 GlobalWarningModal 组件
import GlobalWarningModal from '@/components/button/globalWarning/GlobalWarningModal';


const dyurl = "https://www.douyin.com/video/7598199346240228614"

// 独立页面组件，不接收外部传入的数据
export default function AwaitingReviewTabPage() {
  // 状态管理 - 只使用PendingTask类型
  const [awaitingReviewOrders, setAwaitingReviewOrders] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  // 轮询相关
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 模态框状态
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [verificationNotes, setVerificationNotes] = useState<{[key: string]: string}>({});
  const [currentOrder, setCurrentOrder] = useState<PendingTask | null>(null);
  // GlobalWarningModal 状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    buttonText: '确认',
    redirectUrl: ''
  });
  // 音频播放状态
  const isPlayingSoundRef = useRef<boolean>(false);
  // 用户是否已交互
  const userInteractedRef = useRef<boolean>(false);
  // 上次检测到的任务数量
  const lastTaskCountRef = useRef<number>(0);
  // 刷新任务按钮加载状态
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 检测用户交互
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        // 预加载音频以获得播放权限
        const audio = new Audio('/videos/preview.mp3');
        audio.muted = true;
        audio.play().catch(() => {
          // 预加载音频失败（正常现象）
        });
      }
    };

    // 添加多种交互事件监听器
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleUserInteraction, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, []);

  // 播放提示音
  const playNotificationSound = () => {
    if (isPlayingSoundRef.current) {
      return;
    }
    
    try {
      const audio = new Audio('/videos/preview.mp3');
      audio.volume = 1;
      isPlayingSoundRef.current = true;
      
      audio.play().then(() => {
        // 播放成功
      }).catch(error => {
        // 播放失败
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('ended', () => {
        isPlayingSoundRef.current = false;
      });
      
      audio.addEventListener('error', () => {
        isPlayingSoundRef.current = false;
      });
    } catch (error) {
      isPlayingSoundRef.current = false;
    }
  };

  // 尝试获取音频播放权限
  const tryGetAudioPermission = () => {
    if (!userInteractedRef.current) {
      // 创建一个不可见的音频元素并尝试播放，以获取音频播放权限
      const audio = new Audio('/videos/preview.mp3');
      audio.muted = true;
      audio.play().then(() => {
        userInteractedRef.current = true;
      }).catch(() => {
        // 获取音频播放权限失败（需要用户交互）
      });
    }
  };

// API调用 - 获取待审核任务列表
  const fetchPendingTasks = async () => {
    try {
      // 直接使用fetch，禁用缓存，确保每次都获取最新数据
      const response = await fetch('/api/task/pendingTasksList', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data: PendingTasksListResponse = await response.json();
      
      if (data.success && data.data) {
        return data.data.list || [];
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
      console.error('获取待审核任务列表失败:', error);
      return [];
    }
  };
  
  // 显示复制成功提示
  const showCopySuccess = (message: string) => {
    showAlert(message, '确定');
  };

  // 显示 GlobalWarningModal
  const showAlert = (message: string, buttonText?: string, redirectUrl?: string) => {
    setAlertConfig({
      message,
      buttonText: buttonText || '确认',
      redirectUrl: redirectUrl || ''
    });
    setShowAlertModal(true);
  };
  
  // 刷新任务列表数据
  const refreshTasks = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const newTasks = await fetchPendingTasks();
      const newCount = newTasks.length;
      
      // 尝试获取音频播放权限
      tryGetAudioPermission();
      
      // 如果有新的待审核任务，播放提示音
      if (newCount > 0 && newCount > lastTaskCountRef.current) {
        playNotificationSound();
      }
      
      // 更新上次检测到的任务数量
      lastTaskCountRef.current = newCount;      
      setAwaitingReviewOrders(newTasks);
    } catch (error) {
      console.error('刷新任务列表失败:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 初始化数据和设置轮询
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const initialTasks = await fetchPendingTasks();
        const initialCount = initialTasks.length;
        // 更新上次检测到的任务数量
        lastTaskCountRef.current = initialCount;
        setAwaitingReviewOrders(initialTasks);
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

    // 清理函数
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
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
    console.log('开始审核通过流程，当前订单:', currentOrder);
    try {
      // 构建请求参数，使用正确的格式
      const requestData = {
        b_task_id: currentOrder.b_task_id,
        record_id: currentOrder.record_id,
        action: 'approve',
        reject_reason: verificationNotes[currentOrderId] || '默认审核通过'
      };
      
      console.log('审核通过请求数据:', requestData);
      
      const response = await fetch('/api/task/reviewTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      setShowApproveModal(false);
     
      
      console.log('审核通过API响应状态:', response.status);
      
      const data = await response.json();
      
      console.log('审核通过API响应数据:', data);
      
      if (data.code === 0) {
        // 先关闭审核模态框
        
        // 重新获取订单列表，确保获取最新数据
        await refreshTasks();
        // 通知父组件更新待审核任务数量
        window.dispatchEvent(new CustomEvent('updateAwaitingReviewCount'));
        // 延迟显示成功提示，确保模态框完全关闭
        setTimeout(() => {
          showAlert(data.message || '订单已审核通过', '确定');
        }, 100);
      } else if (data.code === 1001) {
        showAlert('审核失败', '确定');
      } else if (data.code === 4003) {
        showAlert('审核操作无效', '确定');
      } else if (data.code === 4004) {
        showAlert('驳回原因不能为空', '确定');
      } else if (data.code === 4005) {
        showAlert('任务记录不存在', '确定');
      } else if (data.code === 4006) {
        showAlert('无权审核此任务', '确定');
      } else if (data.code === 4007) {
        showAlert('任务状态无效', '确定');
      } else if (data.code === 4009) {
        showAlert('任务信息不存在', '确定');
      }  else if (data.code === 4012) {
        showAlert('账号异常，请联系客服', '确定');
      } else if (data.code === 5001) {
        showAlert('网络超时，请稍后重试', '确定');
      } else if (data.code === 5002) {
        showAlert('审核失败', '确定');
      } else {
        showAlert( '审核失败', '确定');
      }
    } catch (error) {
      console.error('审核通过失败:', error);
      showAlert('审核失败，请重试', '确定');
    }
  };

  // 确认驳回
  const confirmReject = async () => {
    if (!currentOrder) return;
    // 使用模态框中的输入框的值作为驳回理由
    if (!rejectReason.trim()) {
      showAlert('请输入驳回理由', '确定');
      return;
    }
    
    console.log('开始驳回流程，当前订单:', currentOrder);
    console.log('驳回理由:', rejectReason);
    
    try {
      // 构建请求参数，使用正确的格式
      const requestData = {
        b_task_id: currentOrder.b_task_id,
        record_id: currentOrder.record_id,
        action: 'reject',
        reject_reason: rejectReason
      };
      
      console.log('驳回请求数据:', requestData);
      
      const response = await fetch('/api/task/reviewTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      console.log('驳回API响应状态:', response.status);
      
      const data = await response.json();
      
      console.log('驳回API响应数据:', data);
      
      if (data.code === 0) {
        // 先关闭驳回模态框
        setShowRejectModal(false);
        // 重新获取订单列表，确保获取最新数据
        await refreshTasks();
        // 通知父组件更新待审核任务数量
        window.dispatchEvent(new CustomEvent('updateAwaitingReviewCount'));
        // 延迟显示成功提示，确保模态框完全关闭
        setTimeout(() => {
          showAlert(data.message || '订单已驳回', '确定');
        }, 100);
      }  else if (data.code === 1001) {
        showAlert('审核失败', '确定');
      } else if (data.code === 4003) {
        showAlert('审核操作无效', '确定');
      } else if (data.code === 4004) {
        showAlert('驳回原因不能为空', '确定');
      } else if (data.code === 4005) {
        showAlert('任务记录不存在', '确定');
      } else if (data.code === 4006) {
        showAlert('无权审核此任务', '确定');
      } else if (data.code === 4007) {
        showAlert('任务状态无效', '确定');
      } else if (data.code === 4009) {
        showAlert('任务信息不存在', '确定');
      }  else if (data.code === 4012) {
        showAlert('账号异常，请联系客服', '确定');
      } else if (data.code === 5001) {
        showAlert('网络超时，请稍后重试', '确定');
      } else if (data.code === 5002) {
        showAlert('审核失败', '确定');
      } else {
        showAlert( '审核失败', '确定');
      }
    } catch (error) {
      console.error('驳回失败:', error);
      showAlert('驳回失败，请重试', '确定');
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
    <div className="mx-4 mt-6 space-y-2">
      {/* GlobalWarningModal */}
      <GlobalWarningModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        redirectUrl={alertConfig.redirectUrl}
        iconType="info"
      />
      
      <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">进行中任务</h3>
          <span className="text-sm text-gray-500">共 {filteredOrders.length || 0} 个任务</span>
      </div>

      {/* 没有任务时的提示 */}
      {filteredOrders.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">暂无待审核任务</h3>
          <p className="text-gray-500">目前没有需要您审核的任务，请稍后再查看</p>
        </div>
      )}

      {/* 子订单列表 - 内联实现AuditOrderCard功能 */}
      {filteredOrders.length > 0 && filteredOrders.map((order, index) => (
          <div key={`pending-${order.b_task_id}-${index}`} className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
            {/* 订单号 */}
            <div className="flex items-center mb-1 overflow-hidden">
              <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
                单号：{order.b_task_id}
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
                {order.template_title}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                待审核
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                阶段：{order.task_stage}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                {order.task_stage_text}
              </span>
            </div>
            {/* 价格和状态信息 */}
        
          <div className="text-sm text-black mb-1">提交时间：{order.submitted_at}</div>           
          {/* 领取用户信息展示 */}
       
          <div className="text-black text-sm mb-1 w-full rounded-lg">评论类型：{order.template_title}</div>
          <div className="flex items-start justify-between mb-1 text-blue-600">任务的要求评论：{order.recommend_mark?.comment || ''}</div>
          <div className="text-sm text-red-500 mb-1">温馨提示：审核过程中如目标视频或评论丢失，将以接单员完成任务截图为准给予审核结算</div>
          <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
            <p className='mb-1  text-sm text-blue-600'>已完成评论链接：</p>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1">
                <OpenVideoButton 
                  videoUrl={order.comment_url}
                  defaultUrl={dyurl}
                  buttonText="复制链接"
                />
                
                {/* 查看提交的图片组件 */}
                {Array.isArray(order.screenshots) && order.screenshots.length > 0 && (
                  <button
                    className="bg-green-600  text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center mt-2"
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
              <div className="flex-1">
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
            </div>
          </div>

          {/* 审核备注输入框 */}
          <div className=" border border-blue-500 rounded-lg p-2 bg-blue-50">
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
            <div className="mt-2 flex gap-2 justify-end">
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

             {/* 刷新任务按钮 */}
            
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
    <div className="flex justify-center mt-10">
              <button 
                onClick={() => refreshTasks()}
                className="bg-blue-600 text-white px-10 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
              
                <span>刷新任务</span>
              </button>
            </div>
    </div>
  );
}