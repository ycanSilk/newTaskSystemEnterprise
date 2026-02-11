'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button, Space, Divider, Modal, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import ImageUpload from '@/components/imagesUpload/ImageUpload';

// 导入新的类型定义
import { GetOffersRentalInfoDetailResponse, RentalInfoDetail } from '@/app/types/rental/rentOut/getOffersRentalInfoDetailTypes';

// 抖音账号租赁表单类型
interface DouyinAccountRentalForm {
  // 基础信息
  title: string; // 新增：出租信息标题
  description: string; // 账号信息
  accountImages: string[];
  price: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  allow_renew: number; // 新增：是否允许续租
  accountRequirements: {
    basic_information: boolean;
    post_douyin: boolean;
    deblocking: boolean;
    identity_verification: boolean;
  };
  loginMethods: {
    scan_code: boolean;
    phone_message: boolean;
    other_require: boolean;
  };
  phone: string;
  qq?: string;
  email?: string;
}

const RentalRequestDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id as string || '';
  const editParam = searchParams.get('edit') || '0';
  const isEditMode = editParam === '1';
  
  // 表单状态
  const [formData, setFormData] = useState<DouyinAccountRentalForm>({
    title: '',
    description: '',
    accountImages: [],
    price: 50,
    minLeaseDays: 1,
    maxLeaseDays: 30,
    allow_renew: 1,
    accountRequirements: {
      basic_information: false,
      post_douyin: false,
      deblocking: false,
      identity_verification: false,
    },
    loginMethods: {
      scan_code: true,
      phone_message: false,
      other_require: false,
    },
    phone: '',
    qq: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: null as React.ReactNode | null
  });

  // 从API获取出租详情
  const fetchLeaseInfoDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('前端要传递的订单id:', id);
      console.log('id类型:', typeof id);
      console.log('id是否为空:', id === '');
      // 调用后端API
      const apiUrl = `/api/rental/rentOut/getOffersRentalInfoDetail?offer_id=${id}`;
      console.log('前端请求的完整URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GetOffersRentalInfoDetailResponse = await response.json();
      console.log('后端返回的原始数据:', data);

      if (data.code === 0 && data.data) {
        // 转换API数据为前端需要的格式
        const apiData = data.data;
        const contentJson = apiData.content_json || {};
        
        // 回填表单数据
        setFormData({
          title: apiData.title || '',
          description: contentJson.account_info || '',
          accountImages: contentJson.images || [],
          price: typeof apiData.price_per_day_yuan === 'string' ? parseFloat(apiData.price_per_day_yuan) || 50 : apiData.price_per_day_yuan || 50,
          minLeaseDays: apiData.min_days || 1,
          maxLeaseDays: apiData.max_days || 30,
          allow_renew: apiData.allow_renew || 1,
          accountRequirements: {
            basic_information: contentJson.basic_information === 'true',
            post_douyin: contentJson.post_douyin === 'true',
            deblocking: contentJson.deblocking === 'true',
            identity_verification: contentJson.identity_verification === 'true',
          },
          loginMethods: {
            scan_code: contentJson.scan_code === 'true',
            phone_message: contentJson.phone_message === 'true',
            other_require: contentJson.requested_all === 'true',
          },
          phone: contentJson.phone_number || '',
          qq: contentJson.qq_number || '',
          email: contentJson.email || '',
        });
      } else {
        const errorMessage = data.message || '获取出租信息失败';
        message.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('获取出租信息异常:', error);
      const errorMessage = '获取出租信息异常，请稍后重试';
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaseInfoDetail();
  }, [id]);

  // 处理返回列表
  const handleBackToList = () => {
    router.push('/rental/my/myrelearentalinfo');
  };

  // 处理图片变化
  const handleImagesChange = (files: File[], urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      accountImages: urls
    }));
    
    // 清除图片上传错误
    if (errors.accountImages) {
      setErrors(prev => ({
        ...prev,
        accountImages: ''
      }));
    }
  };

  // 显示通用提示框
  const showAlert = (title: string, message: string, isSuccess: boolean) => {
    setAlertConfig({ 
      title, 
      message, 
      icon: isSuccess ? <span className="text-green-500 text-2xl">✓</span> : <span className="text-red-500 text-2xl">×</span> 
    });
    setShowAlertModal(true);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 基础信息验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入出租信息标题';
    } else if (formData.title.length < 5 || formData.title.length > 100) {
      newErrors.title = '出租信息标题长度需在5-100个字符之间';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入账号信息';
    } else if (formData.description.length < 5 || formData.description.length > 300) {
      newErrors.description = '账号信息长度需在5-300个字符之间';
    }
    
    if (formData.accountImages.length === 0) {
      newErrors.accountImages = '请至少上传一张账号截图';
    }
    
    // 商品信息验证
    if (formData.price <= 0) {
      newErrors.price = '价格必须大于0';
    }
    
    if (formData.minLeaseDays <= 0) {
      newErrors.minLeaseDays = '最低出租天数必须大于0';
    }
    
    if (formData.maxLeaseDays <= formData.minLeaseDays) {
      newErrors.maxLeaseDays = '最高出租天数必须大于最低出租天数';
    }
    
    // 登录方式验证
    const hasLoginMethod = formData.loginMethods.scan_code || formData.loginMethods.phone_message || formData.loginMethods.other_require;
    if (!hasLoginMethod) {
      newErrors.loginMethods = '请至少选择一种登录方式';
    }
    
    // 联系方式验证
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = '请输入有效的手机号';
    }
    
    // QQ号验证（如果填写）
    if (formData.qq && !/^[1-9]\d{4,10}$/.test(formData.qq.trim())) {
      newErrors.qq = '请输入有效的QQ号';
    }
    
    // 邮箱验证（如果填写）
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number | boolean | File | null) => {
    // 允许用户在输入过程中删除内容至空值
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // 处理标签点击变更
  const handleTagClick = (group: 'accountRequirements' | 'loginMethods', field: string) => {
    setFormData(prev => {
      if (group === 'accountRequirements') {
        return {
          ...prev,
          accountRequirements: {
            ...prev.accountRequirements,
            [field]: !prev.accountRequirements[field as keyof typeof prev.accountRequirements]
          }
        };
      } else {
        return {
          ...prev,
          loginMethods: {
            ...prev.loginMethods,
            [field]: !prev.loginMethods[field as keyof typeof prev.loginMethods]
          }
        };
      }
    });
  };

  // 处理输入框失焦事件 - 当用户离开输入框后，自动填充默认值
  const handleBlur = (field: string, defaultValue: number) => {
    setFormData(prev => {
      const currentValue = prev[field as keyof DouyinAccountRentalForm];
      // 如果值为空或小于等于0，则使用默认值
      if (currentValue === '' || currentValue === null || currentValue === undefined || (typeof currentValue === 'number' && currentValue <= 0)) {
        return {
          ...prev,
          [field]: defaultValue
        };
      }
      return prev;
    });
  };

  // 表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 构建后端API所需的请求参数
      const requestData = {
        offer_id: parseInt(id) || 0,
        title: formData.title,
        price_per_day: (formData.price || 50) * 100,
        min_days: formData.minLeaseDays || 1,
        max_days: formData.maxLeaseDays || 30,
        allow_renew: formData.allow_renew ? 1 : 0,
        content_json: {
          account_info: formData.description,
          basic_information: formData.accountRequirements.basic_information ? 'true' : 'false',
          post_douyin: formData.accountRequirements.post_douyin ? 'true' : 'false',
          deblocking: formData.accountRequirements.deblocking ? 'true' : 'false',
          identity_verification: formData.accountRequirements.identity_verification ? 'true' : 'false',
          scan_code: formData.loginMethods.scan_code ? 'true' : 'false',
          phone_message: formData.loginMethods.phone_message ? 'true' : 'false',
          other_require: formData.loginMethods.other_require ? 'true' : 'false',
          images: formData.accountImages, // 直接使用上传后的图片URL列表
          phone_number: formData.phone,
          qq_number: formData.qq || '',
          email: formData.email || ''
        }
      };
      
      console.log('提交的API请求数据:', requestData);
      
      // 调用后端API提交数据
      const response = await fetch('/api/rental/rentOut/updateOffersRentalnfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 0) {
        showAlert('更新成功', result.message || '出租信息已成功更新', true);
        // 更新成功后跳转到列表页面
        setTimeout(() => {
          router.push('/rental/my/myrelearentalinfo');
        }, 2000);
      } else {
        showAlert('更新失败', result.message || '更新失败，请稍后重试', false);
      }
    } catch (err) {
      console.error('更新错误:', err);
      showAlert('更新失败', err instanceof Error ? err.message : '更新失败，请稍后重试', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 显示加载状态
  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }
  
  // 显示错误状态
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 p-2">
              <div className="text-blue-700 text-sm mb-1">填写抖音账号租赁的详细信息，保信息真实有效，账号无异常,及时响应</div>
              <div className="text-red-700 text-sm mb-1">风险提醒:涉及抖音平台规则，账号可能被平台封控，需要协助进行账号解封。</div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="px-4 py-2">
        {/* 表单内容 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-5 px-3">
          {/* 基础信息 */}
          <div className="space-y-1 mb-2">  
            <div className="space-y-1">
              {/* 出租信息标题 */}
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  出租信息标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入出租信息标题，如：抖音高等级账号出租"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                  disabled={!isEditMode}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>
              
              {/* 账号信息 */}
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  账号信息 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="填写抖音账号出租的详细信息，保信息真实有效，账号无异常,及时响应"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.description ? 'border-red-500' : ''}`}
                  style={{ height: 150, width: '100%' }}
                  disabled={!isEditMode}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              {/* 账号截图 - 使用ImageUpload组件 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  上传账号截图 <span className="text-red-500">*</span>
                </label>
                {isEditMode ? (
                  <ImageUpload
                    maxCount={6}
                    onImagesChange={handleImagesChange}
                    title=""
                    columns={3}
                    gridWidth="100%"
                    itemSize="100x100"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {formData.accountImages.map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={image} 
                          alt={`账号数据 ${index + 1}`} 
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {errors.accountImages && (
                  <p className="text-red-500 text-sm">{errors.accountImages}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 商品信息 */}
          <div className="space-y-6 mb-10">
            <div className="space-y-1">
              {/* 价格 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  价格 (元/天) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    onBlur={() => handleBlur('price', 50)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : ''}`}
                    step="5"
                    disabled={!isEditMode}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price}</p>
                )}
              </div>
              
              {/* 最低出租天数 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最低出租天数 (天) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minLeaseDays || ''}
                  onChange={(e) => handleInputChange('minLeaseDays', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                  onBlur={() => handleBlur('minLeaseDays', 1)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.minLeaseDays ? 'border-red-500' : ''}`}
                  step="1"
                  disabled={!isEditMode}
                />
                {errors.minLeaseDays && (
                  <p className="text-red-500 text-sm">{errors.minLeaseDays}</p>
                )}
              </div>

              {/* 最高出租天数 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最高出租天数 (天) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxLeaseDays || ''}
                  onChange={(e) => handleInputChange('maxLeaseDays', e.target.value === '' ? '' : parseInt(e.target.value) || 30)}
                  onBlur={() => handleBlur('maxLeaseDays', 30)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.maxLeaseDays ? 'border-red-500' : ''}`}
                  step="1"
                  disabled={!isEditMode}
                />
                {errors.maxLeaseDays && (
                  <p className="text-red-500 text-sm">{errors.maxLeaseDays}</p>
                )}
              </div>
              
              {/* 是否允许续租 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  是否允许续租 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowRenew"
                      value={1}
                      checked={formData.allow_renew === 1}
                      onChange={() => handleInputChange('allow_renew', 1)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!isEditMode}
                    />
                    <span className="ml-2 text-sm">是</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="allowRenew"
                      value={0}
                      checked={formData.allow_renew === 0}
                      onChange={() => handleInputChange('allow_renew', 0)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={!isEditMode}
                    />
                    <span className="ml-2 text-sm">否</span>
                  </label>
                </div>
              </div>
              

            </div>
            
            {/* 账号要求 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                账号支持 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.basic_information ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('accountRequirements', 'basic_information')}
                  disabled={!isEditMode}
                >
                  修改基本信息
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.post_douyin ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('accountRequirements', 'post_douyin')}
                  disabled={!isEditMode}
                >
                  发布视频和评论
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.deblocking ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('accountRequirements', 'deblocking')}
                  disabled={!isEditMode}
                >
                  账号解禁
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.identity_verification ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('accountRequirements', 'identity_verification')}
                  disabled={!isEditMode}
                >
                  实名认证
                </button>
              </div>
              <div className='text-sm text-gray-600'>支持勾选选项越多，出租概率越大。</div>
            </div>
            
            {/* 登录方式 */}
            <div className="space-y-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                登录方式（可多选） <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.scan_code ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('loginMethods', 'scan_code')}
                  disabled={!isEditMode}
                >
                  扫码登录
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.phone_message ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('loginMethods', 'phone_message')}
                  disabled={!isEditMode}
                >
                  短信验证
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.other_require ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => isEditMode && handleTagClick('loginMethods', 'other_require')}
                  disabled={!isEditMode}
                >
                  按租赁方要求
                </button>
              </div>
              <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高账号出租概率。</div>
            </div>
            
            {/* 联系方式 */}
            <div className="space-y-1 mt-3">
              {/* 手机号 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="请输入手机号"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                  disabled={!isEditMode}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
              
              {/* QQ号 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QQ号（选填）
                </label>
                <input
                  type="text"
                  value={formData.qq}
                  onChange={(e) => handleInputChange('qq', e.target.value)}
                  placeholder="请输入QQ号"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.qq ? 'border-red-500' : ''}`}
                  disabled={!isEditMode}
                />
                {errors.qq && (
                  <p className="text-red-500 text-sm">{errors.qq}</p>
                )}
              </div>
              
              {/* 邮箱 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱（选填）
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="请输入邮箱地址"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={!isEditMode}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="mt-3 flex justify-center space-x-3">
            <Button
              onClick={handleBackToList}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2"
            >
              取消
            </Button>
            {!isEditMode && (
              <Button
                onClick={() => router.push(`/rental/my/myrelearentalinfo/detail/${id}?edit=1`)}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2"
              >
                编辑出租
              </Button>
            )}
            {isEditMode && (
              <Button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    更新中...
                  </>
                ) : (
                  `更新出租信息`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 通用提示模态框 */}
      <Modal
        title={alertConfig.title}
        open={showAlertModal}
        onCancel={() => setShowAlertModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowAlertModal(false)}>
            确定
          </Button>
        ]}
      >
        <div className="flex items-center justify-center mb-4">
          {alertConfig.icon}
        </div>
        <p className="text-center">{alertConfig.message}</p>
      </Modal>
    </div>
  );
};

export default RentalRequestDetailPage;