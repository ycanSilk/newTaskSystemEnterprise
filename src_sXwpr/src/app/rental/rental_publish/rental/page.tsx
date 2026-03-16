'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Textarea, NumberInput, Label, AlertModal } from '@/components/ui';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { CreateOffersRentalInfoRequest, CreateOffersRentalInfoApiResponse } from '@/app/types/rental/rentOut/createOffersRentalnfoTypes';
import ImageUpload from '@/components/imagesUpload/ImageUpload';

// 定义抖音账号租赁表单类型
interface AccountRentalForm {
  // 基础信息
  title: string; // 新增：出租信息标题
  description: string; // 账号信息
  platformType: string; // 账号平台类型：qq或douyin
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
    post_ad: boolean; // 发布广告
  };
  loginMethods: {
    scan_code: boolean;
    phone_message: boolean;
    account_password: boolean; // 账号密码登录
    other_require: boolean;
  };
  phone: string;
  smsCode: string; // 新增：短信验证码
}


export default function DouyinAccountRentalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AccountRentalForm>({
    title: '', // 新增：出租信息标题
    description: '账号真实有效，无异常，及时回应租客消息', // 账号信息
    platformType: 'douyin', // 账号平台类型，默认抖音
    accountImages: [],
    price: 50,
    minLeaseDays: 1, 
    maxLeaseDays: 30,
    allow_renew: 1, // 新增：是否允许续租，默认true=是
    accountRequirements: {
      basic_information: false,
      post_douyin: false,
      deblocking: false,
      identity_verification: false,
      post_ad: false, // 发布广告
    },
    loginMethods: {
      scan_code: true,
      phone_message: false,
      account_password: false, // 账号密码登录
      other_require: false,
    },
    phone: '',
    smsCode: '' // 新增：短信验证码
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // 短信验证码相关状态
  const [smsCooldown, setSmsCooldown] = useState<boolean>(false);
  const [cooldownTimer, setCooldownTimer] = useState<number>(60);
  
  // API调用逻辑已移至按钮点击事件中
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: null as React.ReactNode | null
  });
  
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
      icon: isSuccess ? <CheckCircleOutlined className="text-green-500 text-2xl" /> : <CloseCircleOutlined className="text-red-500 text-2xl" /> 
    });
    setShowAlertModal(true);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 基础信息验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入出租信息标题';
    } else if (formData.title.length < 4 || formData.title.length > 20) {
      newErrors.title = '出租信息标题长度需在4-20个字符之间';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入账号信息';
    } else if (formData.description.length < 4 || formData.description.length > 50) {
      newErrors.description = '账号信息长度需在4-50个字符之间';
    }
    
    if (formData.accountImages.length === 0) {
      newErrors.accountImages = '请至少上传一张账号截图';
    }
    
    // 商品信息验证
    if (!formData.price) {
      newErrors.price = '请输入价格';
    } else if (!Number.isInteger(formData.price)) {
      newErrors.price = '价格必须为整数';
    } else if (formData.price < 20 || formData.price > 200) {
      newErrors.price = '价格取值范围为20-200元/天';
    }
    
    if (!formData.minLeaseDays) {
      newErrors.minLeaseDays = '请输入最低出租天数';
    } else if (!Number.isInteger(formData.minLeaseDays)) {
      newErrors.minLeaseDays = '最低出租天数必须为整数';
    } else if (formData.minLeaseDays < 1 || formData.minLeaseDays > 30) {
      newErrors.minLeaseDays = '最低出租天数取值范围为1-30天';
    }
    
    if (!formData.maxLeaseDays) {
      newErrors.maxLeaseDays = '请输入最高出租天数';
    } else if (!Number.isInteger(formData.maxLeaseDays)) {
      newErrors.maxLeaseDays = '最高出租天数必须为整数';
    } else if (formData.maxLeaseDays < formData.minLeaseDays) {
      newErrors.maxLeaseDays = '最高出租天数必须大于等于最低出租天数';
    } else if (formData.maxLeaseDays > 30) {
      newErrors.maxLeaseDays = '最高出租天数不能超过30天';
    }
    
    // 账号平台类型验证
    if (!formData.platformType) {
      newErrors.platformType = '请选择账号平台类型';
    }
    
    // 是否允许续租验证
    if (formData.allow_renew !== 0 && formData.allow_renew !== 1) {
      newErrors.allow_renew = '请选择是否允许续租';
    }
    
    // 账号支持验证
    const hasAccountRequirement = formData.accountRequirements.basic_information || 
                                  formData.accountRequirements.post_douyin || 
                                  formData.accountRequirements.deblocking || 
                                  formData.accountRequirements.identity_verification || 
                                  formData.accountRequirements.post_ad;
    if (!hasAccountRequirement) {
      newErrors.accountRequirements = '请至少选择一项账号支持';
    }
    
    // 登录方式验证
    const hasLoginMethod = formData.loginMethods.scan_code || formData.loginMethods.phone_message || formData.loginMethods.other_require || formData.loginMethods.account_password;
    if (!hasLoginMethod) {
      newErrors.loginMethods = '请至少选择一种登录方式';
    }
    
    // 联系方式验证
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = '请输入有效的手机号';
    }

    

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (field: keyof AccountRentalForm, value: string | number | boolean | File | null) => {
    // 允许用户在输入过程中删除内容至空值
    setFormData(prev => {
      // 当选择平台类型时，清除其他标签的选中状态
      if (field === 'platformType') {
        return {
          ...prev,
          [field]: value as string,
          allow_renew: 1, // 重置为默认值
          accountRequirements: {
            basic_information: false,
            post_douyin: false,
            deblocking: false,
            identity_verification: false,
            post_ad: false,
          },
          loginMethods: {
            scan_code: true, // 保持默认选中扫码登录
            phone_message: false,
            account_password: false,
            other_require: false,
          }
        };
      }
      return {
        ...prev,
        [field]: value as any
      };
    });
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // 处理登录方式多选框变化
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
      const currentValue = prev[field as keyof AccountRentalForm];
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

  // 处理获取短信验证码
  const handleGetSmsCode = async () => {
    // 先对表单中的所有必填项进行完整性校验
    if (!validateForm()) {
      return;
    }

    try {
      // 调用短信验证码发送API
      const response = await fetch('/api/sms/getSmsSendCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone.trim()
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      const result = await response.json();
      
      if (result.code === 0) {
        // 发送成功，启动倒计时
        setSmsCooldown(true);
        setCooldownTimer(60);
        
        // 倒计时逻辑
        const timer = setInterval(() => {
          setCooldownTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setSmsCooldown(false);
              return 60;
            }
            return prev - 1;
          });
        }, 1000);
        
        showAlert('发送成功', '短信验证码已发送，请查收手机', true);
      } else {
        // 发送失败
        showAlert('发送失败', result.message || '发送验证码失败，请稍后重试', false);
      }
    } catch (error) {
      console.error('获取短信验证码错误:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        showAlert('请求超时', '请求超时，请检查网络连接后重试', false);
      } else {
        showAlert('发送失败', '发送验证码失败，请稍后重试', false);
      }
    }
  };

  // 表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
        
    // 短信验证码验证
    if (!formData.smsCode.trim()) {
      setErrors(prev => ({
        ...prev,
        smsCode: '请输入短信验证码'
      }));
      return;
    } 
    if (formData.smsCode.trim().length !== 6) {
      setErrors(prev => ({
        ...prev,
        smsCode: '短信验证码长度必须为6位'
      }));
      return;
    } 
    if (!/^\d{6}$/.test(formData.smsCode.trim())) {
      setErrors(prev => ({
        ...prev,
        smsCode: '短信验证码必须为6位数字'
      }));
      return;
    }
    
    setIsLoading(true);
    setApiError(null); // 清除之前的错误
    
    try {
      // 先调用短信验证码校验API
      const smsVerifyResponse = await fetch('/api/sms/cheakSmsVerifyCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phone.trim(),
          verifyCode: formData.smsCode.trim()
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      const smsVerifyResult = await smsVerifyResponse.json();
      
      if (smsVerifyResult.code !== 0) {
        // 短信验证码校验失败
        showAlert('验证码错误', '短信验证码错误，请重新输入', false);
        setIsLoading(false);
        return;
      }
      
      // 构建后端API所需的请求参数
      const requestData: CreateOffersRentalInfoRequest = {
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
          post_ad: formData.accountRequirements.post_ad ? 'true' : 'false',
          scan_code: formData.loginMethods.scan_code ? 'true' : 'false',
          phone_message: formData.loginMethods.phone_message ? 'true' : 'false',
          account_password: formData.loginMethods.account_password ? 'true' : 'false',
          other_require: formData.loginMethods.other_require ? 'true' : 'false',
          platform_type: formData.platformType,
          images: formData.accountImages, // 直接使用上传后的图片URL列表
          phone_number: formData.phone
        }
      };
      
      console.log('提交的API请求数据:', requestData);
      // 调用后端API提交数据
      const response = await fetch('/api/rental/rentOut/createOffersRentalnfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      const result: CreateOffersRentalInfoApiResponse = await response.json();

      if (result.code !== 0) {
        throw new Error(result.message || '发布失败');
      }
      
      if (result.code === 0) {
        showAlert('发布成功', result.message || '抖音账号租赁信息已成功发布', true);
        // 发布成功后跳转到账号租赁市场页面
        setTimeout(() => {
          router.push('/rental/rental_market');
        }, 2000);
      } else {
        showAlert('发布失败', result.message || '发布失败，请稍后重试', false);
      }
    } catch (err) {
      console.error('发布错误:', err);
      showAlert('发布失败', err instanceof Error ? err.message : '发布失败，请稍后重试', false);
    } finally {
      setIsLoading(false);
    }
  };



    // 不再需要加载状态渲染

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-2 mt-3">
        <div className="bg-blue-50 border border-blue-200 p-2">
              <div className="text-blue-700 text-sm mb-1">{formData.platformType === 'douyin' ? '填写抖音账号租赁的详细信息，保信息真实有效，账号无异常,及时响应' : '填写QQ账号租赁的详细信息，保信息真实有效，账号无异常,及时响应'}</div>
              <div className="text-red-700 text-sm mb-1">{formData.platformType === 'douyin' ? '风险提醒:账号可能会在租赁期间受到风控，发生后将提前完成租赁并物归原主。原主需要自行解除账号风控。' : '风险提醒:账号可能会在租赁期间受到风控，发生后将提前完成租赁并物归原主。原主需要自行解除账号风控。'}</div>
        </div>
      </div>

        {/* 表单区域 */}
      <div className="max-w-5xl mx-auto px-4 py-2 mb-10">
        {/* 表单内容 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-5 px-6">
          {/* 基础信息 */}
          <div className="space-y-1">  
            <div className="space-y-1">
              {/* 出租信息标题 */}
              <div className="space-y-1">
                <Label htmlFor="title" required>出租信息标题</Label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder=""
                  className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>
  
              {/* 账号信息 */}
              <div className="space-y-1">
                <Label htmlFor="description" required>账号信息</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={formData.platformType === 'douyin' ? "填写抖音账号出租的详细信息，保信息真实有效，账号无异常,及时响应" : "填写QQ账号出租的详细信息，保信息真实有效，账号无异常,及时响应"}
                  className={`${errors.description ? 'border-red-500' : ''} resize-none`}
                  style={{ height: 100,width: '100%' }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              {/* 账号截图 - 使用ImageUpload组件 */}
              <div className="space-y-1">
                <Label required>上传账号截图</Label>
                <ImageUpload
                  maxCount={6}
                  onImagesChange={handleImagesChange}
                  title=""
                  columns={3}
                  gridWidth="100%"
                  itemSize="100x100"
                />
                {errors.accountImages && (
                  <p className="text-red-500 text-sm">{errors.accountImages}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 商品信息 */}
          <div className="mb-3">
            <div className="space-y-1">
              {/* 价格 */}
              <div className="space-y-1">
                <Label required>价格 (元/天)</Label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    onBlur={() => handleBlur('price', 50)}
                    className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
                    step="5"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price}</p>
                )}
              </div>
              
              {/* 最低出租天数 */}
              <div className="space-y-1">
                <Label required>最低出租天数 (天)</Label>
                <input
                  type="number"
                  value={formData.minLeaseDays || ''}
                  onChange={(e) => handleInputChange('minLeaseDays', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                  onBlur={() => handleBlur('minLeaseDays', 1)}
                  className={`input w-full ${errors.minLeaseDays ? 'border-red-500' : ''}`}
                  step="1"
                />
                {errors.minLeaseDays && (
                  <p className="text-red-500 text-sm">{errors.minLeaseDays}</p>
                )}
              </div>

              {/* 最高出租天数 */}
              <div className="space-y-1">
                <Label required>最高出租天数 (天)</Label>
                <input
                  type="number"
                  value={formData.maxLeaseDays || ''}
                  onChange={(e) => handleInputChange('maxLeaseDays', e.target.value === '' ? '' : parseInt(e.target.value) || 30)}
                  onBlur={() => handleBlur('maxLeaseDays', 30)}
                  className={`input w-full ${errors.maxLeaseDays ? 'border-red-500' : ''}`}
                  step="1"
                />
                {errors.maxLeaseDays && (
                  <p className="text-red-500 text-sm">{errors.maxLeaseDays}</p>
                )}
              </div>
              {/* 账号平台类型 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-1">账号平台类型：<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.platformType === 'douyin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('platformType', 'douyin')}
                  >
                    抖音
                  </button>
                  <button
                    type="button"
                    className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.platformType === 'qq' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('platformType', 'qq')}
                  >
                    QQ
                  </button>
                </div>
                {errors.platformType && (
                  <p className="text-red-500 text-sm">{errors.platformType}</p>
                )}
              </div>
              {/* 是否允许续租 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-1">是否允许续租：<span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.allow_renew === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('allow_renew', 1)}
                  >
                    续租
                  </button>
                  <button
                    type="button"
                    className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.allow_renew === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('allow_renew', 0)}
                  >
                    不续租
                  </button>
                </div>
                {errors.allow_renew && (
                  <p className="text-red-500 text-sm">{errors.allow_renew}</p>
                )}
              </div>
              

            </div>
            
            {/* 账号要求 */}
            <div className="space-y-1 mt-1">
              <label className="block text-sm font-medium  mb-1">账号支持：<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {/* 抖音和QQ都显示的标签 */}
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.basic_information ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('accountRequirements', 'basic_information')}
                >
                  修改基本信息
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.deblocking ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('accountRequirements', 'deblocking')}
                >
                  账号解禁
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.identity_verification ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('accountRequirements', 'identity_verification')}
                >
                  实名认证
                </button>
                
                {/* 抖音特有的标签 */}
                {formData.platformType === 'douyin' && (
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.post_douyin ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('accountRequirements', 'post_douyin')}
                  >
                    发布抖音
                  </button>
                )}
                
                {/* QQ特有的标签 */}
                {formData.platformType === 'qq' && (
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.accountRequirements.post_ad ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('accountRequirements', 'post_ad')}
                  >
                    发布广告
                  </button>
                )}
              </div>
              {errors.accountRequirements && (
                <p className="text-red-500 text-sm">{errors.accountRequirements}</p>
              )}
              <div className='text-sm text-gray-600'>支持勾选选项越多，出租概率越大。</div>
            </div>
            
            {/* 登录方式 */}
            <div className="space-y-1 mt-1">
              <label className="block text-sm font-medium mb-1">登录方式（可多选）：<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.account_password ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('loginMethods', 'account_password')}
                  >
                    账号密码
                  </button>
                
                {/* 抖音和QQ都显示的登录方式 */}
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.scan_code ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('loginMethods', 'scan_code')}
                >
                  扫码登录
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.phone_message ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('loginMethods', 'phone_message')}
                >
                  短信验证
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.loginMethods.other_require ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('loginMethods', 'other_require')}
                >
                  不登录，按承租方需求修改账户相关
                </button>
              </div>
              {errors.loginMethods && (
                <p className="text-red-500 text-sm">{errors.loginMethods}</p>
              )}
              <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高账号出租概率。</div>
            </div>
            
            {/* 联系方式 */}
            <div className="space-y-1 mt-1">
              {/* 手机号 */}
              <div className="space-y-1">
                <Label htmlFor="phone" required>手机号</Label>
                <div className="flex space-x-2">
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="请输入手机号"
                    className={`input flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                    maxLength={11}
                  />
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${smsCooldown ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    onClick={handleGetSmsCode}
                    disabled={smsCooldown}
                  >
                    {smsCooldown ? `${cooldownTimer}秒后重试` : '获取验证码'}
                  </button>
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
              
              {/* 短信验证码 */}
              <div className="space-y-1">
                <Label htmlFor="smsCode" required>短信验证码</Label>
                <input
                  id="smsCode"
                  type="text"
                  value={formData.smsCode}
                  onChange={(e) => handleInputChange('smsCode', e.target.value)}
                  placeholder="请输入短信验证码"
                  className={`input w-full ${errors.smsCode ? 'border-red-500' : ''}`}
                  maxLength={6}
                />
                {errors.smsCode && (
                  <p className="text-red-500 text-sm">{errors.smsCode}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮 - 增加总价显示 */}
          <div className="flex justify-center space-x-3">
            <Button 
              onClick={() => router.push('/rental/rental_publish')}
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2"
            >
              取消
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="primary"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  发布中...
                </>
              ) : (
                `发布出租信息`
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        
        onClose={() => setShowAlertModal(false)}
      />

    </div>
  );
}