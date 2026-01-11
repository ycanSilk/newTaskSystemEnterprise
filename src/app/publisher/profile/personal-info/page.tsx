"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../../components/ui/AlertModal';

export default function PersonalInfoPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '商家小王',
    company: '美食工作室',
    phone: '138****8888',
    email: 'publisher@example.com',
    address: '北京市朝阳区某某街道',
    businessType: '餐饮',
    description: '专注美食推广，为用户提供优质的探店体验任务。'
  });
  
  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string) => {
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 加载用户信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserInfo = localStorage.getItem('publisher_profile');
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          // 合并已有的formData和存储的用户信息
          setFormData(prev => ({ ...prev, ...userInfo }));
        } catch (error) {
          console.error('解析存储的用户信息失败:', error);
        }
      }
    }
  }, []);

  const handleSave = () => {
    // 保存用户信息到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('publisher_profile', JSON.stringify(formData));
    }
    setIsEditing(false);
    showAlert('保存成功', '个人信息已成功保存', '✅');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 如果有存储的用户信息，恢复它
    if (typeof window !== 'undefined') {
      const storedUserInfo = localStorage.getItem('publisher_profile');
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          setFormData(prev => ({ ...prev, ...userInfo }));
        } catch (error) {
          console.error('恢复用户信息失败:', error);
        }
      }
    }
  };

  const handleBack = () => {
    router.back();
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
          <h1 className="text-lg font-medium text-gray-800">个人信息</h1>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="px-5 py-6">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          {/* 头像 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-3">
              🏪
            </div>
            {isEditing && (
              <button 
                className="text-sm text-green-500"
              >
                更换头像
              </button>
            )}
          </div>

          {/* 详细信息表单 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司名称</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={true} // 手机号通常不允许直接修改
                className="w-full px-4 py-2.5 border-transparent bg-gray-50 text-gray-800 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">业务类型</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">简介</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors
                  ${isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50 text-gray-800'}
                `}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-5 py-4">
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              保存修改
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            编辑信息
          </button>
        )}
      </div>

      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}