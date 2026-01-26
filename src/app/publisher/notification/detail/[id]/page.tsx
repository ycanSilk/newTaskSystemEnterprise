"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { NotificationDetail, GetNotificationDetailResponse } from '@/app/types/notifications/getNotificationDetailTypes';

export default function NotificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // 从URL获取id参数
  const id = params.id as string;
  
  // 通知数据状态
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 页面加载时获取通知详情
  useEffect(() => {
    const fetchNotificationDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // 调用API获取通知详情
        const response = await fetch(`/api/notifications/getNotificationDetail?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data: GetNotificationDetailResponse = await response.json();
        
        if (data.success) {
          setNotification(data.data);
        } else {
          setError(data.message || '获取通知详情失败');
        }
      } catch (err) {
        setError('网络错误，获取通知详情失败');
        console.error('获取通知详情失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // 只有当id存在时才调用API
    if (id) {
      fetchNotificationDetail();
    }
  }, [id]);
  
  // 处理返回按钮点击
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button 
          onClick={handleBack}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          返回通知列表
        </button>
        
        {/* 加载状态 */}
        {loading && <div className="text-center py-12">加载中...</div>}
        
        {/* 错误状态 */}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        
        {/* 通知详情 */}
        {!loading && !error && notification && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">标题：{notification.title}</h3>
            <p className="mb-4">创建时间：{notification.created_at}</p>
            <div className="mb-4">
              <p className="font-semibold mb-2">通知内容：</p>
              <div className="whitespace-pre-wrap">{notification.content}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}