"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 导入Zustand用户状态存储
import { useUserStore } from '@/store/userStore';

// 类型定义
interface ConfigInfo {
  name: string; // 固定名称
  douyin_id: string; // 抖音ID（@用户ID）
}

interface QuickTaskConfigData {
  id: number;
  b_user_id: number;
  username: string;
  config_info: ConfigInfo;
  created_at: string;
  updated_at: string;
}

interface GetConfigResponse {
  success: boolean;
  message: string;
  data: QuickTaskConfigData | null;
  code?: number;
  timestamp?: number;
}

interface UpdateConfigRequest {
  config_info: ConfigInfo;
}

interface UpdateConfigResponse {
  success: boolean;
  message: string;
  data: {
    config_info: ConfigInfo;
  } | null;
  code?: number;
  timestamp?: number;
}


export default function PersonalInfoPage() {
  const router = useRouter();
  
  // 从Zustand store获取用户信息
  const { currentUser } = useUserStore();
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 用户个人信息状态
  const [userProfile, setUserProfile] = useState({
    avatar: '/images/default.png',
  });
  
  // 配置信息
  const [config, setConfig] = useState({
    fixedName: '',
    atUserId: ''
  });
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  // 提示信息状态
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  // 页面加载时获取配置信息
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingConfig(true);
      try {
        const response = await fetch('/api/quickTask/getConfig');
        const data: GetConfigResponse = await response.json();
        
        if (data.success && data.data) {
          setConfig({
            fixedName: data.data.config_info.name,
            atUserId: data.data.config_info.douyin_id
          });
        }
      } catch (error) {
        console.error('获取配置失败:', error);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 在实际应用中，这里应该上传文件到服务器
      // 这里仅做本地预览
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserProfile(prev => ({
          ...prev,
          avatar: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };



  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 显示提示信息
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // 3秒后自动隐藏提示
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // 处理保存配置
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // 构建请求数据
      const requestData: UpdateConfigRequest = {
        config_info: {
          name: config.fixedName,
          douyin_id: config.atUserId
        }
      };
      
      // 调用API更新配置
      const response = await fetch('/api/quickTask/updateConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const data: UpdateConfigResponse = await response.json();
      
      if (data.success) {
        // 保存成功后退出编辑模式
        setIsEditing(false);
        
        // 显示成功提示
        showNotification('配置保存成功');
      } else {
        // 显示错误提示
        showNotification(`配置保存失败: ${data.message || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('配置保存失败:', error);
      showNotification('配置保存失败，请稍后重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 提示信息 */}
      {notification.show && (
        <div className={`fixed top-50 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md z-50 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
      
      <div className="mt-4 bg-white shadow-sm">  

        {/* 配置信息 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">配置信息</h3>
          
          {isLoadingConfig ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : (
            <>
              {/* 固定名称 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">固定名称</label>
                <input
                  type="text"
                  value={config.fixedName}
                  onChange={(e) => setConfig({ ...config, fixedName: e.target.value })}
                  placeholder="请输入固定名称"
                  disabled={!isEditing}
                  className={`w-full p-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'} rounded-md`}
                />
              </div>
              
              {/* @用户ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">@用户ID</label>
                <input
                  type="text"
                  value={config.atUserId}
                  onChange={(e) => setConfig({ ...config, atUserId: e.target.value })}
                  placeholder="请输入@用户ID"
                  disabled={!isEditing}
                  className={`w-full p-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'} rounded-md`}
                />
              </div>
              
              {/* 操作按钮 */}
              <div className="flex space-x-2 justify-center">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    修改配置
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveConfig}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>


      </div>
   </div> 
)
}