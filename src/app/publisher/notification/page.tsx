"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义订单通知类型
type OrderNotificationType = {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  price: string;
  submitInfo: string;
  submitTime: string;
  isRead: boolean;
};

export default function NotificationPage() {
  const router = useRouter();
  
  // 模拟订单通知数据 - 仅待审核状态的订单
  const [notifications, setNotifications] = useState<OrderNotificationType[]>([
    {
      id: '1',
      orderId: 'ORDER20241015001',
      userId: 'USER1001',
      userName: '张小明',
      userAvatar: '👤',
      price: '¥50.00',
      submitInfo: '已完成美食探店任务，提交了5张照片和100字评价',
      submitTime: '2024-10-15 10:23:45',
      isRead: false
    },
    {
      id: '2',
      orderId: 'ORDER20241014002',
      userId: 'USER1002',
      userName: '李华',
      userAvatar: '🙋',
      price: '¥30.00',
      submitInfo: '已完成商品评价任务，提交了3张照片和50字评价',
      submitTime: '2024-10-14 16:45:30',
      isRead: false
    },
    {
      id: '3',
      orderId: 'ORDER20241014001',
      userId: 'USER1003',
      userName: '王小红',
      userAvatar: '👩',
      price: '¥45.00',
      submitInfo: '已完成视频拍摄任务，提交了1个30秒短视频',
      submitTime: '2024-10-14 09:12:15',
      isRead: true
    }
  ]);

  // 计算未读通知数量
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // 当页面加载时，可以通过localStorage同步未读状态
  useEffect(() => {
    // 这里模拟从localStorage读取未读状态
    const savedUnreadStatus = localStorage.getItem('notificationReadStatus');
    if (savedUnreadStatus) {
      const readStatus = JSON.parse(savedUnreadStatus);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          isRead: readStatus[notification.id] || false
        }))
      );
    }
  }, []);

  // 保存未读状态到localStorage
  const saveReadStatus = (notificationId: string, isRead: boolean) => {
    const currentStatus = notifications.reduce((acc, notification) => {
      acc[notification.id] = notification.id === notificationId ? isRead : notification.isRead;
      return acc;
    }, {} as Record<string, boolean>);
    localStorage.setItem('notificationReadStatus', JSON.stringify(currentStatus));
  };

  const handleBack = () => {
    router.back();
  };

  // 标记通知为已读
  const markAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    saveReadStatus(notificationId, true);
  };

  // 查看订单详情
  const handleViewOrderDetail = (notification: OrderNotificationType, event?: React.MouseEvent) => {
    // 标记为已读
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // 跳转到订单审核页面 - 使用字符串路径并添加类型断言以解决构建错误
    router.push(`/publisher/orders/review?id=${notification.orderId}` as any);
    
    // 阻止事件冒泡
    if (event) {
      event.stopPropagation();
    }
  };

  // 点击通知卡片
  const handleNotificationPress = (notification: OrderNotificationType) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    console.log('通知被点击:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* 未读消息提示 */}
      {unreadCount > 0 && (
        <div className="bg-orange-200 text-red-500 px-4 py-2 text-sm">
          您有 {unreadCount} 条未读消息
        </div>
      )}

      {/* 通知列表 */}
      <div className="mt-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            onClick={() => handleNotificationPress(notification)}
            className={`bg-white mb-2 p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${notification.isRead ? 'hover:bg-gray-50' : 'bg-blue-50'}`}
          >
            {/* 未读标识 */}
            {!notification.isRead && (
              <div className="absolute -right-1 -top-1 bg-red-500 rounded-full w-3 h-3"></div>
            )}

            {/* 通知头部：订单号和时间 */}
            <div className="flex justify-between items-start mb-3 relative">
              <div className="font-medium text-gray-800">订单号: {notification.orderId}</div>
              <span className="text-xs text-gray-500">{notification.submitTime}</span>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-2">
                {notification.userAvatar || '👤'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{notification.userName}</div>
                <div className="text-xs text-gray-500">用户ID: {notification.userId}</div>
              </div>
            </div>

            {/* 订单信息 */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">订单价格</span>
                <span className="text-sm font-bold text-gray-800">{notification.price}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">提交信息：</div>
                <div className="text-gray-600 bg-gray-50 p-2 rounded">{notification.submitInfo}</div>
              </div>
            </div>

            {/* 操作按钮 */}
            <button 
              onClick={(e) => handleViewOrderDetail(notification, e)}
              className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              查看订单详情
            </button>
          </div>
        ))}
      </div>

      {/* 空状态提示（当没有通知时显示） */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-500">暂无通知消息</p>
        </div>
      )}
    </div>
  );
}