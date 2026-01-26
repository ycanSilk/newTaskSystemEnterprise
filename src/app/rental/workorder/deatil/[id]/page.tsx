'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Tag, Space, Input, message, Upload, Image, Divider, Modal, Form } from 'antd';
import { SendOutlined, PaperClipOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadProps, ModalProps } from 'antd';

// 引入工单详情类型定义
import { WorkOrderDetail, WorkOrderDetailResponse } from '@/app/rental/types/workorder/getOrderDetailInfoTypes';
// 引入发送消息类型定义
import { SendMessageRequest, SendMessageResponse, SendMessageResponseData } from '@/app/rental/types/workorder/sendMessageTypes';
// 引入用户状态管理
import { useUserStore } from '@/store/userStore';

const WorkOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  
  // 获取当前登录用户信息和方法
  const { currentUser, fetchUser } = useUserStore();
  
  // 从路由参数和查询参数中获取数据
  const ticketIdFromPath = params.id as string;
  const [ticketId, setTicketId] = useState<string>(ticketIdFromPath);
  const [ticket, setTicket] = useState<string>('');
  
  // 状态管理
  const [loading, setLoading] = useState<boolean>(true);
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  // 轮询相关状态
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  // 关闭工单对话框状态
  const [isCloseModalVisible, setIsCloseModalVisible] = useState<boolean>(false);
  const [closeReason, setCloseReason] = useState<string>('问题已解决');
  const [closingWorkOrder, setClosingWorkOrder] = useState<boolean>(false);
  // 图片上传状态
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  // 表单实例
  const closeWorkOrderForm = Form.useFormInstance();
  
  // 获取URL查询参数
  useEffect(() => {
    const url = new URL(window.location.href);
    const ticketNoParam = url.searchParams.get('ticket_no') || '';
    const ticketIdParam = url.searchParams.get('ticket_id') || ticketIdFromPath;
    
    console.log('从URL获取到的ticket_no:', ticketNoParam);
    setTicket(ticketNoParam);
    setTicketId(ticketIdParam);
  }, [ticketIdFromPath]);
  
  // 消息列表容器引用，用于滚动控制
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 滚动消息列表到底部
  const scrollMessagesToBottom = () => {
    console.log('=== 执行滚动消息列表到底部 ===');
    console.log('messagesContainerRef.current:', messagesContainerRef.current);
    if (messagesContainerRef.current) {
      // 使用setTimeout确保DOM已经更新
      setTimeout(() => {
        messagesContainerRef.current!.scrollTop = messagesContainerRef.current!.scrollHeight;
      }, 0);
    }
  };
  
  // 获取用户信息
  useEffect(() => {
    console.log('=== 获取用户信息 ===');
    // 调用fetchUser确保currentUser有值
    fetchUser();
  }, []);
  
  // 页面加载时获取工单详情
  useEffect(() => {
    // 只有当ticket有值时才调用API
    if (ticket) {
      fetchWorkOrderDetail();
    }
  }, [ticketId, ticket]);  
  //ticket就是从url获取的ticket_no字段的值，这里改成ticket是为了保持和API中间件的get字段一致；const ticket = url.searchParams.get('ticket') || '';
  
  // 消息更新时滚动到底部
  useEffect(() => {
    // 只有当有消息时才滚动
    if (workOrder && workOrder.recent_messages && workOrder.recent_messages.length > 0) {
      scrollMessagesToBottom();
    }
  }, [workOrder?.recent_messages]);
  
  // 组件初始化完成后滚动到底部
  useEffect(() => {
    // 确保组件已经挂载且有消息列表
    if (workOrder && workOrder.recent_messages && workOrder.recent_messages.length > 0) {
      scrollMessagesToBottom();
    }
  }, []);
  
  // 页面加载完成后滚动到底部
  useEffect(() => {
    // 确保组件已经挂载
    scrollMessagesToBottom();
  }, []);
  
  // 定时轮询逻辑，每60秒获取一次工单详情
  useEffect(() => {
    console.log('=== 轮询效果设置 ===');
    console.log('当前ticket值:', ticket);
    if (!ticket) {
      console.log('ticket为空，不启动轮询');
      return;
    }
    
    // 轮询函数
    const pollWorkOrderDetail = async () => {
      try {
        console.log('=== 开始轮询获取工单详情 ===');
        // 调用现有的fetchWorkOrderDetail函数获取最新数据，设置showLoading为false实现无感刷新
        await fetchWorkOrderDetail(false);
        // 更新最后更新时间
        setLastUpdateTime(Date.now());
        console.log('=== 轮询结束，最后更新时间:', new Date(Date.now()).toLocaleTimeString());
      } catch (err) {
        console.error('轮询获取工单详情失败:', err);
      }
    };
    
    // 立即执行一次轮询，然后每60秒执行一次
    console.log('立即执行一次轮询...');
    pollWorkOrderDetail();
    
    // 启动轮询，每60秒执行一次
    console.log('启动轮询，每60秒执行一次');
    const interval = setInterval(pollWorkOrderDetail, 60000);
    setPollingInterval(interval);
    console.log('轮询定时器ID:', interval);
    
    // 组件卸载时清除轮询
    return () => {
      console.log('=== 清除轮询定时器 ===');
      if (interval) {
        clearInterval(interval);
        setPollingInterval(null);
        console.log('轮询定时器已清除');
      }
    };
  }, [ticket]);
  
  // 获取工单详情
  const fetchWorkOrderDetail = async (showLoading: boolean = true) => {
    console.log('=== 开始获取工单详情 ===');
    console.log('showLoading参数:', showLoading);
    // 如果ticket为空，不发送请求
    if (!ticket) {
      console.log('ticket值为空，不发送API请求');
      if (showLoading) {
        setLoading(false);
      }
      return;
    }
    
    // 根据showLoading参数决定是否显示加载状态
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('调用API获取工单详情，ticket:', ticket);
      // 调用实际的API请求获取工单详情，添加缓存控制
      const response = await fetch(`/api/workOrder/getOrderDetailInfo?ticket=${ticket}`, {
        method: 'GET',
        credentials: 'include', // 包含cookie，确保认证Token被发送
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate', // 禁用缓存
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('API响应状态:', response.status);
      const data: WorkOrderDetailResponse = await response.json();
      console.log('API响应数据:', data);
      
      if (data.code === 0) {
        // API调用成功
        console.log('=== API调用成功，处理工单详情 ===');
        
        // 打印API返回的所有消息，重点关注最新消息
        console.log('API返回的消息总数量:', data.data.recent_messages.length);
        console.log('API返回的消息ID范围:', {
          minId: Math.min(...data.data.recent_messages.map(msg => msg.id)),
          maxId: Math.max(...data.data.recent_messages.map(msg => msg.id))
        });
        
        // 获取当前消息列表的消息ID集合
        const currentMessageIds = new Set(workOrder?.recent_messages?.map(msg => msg.id) || []);
        console.log('当前消息ID集合:', Array.from(currentMessageIds));
        
        // 检测所有新消息（不仅仅是客服消息）
        const newMessages = data.data.recent_messages.filter(msg => !currentMessageIds.has(msg.id));
        console.log('新消息数量:', newMessages.length);
        console.log('新消息列表:', newMessages);
        
        // 如果有新消息，或者当前没有消息列表，就更新
        const hasNewMessages = newMessages.length > 0 || !workOrder?.recent_messages?.length;
        
        if (hasNewMessages) {
          // 有新消息，更新工单详情
          console.log('=== 检测到新消息，更新工单详情 ===');
          setWorkOrder(data.data);
          // 记录最后更新时间
          setLastUpdateTime(Date.now());
          
          // 立即滚动消息列表到底部
          setTimeout(() => {
            scrollMessagesToBottom();
          }, 100);
        } else {
          // 没有新消息，不更新
          console.log('=== 没有检测到新消息，不更新工单详情 ===');
        }
      } else {
        // API调用失败，显示错误信息
        setError(data.message || '获取工单详情失败');
        message.error(data.message || '获取工单详情失败');
      }
    } catch (err) {
      setError('获取工单详情失败，请稍后重试');
      message.error('获取工单详情失败，请稍后重试');
      console.error('获取工单详情失败:', err);
    } finally {
      // 根据showLoading参数决定是否隐藏加载状态
      if (showLoading) {
        setLoading(false);
      }
      console.log('=== 获取工单详情结束 ===');
    }
  };
  
  // 发送消息
  const handleSendMessage = async () => {
    console.log('=== 开始发送消息 ===');
    console.log('消息内容:', messageContent);
    console.log('上传图片:', uploadedImages);
    
    if (!messageContent.trim() && uploadedImages.length === 0) {
      message.warning('请输入消息内容或上传图片');
      return;
    }
    
    // 保存当前发送的消息内容和附件，用于构建新消息
    const sentContent = messageContent;
    const sentAttachments = [...uploadedImages];
    
    try {
      // 过滤掉空的图片URL，确保attachments数组中的所有URL都是有效的
      const validAttachments = uploadedImages.filter(url => url && url.trim() !== '');
      
      // 构建请求体
      const requestBody: SendMessageRequest = {
        ticket_id: parseInt(ticketId),
        message_type: validAttachments.length > 0 ? 1 : 0, // 有有效图片: 1, 纯文本: 0
        content: messageContent,
        attachments: validAttachments
      };
      
      console.log('过滤后的有效图片URL:', validAttachments);
      
      // 调用API发送消息
      console.log('调用API发送消息，请求体:', requestBody);
      const response = await fetch('/api/workOrder/sendMessage', {
        method: 'POST',
        credentials: 'include', // 包含cookie，确保认证Token被发送
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API响应状态:', response.status);
      const data: SendMessageResponse = await response.json();
      console.log('API响应数据:', data);
      
      // 检查success字段（根据实际API响应，返回的是success字段）
      if (data.success) {
        // 发送成功
        console.log('=== 消息发送成功 ===');
        
        // 立即清空输入框和已上传图片
        console.log('=== 清空输入框和已上传图片 ===');
        setMessageContent('');
        setUploadedImages([]);
        
        // 立即获取最新消息列表，确保消息列表更新
        console.log('=== 立即获取最新消息列表 ===');
        await fetchWorkOrderDetail(false);
        
        // 滚动消息列表到底部
        scrollMessagesToBottom();
      } else {
        // 发送失败
        message.error(data.message || '消息发送失败');
      }
    } catch (err) {
      message.error('消息发送失败，请稍后重试');
      console.error('发送消息失败:', err);
    }
    console.log('=== 发送消息结束 ===');
  };
  
  // 关闭工单
  const handleCloseWorkOrder = () => {
    setIsCloseModalVisible(true);
  };

  // 关闭工单对话框 - 取消按钮
  const handleCloseModalCancel = () => {
    setIsCloseModalVisible(false);
    setCloseReason('问题已解决');
  };

  // 关闭工单对话框 - 确认按钮
  const handleCloseModalConfirm = async () => {
    try {
      // 表单验证
      await closeWorkOrderForm.validateFields();
      
      setClosingWorkOrder(true);
      
      // 构建请求体
      const requestBody = {
        ticket_id: parseInt(ticketId),
        close_reason: closeReason
      };
      
      // 调用API关闭工单
      const response = await fetch('/api/workOrder/closeWorkOrder', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success || data.code === 0) {
        // 关闭成功
        message.success(data.message || '工单关闭成功');
        setIsCloseModalVisible(false);
        setCloseReason('问题已解决');
        
        // 刷新工单详情
        await fetchWorkOrderDetail();
      } else {
        // 关闭失败
        message.error(data.message || '工单关闭失败');
      }
    } catch (error) {
      console.error('关闭工单失败:', error);
      message.error('关闭工单失败，请稍后重试');
    } finally {
      setClosingWorkOrder(false);
    }
  };
  
  // 上传图片
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      // 检查图片数量限制
      if (uploadedImages.length >= 3) {
        message.warning('最多只能上传3张图片');
        setUploadingImage(false);
        return false;
      }
      
      // 创建FormData对象，用于上传图片
      const formData = new FormData();
      formData.append('image', file);
      
      // 调用真实的图片上传API
      const response = await fetch('/api/imagesUpload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      console.log('图片上传API响应:', data);
      
      if (data.code === 0) {
        // 上传成功，直接获取url字段（根据日志，url是string类型）
        const imageUrl = data.data.url;
        
        console.log('获取到的图片URL:', imageUrl);
        
        if (imageUrl) {
          // 将图片URL添加到已上传图片数组
          setUploadedImages([...uploadedImages, imageUrl]);
          message.success('图片上传成功');
        } else {
          message.error('图片上传失败：返回URL为空');
          console.error('图片上传失败：返回URL为空，响应数据:', data);
        }
      } else {
        message.error(data.message || '图片上传失败');
        console.error('图片上传失败，响应数据:', data);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败，请稍后重试');
    } finally {
      setUploadingImage(false);
    }
    
    return false; // 阻止自动上传
  };
  
  // 删除已上传的图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };
  
  // 渲染工单详情
  const renderWorkOrderDetail = () => {
    if (!workOrder) return null;
    
    return (
      <Card className="border-0 rounded-lg shadow-sm mb-4">
        {/* 工单基本信息 */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-semibold">{workOrder.title}</h2>
            <Tag color={workOrder.status === 0 ? 'warning' : workOrder.status === 1 ? 'processing' : 'success'}>
              {workOrder.status_text}
            </Tag>
          </div>
          <div className="text-xs space-y-1 mb-3">
            <p>工单编号：{workOrder.ticket_no}</p>
            <p>创建时间：{workOrder.created_at}</p>
            <p>更新时间：{workOrder.updated_at}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-3">
            <p className="text-sm font-medium mb-1">问题描述：</p>
            <p className="text-xs">{workOrder.description}</p>
          </div>
        </div>
        
        <Divider className="my-4" />
        
        {/* 订单信息 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3">订单信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs">订单ID:{workOrder.order_info.order_id}</p>
              
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs">订单类型:{workOrder.order_info.source_type_text}</p>
              
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs">订单金额:¥{workOrder.order_info.total_amount_yuan}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs">租赁天数:{workOrder.order_info.days} 天</p>
              
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs">订单状态:{workOrder.order_info.order_status_text}</p>
              
            </div>
          </div>
        </div>
        
        <Divider className="my-4" />
        
        {/* 参与人信息 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3">参与人信息</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-blue-500 mb-1">买家</p>
              <p className="text-sm font-medium">{workOrder.order_info.buyer_username}</p>              
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-blue-500 mb-1">卖家</p>
              <p className="text-sm font-medium">{workOrder.order_info.seller_username}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  // 渲染消息列表
  const renderMessageList = () => {
    if (!workOrder?.recent_messages) return null;
    
    // 添加消息列表渲染日志
    console.log('=== 渲染消息列表 ===');
    console.log('渲染的消息数量:', workOrder.recent_messages.length);
    console.log('渲染的消息ID范围:', {
      minId: Math.min(...workOrder.recent_messages.map(msg => msg.id)),
      maxId: Math.max(...workOrder.recent_messages.map(msg => msg.id))
    });
    console.log('当前用户信息:', currentUser);
    
    return (
      <Card className="border-0 rounded-lg shadow-sm mb-4">
        <h3 className="text-sm font-semibold mb-3">消息记录</h3>
        
        {/* 消息列表 */}
        <div ref={messagesContainerRef} className="bg-gray-50 rounded-lg py-4 px-2 mb-4" style={{ height: '400px', overflowY: 'auto' }}>
          {workOrder.recent_messages.map((message) => {
            // 添加每条消息渲染日志
            console.log(`=== 渲染消息 ${message.id} ===`);
            console.log('消息内容:', message.content);
            console.log('发送者类型:', message.sender_type_text);
            console.log('发送者ID:', message.sender_id);
            console.log('当前用户ID:', currentUser?.id);
            
            // 判断是否为自己发送的消息
            const isSelf = currentUser?.id && message.sender_id === parseInt(currentUser.id);
            console.log('是否为自己发送的消息:', isSelf);
            
            return (
              <div key={message.id} className="mb-4">
                {/* 系统消息 */}
                {message.sender_type === 4 && (
                  <div className="text-center mb-3">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-700">
                      {message.created_at}
                    </span>
                  </div>
                )}
                
                {/* 普通消息 - 左右分栏显示 */}
                <div className={`flex ${message.sender_type === 4 ? 'justify-center' : isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${message.sender_type === 4 ? 'bg-gray-200' : isSelf ? 'bg-blue-100' : 'bg-white'}`}>
                    {/* 只显示非自己发送的消息的发送者名称 */}
                    {!isSelf && (
                      <div className="text-xs">
                        {/* 修复发送者名称显示 */}
                        {message.sender_type_text === "Admin" ? "系统客服" : 
                         (message.sender_type_text === "C端" || message.sender_type_text === "B端") ? (currentUser?.username || "用户") : 
                         message.sender_type_text || "系统通知"}

                         <span className="text-xs text-gray-400 ml-2">{message.created_at}</span>
                      </div>

                    )}
                    
                    
                    
                    {/* 消息附件 */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {message.attachments.map((attachment, index) => (
                          <Image
                            key={index}
                            src={attachment}
                            alt={`消息图片 ${index + 1}`}
                            width={100}
                            className="rounded cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                    {/* 消息内容 */}
                    <div className="text-sm whitespace-pre-wrap mt-1">{message.content}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 发送消息区域 */}
        <div>
          {/* 已上传图片预览 */}
          {uploadedImages.length > 0 && (
            <div className="flex gap-2 mb-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative w-16 h-16">
                  <Image src={image} alt={`已上传图片 ${index + 1}`} width={64} height={64} className="rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* 上传图片按钮 */}
          <div className="mb-2">
            <Upload
              beforeUpload={handleImageUpload}
              fileList={[]}
              accept="image/*"
              maxCount={3 - uploadedImages.length}
            >
              <Button icon={<PaperClipOutlined />} size="small" className='py-4 bg-blue-600 text-white'>
                上传图片
              </Button>
            </Upload>
          </div>
          
          {/* 输入框 */}
          <Input.TextArea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="输入消息内容..."
            style={{ height: 80 }}
            className="mb-2"
          />
          
          {/* 发送按钮 */}
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              发送
            </Button>
          </div>
          
          {/* 底部按钮 */}
          <div className="flex justify-center mt-3">
            {workOrder.can_close && (
              <Button
                type="default"
                onClick={handleCloseWorkOrder}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                关闭工单
              </Button>
            )}
          </div>
          
          {/* 轮询状态显示 */}
          <div className="text-xs text-gray-500 text-center mt-2">
            最后更新: {new Date(lastUpdateTime).toLocaleTimeString()}
          </div>
        </div>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-1 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-800 mb-6">工单详情</h1>
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">正在加载数据，请稍候...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-800 mb-6">工单详情</h1>
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button 
              type="default" 
              onClick={() => fetchWorkOrderDetail(true)} 
              size="small" 
              className="mt-2"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold text-gray-800">工单详情</h1>
          <Button
            type="default"
            onClick={() => router.push('/rental/workorder')}
            size="small"
          >
            返回列表
          </Button>
        </div>
        
        {/* 工单详情 */}
        {renderWorkOrderDetail()}
        
        {/* 消息列表 */}
        {renderMessageList()}
      </div>

      {/* 关闭工单对话框 */}
      <Modal
        title="关闭工单"
        open={isCloseModalVisible}
        onCancel={handleCloseModalCancel}
        onOk={handleCloseModalConfirm}
        confirmLoading={closingWorkOrder}
        okText="确认关闭"
        cancelText="取消"
        width={500}
      >
        <Form
          form={closeWorkOrderForm}
          layout="vertical"
          initialValues={{ closeReason: '问题已解决' }}
        >
          <Form.Item
            name="closeReason"
            label="关闭备注"
            rules={[{ required: true, message: '请输入关闭备注' }]}
          >
            <Input.TextArea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="请输入关闭工单的备注信息"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkOrderDetailPage;