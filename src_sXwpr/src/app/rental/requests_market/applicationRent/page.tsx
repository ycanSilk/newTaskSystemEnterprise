'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea, Label, Button, AlertModal } from '@/components/ui';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ImageUpload from '@/components/imagesUpload/ImageUpload';

// 定义简化的表单类型
interface SimplifiedForm {
  description: string; // 账号信息
  accountImages: string[];
  allowRenew: 0 | 1; // 是否允许续租
  applyDays: number | string; // 应征天数，允许空字符串
  phone: string; // 手机号
  smsCode: string; // 短信验证码
}

// 主内容组件，包含useSearchParams的使用
const MainContent = () => {
  // 获取URL查询参数
  const searchParams = useSearchParams();
  const router = useRouter();
  const [demandId, setDemandId] = useState<number | undefined>(undefined);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: null as React.ReactNode | null
  });
  
  // 从URL查询参数中获取demand_id
  useEffect(() => {
    // 方法1：使用useSearchParams获取demand_id查询参数
    const demandIdParam = searchParams.get('demand_id');
    if (demandIdParam) {
      const parsedId = parseInt(demandIdParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        setDemandId(parsedId);
        console.log('从URL查询参数获取到demand_id:', parsedId);
        return;
      }
    }
    
    console.log('无法获取有效的id参数');
  }, [searchParams]);
  
  const [formData, setFormData] = useState<SimplifiedForm>({
    description: '', // 账号信息
    accountImages: [],
    allowRenew: 1, // 默认允许续租
    applyDays: '', // 默认应征天数为空
    phone: '', // 手机号
    smsCode: '', // 短信验证码
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [smsCooldown, setSmsCooldown] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(60);
  
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

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number) => {
    // 对于应征天数，允许空值
    let processedValue = value;
    if (field === 'applyDays' && value === '') {
      processedValue = '';
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // 处理获取短信验证码
  const handleGetSmsCode = async () => {
    // 验证手机号
    if (!formData.phone.trim()) {
      setErrors(prev => ({
        ...prev,
        phone: '请输入手机号'
      }));
      return;
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      setErrors(prev => ({
        ...prev,
        phone: '请输入正确的11位手机号码'
      }));
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

  // 手机号验证函数
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };
  
  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 验证demandId
    if (demandId === undefined || isNaN(demandId) || demandId <= 0) {
      newErrors.demandId = '无效的求租信息ID';
    }
    console.log('应征申请的id；demandId:', demandId);
    
    // 账号信息验证
    if (!formData.description.trim()) {
      newErrors.description = '请输入账号信息';
    } else if (formData.description.length < 4 || formData.description.length > 100) {
      newErrors.description = '账号信息长度需在4-100个字符之间';
    }
    
    // 账号截图验证
    if (formData.accountImages.length === 0) {
      newErrors.accountImages = '请至少上传一张账号截图';
    } else if (formData.accountImages.length > 6) {
      newErrors.accountImages = '最多允许上传6张账号截图';
    }
    
    // 应征天数验证
    if (!formData.applyDays || formData.applyDays === '') {
      newErrors.applyDays = '请输入有效的应征天数';
    } else {
      const days = parseInt(formData.applyDays as string);
      if (isNaN(days) || days < 1 || days > 30) {
        newErrors.applyDays = '应征天数必须为1-30之间的整数';
      }
    }
    
    // 是否允许续租验证
    if (formData.allowRenew !== 0 && formData.allowRenew !== 1) {
      newErrors.allowRenew = '请选择是否允许续租';
    }
    
    // 手机号验证
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = '请输入正确的11位手机号码';
    }
    
    // 短信验证码验证
    if (!formData.smsCode.trim()) {
      newErrors.smsCode = '请输入短信验证码';
    } else if (formData.smsCode.trim().length !== 6 || !/^\d{6}$/.test(formData.smsCode.trim())) {
      newErrors.smsCode = '短信验证码必须为6位数字';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理应征申请提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. 先校验短信验证码
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
      if (smsVerifyResult.code === 0) {
        // 2. 构建符合API要求的请求数据
        const requestData = {
          demand_id: demandId,
          allow_renew: formData.allowRenew,
          application_json: {
            screenshots: formData.accountImages,
            description: formData.description,
            apply_days: formData.applyDays === '' ? 1 : parseInt(formData.applyDays as string) || 1
          }
        };
        console.log('请求API提交的信息:', requestData);

        // 3. 调用应征申请API
        const response = await fetch('/api/rental/requestRental/applyRequestRentalInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.success) {
          // 处理成功响应
          showAlert('提交成功', '应征申请提交成功！', true);
          // 3秒后跳转到我的应征申请列表页面
          setTimeout(() => {
            router.push('/rental/my/myapplication');
          }, 2000);
        } else {
          // 处理失败响应
          showAlert('提交失败', `提交失败：${result.message}`, false);
        }
      }
    } catch (error) {
      // 处理网络错误
      console.error('应征申请提交错误:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        showAlert('请求超时', '请求超时，请检查网络连接后重试', false);
      } else {
        showAlert('网络错误', '网络错误，请稍后重试', false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      <div className="px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 p-2">
             求租信息账号应征申请，请详细描述你的账号信息和上传账号截图
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-5 px-3">
          {/* 基础信息 */}
          <div className="space-y-1 mb-2">  
            <div className="space-y-1">
              {/* 显示demandId错误信息 */}
              {errors.demandId && (
                <p className="text-red-500 text-sm mb-2">{errors.demandId}</p>
              )}
              
              {/* 账号信息 */}
              <div className="space-y-1">
                <Label htmlFor="description" required>账号信息</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="填写你的账号信息，账号需真实有效，无异常"
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

              {/* 应征天数 */}
              <div className="space-y-1">
                <Label htmlFor="applyDays" required>应征天数</Label>
                <input
                  id="applyDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.applyDays}
                  onChange={(e) => handleInputChange('applyDays', e.target.value)}
                  placeholder="请输入你的账号可出租天数"
                  className={`border ${errors.applyDays ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                />
                {errors.applyDays && (
                  <p className="text-red-500 text-sm">{errors.applyDays}</p>
                )}
              </div>

              {/* 是否允许续租 */}
              <div className="space-y-1">
                <Label required>是否允许续租</Label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className={`px-8 py-2 rounded-full text-sm transition-colors ${formData.allowRenew === 1 ? 'bg-blue-600 text-white border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('allowRenew', 1)}
                  >
                    是
                  </button>
                  <button
                    type="button"
                    className={`px-8 py-2 rounded-full text-sm transition-colors ${formData.allowRenew === 0 ? 'bg-blue-600 text-white border border-blue-300' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleInputChange('allowRenew', 0)}
                  >
                    否
                  </button>
                </div>
                {errors.allowRenew && (
                  <p className="text-red-500 text-sm">{errors.allowRenew}</p>
                )}
              </div>
              
              {/* 手机号 */}
              <div className="space-y-1">
                <Label htmlFor="phone" required>手机号</Label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="请输入11位手机号"
                  className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 w-full`}
                  maxLength={11}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
              
              {/* 短信验证码 */}
              <div className="space-y-1">
                <Label htmlFor="smsCode" required>短信验证码</Label>
                <div className="flex space-x-2">
                  <input
                    id="smsCode"
                    type="text"
                    value={formData.smsCode}
                    onChange={(e) => handleInputChange('smsCode', e.target.value)}
                    placeholder="请输入6位验证码"
                    className={`border ${errors.smsCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 flex-1`}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleGetSmsCode}
                    disabled={smsCooldown}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${smsCooldown ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    {smsCooldown ? `${cooldownTimer}秒后重试` : '获取验证码'}
                  </button>
                </div>
                {errors.smsCode && (
                  <p className="text-red-500 text-sm">{errors.smsCode}</p>
                )}
              </div>
            </div>
          </div>
{/* 应征申请按钮 */}
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleSubmit}
              variant="primary"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  提交中...
                </>
              ) : (
                '我要出租'
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

// 主组件，使用Suspense包裹MainContent
export default function DouyinAccountRentalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">加载中...</div>}>
      <MainContent />
    </Suspense>
  );
}