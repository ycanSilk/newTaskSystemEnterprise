"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义用户信息接口
interface UserProfile {
  id?: string;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  contactPerson: string;
  userType: string;
  [key: string]: any;
}

export default function PersonalInfoPage() {
  const router = useRouter();
  
  // 用户个人信息状态
  const [userProfile, setUserProfile] = useState<UserProfile>({
    avatar: '/images/0e92a4599d02a7.jpg',
    name: '', 
    phone: '',
    email: '',
    companyName: '',
    contactPerson: '',
    userType: ''
  });
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  
  // API响应接口
  interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
  }
  
  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/users/getuserinfo', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
            // Cookie中的token会自动传递
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json() as ApiResponse;
        if (result.code === 200 && result.data && result.data.userInfo) {
          // 从userInfo对象中提取数据
          const apiUserData = result.data.userInfo;
          
          // 映射数据到UserProfile格式
          const mappedUserProfile: UserProfile = {
            id: apiUserData.id,
            avatar: apiUserData.avatar || '/images/0e92a4599d02a7.jpg',
            name: apiUserData.username || '用户',
            phone: apiUserData.phone || '',
            email: apiUserData.email || '',
            companyName: apiUserData.companyName || '',
            contactPerson: apiUserData.contactPerson || '',
            userType: apiUserData.userType || '未设置'
          };
          
          setUserProfile(mappedUserProfile);
        } else {
          setError(result.message || '获取用户信息失败');
          console.warn('API响应数据不符合预期:', result);
          // 设置默认数据以便展示
          setUserProfile(prev => ({
            ...prev,
            name: '用户',
            accountType: '未设置'
          }));
        }
      } catch (err) {
        console.error('获取用户信息错误:', err);
        setError('网络请求失败，请稍后重试');
        // 设置默认数据以便展示
        setUserProfile(prev => ({
          ...prev,
          name: '用户',
          accountType: '未设置'
        }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);

  // 编辑状态
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentField, setCurrentField] = useState<{
    key: keyof UserProfile;
    label: string;
    placeholder?: string;
  } | null>(null);

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

  // 打开编辑模态框
  const openEditModal = (field: keyof UserProfile, label: string, placeholder?: string) => {
    setCurrentField({ key: field, label, placeholder });
    setTempValue(userProfile[field]);
    setShowEditModal(true);
  };

  // 保存编辑
  const saveEdit = () => {
    if (currentField) {
      setUserProfile(prev => ({
        ...prev,
        [currentField.key]: tempValue
      }));
      setShowEditModal(false);
      setCurrentField(null);
      setTempValue('');
    }
  };

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 信息项组件
  const InfoItem = ({ 
    label, 
    value, 
    field,
    placeholder 
  }: { 
    label: string; 
    value: string; 
    field: keyof UserProfile;
    placeholder?: string;
  }) => (
    <div 
      className="p-4 border-b border-gray-100 flex justify-between items-center"
      onClick={() => openEditModal(field, label, placeholder)}
    >
      <span className="">{label}</span>
      <div className="flex items-center ">
        <span className="mr-2 whitespace-nowrap">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mt-2 mx-4 rounded">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 加载状态 */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
      <div className="mt-4 bg-white shadow-sm">
        {/* 头像 - 整行可点击 */}
        <div 
          className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.click();
            }
          }}
        >
          <span className="">头像</span>
          <div className="flex items-center">
            <div className="relative mr-2">
              <img 
                src={userProfile.avatar} 
                alt="头像" 
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">更换</span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 名字 */}
        <InfoItem label="名字" value={userProfile.name} field="name" placeholder="请输入名字" />

        {/* 手机号 */}
        <InfoItem label="手机号" value={userProfile.phone} field="phone" placeholder="请输入手机号" />

        {/* 邮箱 */}
        <InfoItem label="邮箱" value={userProfile.email || '未填写'} field="email" placeholder="请输入邮箱" />

        {/* 企业名称 */}
        <InfoItem label="企业名称" value={userProfile.companyName || '未填写'} field="companyName" placeholder="请输入企业名称" />

        {/* 负责人 */}
        <InfoItem label="负责人" value={userProfile.contactPerson || '未填写'} field="contactPerson" placeholder="请输入负责人姓名" />

        {/* 账号类型 */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <span className="">账号类型</span>
          <div className="">
            {userProfile.userType || '未设置'}
          </div>
        </div>
        
        {/* 用户ID */}
        {userProfile.id && (
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="w-1/4">用户ID</div>
            <div className="w-3/4 text-right">
              {userProfile.id || 'NULL'}
            </div>
          </div>
        )}

        <div onClick={() => router.push('/publisher/profile/changepwd')} className="p-4 border-b border-gray-100  justify-between text-center items-center cursor-pointer bg-blue-200 hover:bg-blue-200">
            修改密码
        </div>

        {/* 编辑模态框 */}
        {showEditModal && currentField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">编辑{currentField.label}</h3>
              </div>
              <div className="p-5">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  placeholder={currentField.placeholder || `请输入${currentField.label}`}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-3 text-blue-600 font-medium hover:bg-gray-50 border-l border-gray-200"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
   </div> 
)
}