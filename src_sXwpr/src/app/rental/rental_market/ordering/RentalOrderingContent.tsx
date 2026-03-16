'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
// 导入新的类型定义
import { GetOffersRentalInfoDetailResponse, RentalInfoDetail } from '@/app/types/rental/rentOut/getOffersRentalInfoDetailTypes';


export default function RentalOrderingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offer_id = searchParams.get('offer_id') || '';
  
  // 表单状态
  const [formData, setFormData] = useState({
    qq: '',
    purpose: 'promotion',
    customPurpose: '',
    notes: '',
    days: '1'
  });
  
  // 错误状态
  const [errors, setErrors] = useState({
    qq: '',
    customPurpose: '',
    days: '',
    notes: ''
  });
  
  // 错误信息提示
  const [errorMessage, setErrorMessage] = useState('');
  
  // 协议勾选状态
  const [agreementChecked, setAgreementChecked] = useState(false);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 请求结果状态
  const [requestResult, setRequestResult] = useState({
    success: false,
    message: ''
  });
  // 账号信息（从API获取）
  const [accountInfo, setAccountInfo] = useState({
    price_per_day: 0,       // 每日租金（分）
    price_per_day_yuan: 0,  // 每日租金（元）
    title: '',
    created_at: '',       // 创建时间
    updated_at: '',  // 更新时间
    content_json: {
      images: [] as string[],     // 图片列表
      platform_type: '',          // 平台类型：douyin 或 qq
      account_info: '',  // 出租信息详细描速
      post_douyin: '',             // 发布抖音视频和评论
      basic_information: '',      // 基本信息，需要完善个人信息
    }
  });
  // API加载状态
  const [apiLoading, setApiLoading] = useState(true);
  // API错误状态
  const [apiError, setApiError] = useState('');
  
  // 计算总价
  const totalPrice = accountInfo.price_per_day_yuan * (parseInt(formData.days) || 0);
  
  // 组件挂载时获取账号信息
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!offer_id) {
        setApiError('无效的offer_id');
        setApiLoading(false);
        return;
      }
      
      try {
        setApiLoading(true);
        // 调用API获取账号信息
        const response = await fetch(`/api/rental/rentOut/getOffersRentalInfoDetail?offer_id=${offer_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API请求失败: HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.code === 0 && result.data) {
          setAccountInfo(result.data);
          setApiError('');
        } else {
          throw new Error(result.message || '获取账号信息失败');
        }
      } catch (error) {
        console.error('获取账号信息失败:', error);
        setApiError(error instanceof Error ? error.message : '获取账号信息失败');
      } finally {
        setApiLoading(false);
      }
    };
    fetchAccountInfo();
  }, [offer_id]);
  
  // 表单验证
  const validateForm = () => {
    setErrorMessage('');
    
    // 1. 租用天数验证
    if (!formData.days) {
      setErrorMessage('请输入租用天数');
      return false;
    }
    const daysNum = parseInt(formData.days);
    if (isNaN(daysNum)) {
      setErrorMessage('租用天数必须为整数');
      return false;
    }
    if (daysNum < 1 || daysNum > 30) {
      setErrorMessage('租用天数范围必须为1-30天');
      return false;
    }
    
    // 2. 联系方式验证
    if (!formData.qq.trim()) {
      setErrorMessage('请输入QQ号');
      return false;
    }
    if (!/^\d{5,11}$/.test(formData.qq)) {
      setErrorMessage('请输入正确的QQ号（5-11位数字）');
      return false;
    }
    
    // 3. 用途说明验证
    if (formData.purpose === 'other' && !formData.customPurpose) {
      setErrorMessage('请输入自定义用途');
      return false;
    }
    if (formData.purpose === 'other' && formData.customPurpose.length > 30) {
      setErrorMessage('自定义用途最大长度不能超过30个字');
      return false;
    }
    
    // 4. 备注信息验证
    if (formData.notes.length > 50) {
      setErrorMessage('备注信息最大长度不能超过50个字');
      return false;
    }
    
    return true;
  };
  

  
  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (field in errors) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  

  
  // 处理确认租赁
  const handleConfirmRental = async () => {
    setErrorMessage('');
    
    // 1. 验证表单
    if (!validateForm()) {
      return;
    }
    
    // 2. 验证协议是否勾选
    if (!agreementChecked) {
      setErrorMessage('请阅读并同意相关协议');
      return;
    }
    
    setIsLoading(true);
    try {
      // 构建联系方式字符串
      let contactParts = [];
      if (formData.qq) {
        contactParts.push(`QQ:${formData.qq}`);
      }
      const contact = contactParts.join(';');
      
      // 构建用途字符串
      let usage = '';
      if (formData.purpose === 'promotion') {
        usage = '推广营销';
      } else if (formData.purpose === 'content') {
        usage = '内容创作';
      } else if (formData.purpose === 'other') {
        usage = formData.customPurpose || '其他';
      }
      
      // 构建请求数据
      const requestData = {
        offer_id: parseInt(offer_id) || 0,
        days: parseInt(formData.days) || 0,
        buyer_info: {
          usage: usage,
          contact: contact,
          notes: formData.notes
        }
      };
      
      // 调用API
      const response = await fetch('/api/rental/rentOut/createrRentalOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      
      // 处理响应
      if (result.code === 0) {
        setRequestResult({
          success: true,
          message: '租赁订单提交成功！'
        });
      } else {
        setRequestResult({
          success: false,
          message: result.message || '租赁订单提交失败，请重试'
        });
      }
      
      // 2秒后自动跳转
      setTimeout(() => {
        router.push('/rental/rental_market');
      }, 2000);
      
    } catch (error) {
      console.error('提交租赁订单失败:', error);
      setRequestResult({
        success: false,
        message: '网络错误，请稍后重试'
      });
      
      // 2秒后自动跳转
      setTimeout(() => {
        router.push('/rental/rental_market');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要内容 */}
      <div className="max-w-2xl mx-auto p-3">
        {/* 加载状态 */}
        {apiLoading ? (
          <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
            <div className="py-10 flex justify-center items-center">
              <div className="text-gray-500">加载中...</div>
            </div>
          </div>
        ) : apiError ? (
          /* 错误状态 */
          <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
            <div className="py-10 flex justify-center items-center">
              <div className="text-red-500">{apiError}</div>
            </div>
          </div>
        ) : (
          /* 订单物品信息展示区 */
          <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
            <div className="flex items-start space-x-4">
              {/* 账号图片 */}
              <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                {accountInfo.content_json?.images && accountInfo.content_json.images.length > 0 ? (
                  <img 
                    src={accountInfo.content_json.images[0]}
                    alt={accountInfo.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">暂无图片</span>
                  </div>
                )}
              </div>
              
              {/* 账号信息 */}
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h2 className="font-medium text-gray-900">{accountInfo.title || '未设置标题'}</h2>
                  {accountInfo.content_json?.platform_type && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                      {accountInfo.content_json.platform_type === 'douyin' ? '抖音' : 'QQ'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600  line-clamp-2">账号描述: {accountInfo.content_json?.account_info || ''}</p>
                <p className="text-xs text-gray-500">发布时间: {accountInfo.created_at || '未设置'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 租赁时长选择模块 */}
        <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
          <h3 className="font-medium text-gray-900 mb-2">租用天数</h3>
          <div>
            <input 
              type="number" 
              value={formData.days}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, days: value }));
              }}
              className="w-full py-2 px-3 border border-gray-300 rounded-md"
              min="1"
              max="30"
              placeholder="请输入租赁天数"
            />
            {errors.days && (
              <p className="mt-1 text-sm text-red-600">{errors.days}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">租赁天数：1-30天</p>
          </div>
        </div>
        
        {/* 联系方式输入模块 */}
        <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
          <h3 className="font-medium text-gray-900 mb-2">联系方式<span className='text-red-600'>*</span></h3>
          {/* QQ号 */}
          <div className="mb-2">
            <input 
              type="text" 
              value={formData.qq}
              onChange={(e) => handleInputChange('qq', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${errors.qq ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="请输入QQ号"
            />
            {errors.qq && (
              <p className="mt-1 text-sm text-red-600">{errors.qq}</p>
            )}
          </div>
        </div>
        
        {/* 用途说明模块 */}
        <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
          <h3 className="font-medium text-gray-900 mb-2">用途说明</h3>
          
          {/* 用途筛选项 */}
          <div className="mb-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'promotion', label: '推广营销' },
                { value: 'content', label: '抖音发布' },
                { value: 'other', label: '其他' }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`py-2 px-3 border rounded-md text-sm ${formData.purpose === option.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handleInputChange('purpose', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 自定义用途输入框 */}
          {formData.purpose === 'other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自定义用途 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.customPurpose}
                onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.customPurpose ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="请输入具体用途"
              />
              {errors.customPurpose && (
                <p className="mt-1 text-sm text-red-600">{errors.customPurpose}</p>
              )}
            </div>
          )}
        </div>
        
        {/* 备注信息模块 */}
        <div className="bg-white rounded-lg shadow-sm py-1 px-4 mb-1">
          <h3 className="font-medium text-gray-900 mb-1">备注信息</h3>
          <textarea 
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[60px] ${errors.notes ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="请输入备注信息（最多50字）"
            maxLength={50}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
        </div>
        
        {/* 价格信息展示模块 */}
        <div className="bg-white rounded-lg text-sm shadow-sm py-2 px-4 mb-1">
          <h3 className="font-medium text-gray-900 mb-2">价格信息</h3>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">账号单价</span>
              <span className="font-medium"><span className="text-red-600">¥{accountInfo.price_per_day_yuan}</span>/天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">租赁天数</span>
              <span className="font-medium">{formData.days} 天</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-medium text-gray-900">合计</span>
              <span className="font-bold text-red-600 text-lg">¥{totalPrice}</span>
            </div>
          </div>
        </div>
        
        {/* 协议勾选 */}
        <div className="mb-1">
          <div className="flex items-start space-x-2">
            <input 
              type="checkbox" 
              id="agreement" 
              className="mt-1"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
            />
            <label htmlFor="agreement" className="text-sm text-gray-600">
              确认购买即阅读并同意《交易猫平台虚拟物品交易规则》《交易猫用户服务协议》
            </label>
          </div>
        </div>
        
        {/* 错误信息 */}
        {errorMessage && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部操作栏 */}
      {/* 请求结果提示 */}
        {requestResult.message && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${requestResult.success ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg`}>
            {requestResult.message}
          </div>
        )}
        
        {/* 底部操作栏 */}
        <div className="sticky bottom-5 bg-white shadow-md z-10">
          <div className="max-w-2xl mx-auto px-4 py-2">   
            <button
              className={`w-full py-3 rounded-lg font-medium ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              onClick={handleConfirmRental}
              disabled={isLoading}
            >
              {isLoading ? '提交中...' : '确认租用'}
            </button>
          </div>
        </div>
    </div>
  );
}