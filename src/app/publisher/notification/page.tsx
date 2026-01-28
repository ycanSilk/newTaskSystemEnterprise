"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GetNotificationsListResponse, NotificationItem } from '@/app/types/notifications/getNotificationsListTypes';
import { useToast } from '@/components/ui/Toast';

export default function NotificationPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  // 通知数据状态
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 页面加载时获取通知列表
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/notifications/getNotificationsList', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data: GetNotificationsListResponse = await response.json();
        
        if (data.success && data.data) {
          setNotifications(data.data.list);
          setUnreadCount(data.data.unread_count);
        } else {
          setError(data.message || '获取通知列表失败');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? `网络或系统错误: ${err.message}` : '获取通知列表时发生未知错误';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const handleBack = () => {
    router.back();
  };

  // 标记通知为已读
  const markAsRead = (notificationId: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: 1 }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 标记全部已读
  const handleMarkAllAsRead = async () => {
    // 获取所有未读消息的ID
    const unreadIds = notifications
      .filter(notification => notification.is_read === 0)
      .map(notification => notification.id);
    
    // 如果没有未读消息，提示用户
    if (unreadIds.length === 0) {
      addToast({
        title: '提示',
        message: '没有未读消息无需标记',
        type: 'info'
      });
      return;
    }
    
    try {
      // 调用API标记全部已读
      const response = await fetch('/api/notifications/markRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: null,
          ids: unreadIds
        })
      });
      
      // 解析响应数据
      const data = await response.json();
      
      // 显示API返回的结果
      if (data.success) {
        addToast({
          title: '成功',
          message: `${data.message}，共标记${data.data?.affected_count || 0}条消息`,
          type: 'success'
        });
        
        // 更新本地状态，将所有消息标记为已读
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      } else {
        addToast({
          title: '失败',
          message: data.message || '标记全部已读失败',
          type: 'error'
        });
      }
    } catch (error) {
      // 处理API调用错误
      addToast({
        title: '错误',
        message: '标记全部已读失败，请稍后重试',
        type: 'error'
      });
      console.error('标记全部已读失败:', error);
    }
  };

  // 点击通知卡片
  const handleNotificationPress = (notification: NotificationItem) => {
    if (notification.is_read === 0) {
      markAsRead(notification.id);
    }
    // 跳转到通知详情页
    router.push(`/commenter/notification/detail/${notification.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="px-5 py-4 flex items-center">
          <button 
            onClick={handleBack}
            className="text-gray-600 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-800">通知提醒</h1>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* 未读消息提示和操作 */}
      {unreadCount >= 0 && (
        <div className="bg-orange-50 text-red-700 px-6 py-2 text-sm flex justify-between items-center">
          <span>您有 {unreadCount} 条未读消息</span>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:underline font-medium"
          >
            标记全部已读
          </button>
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 border-opacity-70 mb-4"></div>
          <div className="text-gray-600">加载中...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <div className="text-red-600 font-medium mb-2">加载失败</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      ) : (
        /* 通知列表 */
        <div className="p-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationPress(notification)}
              className={`bg-white mb-2 p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${notification.is_read === 1 ? 'hover:bg-gray-50' : 'bg-blue-50'}`}
            >
              {/* 通知头部：标题和时间 */}
              <div className="flex justify-between items-start relative">
                <div className="font-medium text-gray-800 flex items-center pl-2">
                  {/* 未读标识 */}
                  {notification.is_read === 0 && (
                    <div className="inline-block mr-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  标题：{notification.title}
                  
                </div>
                <div className="text-xs text-gray-500 flex flex-col items-end">
                  <span>创建时间：{notification.created_at}</span>
                </div>
              </div>
              <div className="">
                <div 
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${notification.is_read === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {notification.is_read === 0 ? '未读' : '已读'}
                </div>
                {notification.read_at && (
                  <div className="text-green-600">阅读时间: {notification.read_at}</div>
                )}
              </div>
              
              {/* 通知内容 */}
              <div className="my-1">
                <div className="text-sm text-gray-600 bg-gray-200 px-2 py-3 rounded">通知：{notification.preview}</div>
              </div>
            </div>
          ))}

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
      )}
    </div>
  );
}