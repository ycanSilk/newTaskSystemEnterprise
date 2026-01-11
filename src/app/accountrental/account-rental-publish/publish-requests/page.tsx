'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 定义请求体接口
export interface PublishRequestPayload {
  platform: string;
  accountType: string;
  expectedPricePerDay: number;
  budgetDeposit: number;
  expectedLeaseDays: number;
  description: string;
}

// 定义响应数据接口
export interface PublishRequestResponse {
  success: boolean;
  message: string;
  data?: any;
}

const PublishForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    price: '',
    description: '',
    duration: '1',
    phoneNumber: '',
    email: '',
    qq: '',
    platform: 'DOUYIN',
    accountType: '个人账号', // 新增账号类型字段，默认值为个人账号
    accountRequirements: {
      canChangeName: false,
      canPostComments: false,
      canPostVideos: false,
      canIntroduction: false
    },
    loginMethods: {
      qrCode: false,
      phoneSms: false,
      noLogin: false
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleCheckboxChange = (type: 'accountRequirements' | 'loginMethods', field: string) => {
    setFormData(prev => {
      const updatedType = { ...prev[type] };
      (updatedType as Record<string, boolean>)[field] = !(updatedType as Record<string, boolean>)[field];
      return {
        ...prev,
        [type]: updatedType
      };
    });
  };
  
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateQQ = (qq: string) => {
    const qqRegex = /^[1-9]\d{4,10}$/;
    return qqRegex.test(qq);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 手机号变为非必填，但如果填写了则需要验证格式
    if (formData.phoneNumber.trim() && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = '请输入有效的手机号';
    }
    
    // 邮箱验证（如果填写）
    if (formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // QQ验证（如果填写）
    if (formData.qq.trim() && !validateQQ(formData.qq)) {
      newErrors.qq = '请输入有效的QQ号码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 拼接账号要求和登录方式到description
    let requirementsText = '';
    let loginMethodsText = '';
    
    // 处理账号要求
    const accountRequirements = formData.accountRequirements;
    const accountRequirementItems = [
      accountRequirements.canChangeName ? '修改抖音账号名称和头像' : '',
      accountRequirements.canIntroduction ? '修改账号简介' : '',
      accountRequirements.canPostComments ? '支持发布评论' : '',
      accountRequirements.canPostVideos ? '支持发布视频' : ''
    ].filter(item => item !== '');
    
    if (accountRequirementItems.length > 0) {
      requirementsText = `账号要求：\n${accountRequirementItems.join('\n')}\n`;
    }
    
    // 处理登录方式
    const loginMethods = formData.loginMethods;
    const loginMethodItems = [
      loginMethods.qrCode ? '扫码登录' : '',
      loginMethods.phoneSms ? '手机号+短信验证登录' : '',
      loginMethods.noLogin ? '不登录账号，按照承租方要求完成租赁' : ''
    ].filter(item => item !== '');
    
    if (loginMethodItems.length > 0) {
    loginMethodsText = `登录方式：\n${loginMethodItems.join('\n')}`;
  }
  
  // 处理联系方式：拼接QQ号、手机号、邮箱到description
  let contactInfoText = '';
  const contactItems = [];
  // 按要求顺序：QQ号 → 手机号 → 邮箱
  if (formData.qq) contactItems.push(`QQ号: ${formData.qq}`);
  if (formData.phoneNumber) contactItems.push(`手机号: ${formData.phoneNumber}`);
  if (formData.email) contactItems.push(`邮箱: ${formData.email}`);
  
  if (contactItems.length > 0) {
    contactInfoText = `联系方式：\n${contactItems.join('\n')}\n`;
  }
  
  // 合并拼接后的内容到description，严格遵循顺序：求助信息描述 → 联系方式 → 账号要求 → 登录方式
  const finalDescription = `${formData.description ? `${formData.description}\n` : ''}${contactInfoText}${requirementsText}${loginMethodsText}`.trim();
    
    // 构造请求数据
    const publishData: PublishRequestPayload = {
      platform: formData.platform,
      accountType: formData.accountType,
      expectedPricePerDay: parseFloat(formData.price) || 0,
      expectedLeaseDays: parseInt(formData.duration) || 1,
      // 自动计算预算存款
      budgetDeposit: (parseFloat(formData.price) || 0) * (parseInt(formData.duration) || 1),
      description: finalDescription
    };
    
    // 发送API请求
    try {
      const response = await fetch('/api/rental/publishrequestrental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });
      
      const responseData: PublishRequestResponse = await response.json();
      
      if (responseData.success) {
        // 提交成功后显示成功模态框
        setShowSuccessModal(true);
      } else {
        // 处理错误响应
        alert(responseData.message || '发布失败，请稍后重试');
      }
    } catch (error) {
      console.error('API请求失败:', error);
      alert('发布失败，请稍后重试');
    }
  };
  
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/accountrental/account-rental-requests');
  };
  
  const handleCancel = () => {
    router.push('/accountrental/account-rental-publish');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-3xl mx-auto px-1">
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">填写发布信息</h1>
        
        <div className="px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 p-2">
              <div className="text-blue-700 text-sm mb-1">填写抖音账号租赁的详细信息，保信息真实有效，账号无异常,及时响应</div>
              <div className="text-red-700 text-sm mb-1">风险提醒:涉及抖音平台规则，账号可能被平台封控，需要协助进行账号解封。</div>
        </div>
      </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3">
          {/* 描述输入 */}
          <div className="mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              求租信息描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="填写抖音账号求租的详细信息，保信息真实有效，账号无异常,及时响应"
              rows={4}
              maxLength={150}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/150 字</p>
          </div>

           {/* 价格输入 */}
          <div className="mb-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              价格 (元/天) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入价格"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* 租赁时长 */}
          <div className="mb-1">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              租赁时长 (天)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入租赁时长"
              min="1"
            />
          </div>

          {/* 手机号 */}
          <div className="mb-1">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              联系电话（选填）
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="请输入手机号"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>
          
          {/* 邮箱 */}
          <div className="mb-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱（选填）
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="请输入邮箱地址"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* QQ */}
          <div className="mb-1">
            <label htmlFor="qq" className="block text-sm font-medium text-gray-700 mb-1">
              QQ号码（选填）
            </label>
            <input
              type="text"
              id="qq"
              name="qq"
              value={formData.qq}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border ${errors.qq ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
              placeholder="请输入QQ号码"
            />
            {errors.qq && (
              <p className="text-red-500 text-xs mt-1">{errors.qq}</p>
            )}
            <p className="text-blue-600 text-xs mt-1">如有需要添加客服QQ ： 88888888联系沟通</p>
          </div>
          
          {/* 平台选择 */}
          <div className="mb-1">
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
              平台选择 <span className="text-red-500">*</span>
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            >
              <option value="douyin">抖音平台</option>
            </select>
          </div>

          {/* 账号类型选择 */}
          <div className="mb-1">
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              账号类型 <span className="text-red-500">*</span>
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            >
              <option value="个人账号">个人账号</option>
            </select>
          </div>
          
          {/* 账号要求 */}
          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              账号要求
            </label>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.accountRequirements.canChangeName}
                  onChange={() => handleCheckboxChange('accountRequirements', 'canChangeName')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">修改抖音账号名称和头像</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.accountRequirements.canIntroduction}
                  onChange={() => handleCheckboxChange('accountRequirements', 'canIntroduction')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">修改账号简介</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.accountRequirements.canPostComments}
                  onChange={() => handleCheckboxChange('accountRequirements', 'canPostComments')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">支持发布评论</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.accountRequirements.canPostVideos}
                  onChange={() => handleCheckboxChange('accountRequirements', 'canPostVideos')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">支持发布视频</span>
              </label>
            </div>
          </div>
          
          {/* 登录方式 */}
          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              登录方式
            </label>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.loginMethods.qrCode}
                  onChange={() => handleCheckboxChange('loginMethods', 'qrCode')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">扫码登录</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.loginMethods.phoneSms}
                  onChange={() => handleCheckboxChange('loginMethods', 'phoneSms')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">手机号+短信验证登录</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.loginMethods.noLogin}
                  onChange={() => handleCheckboxChange('loginMethods', 'noLogin')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">不登录账号，按照承租方要求完成租赁</span>
              </label>
            </div>
          </div>

          {/* 表单操作按钮 */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mb-1">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              onClick={handleCancel}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              发布求租
            </button>
          </div>
        </form>
      </div>
      
      {/* 成功提示模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">发布成功！</h3>
              <p className="text-gray-600 mb-6">您的求租信息已成功发布</p>
              <button
                onClick={handleSuccessConfirm}
                className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishForm;