'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Textarea, NumberInput, Label, AlertModal } from '@/components/ui';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';

// 定义后端API返回的账号租赁数据结构
export interface RentalPublishData {
  id: string;
  userId: string;
  platform: string;
  accountType: string;
  pricePerDay: number;
  budgetDeposit: number;
  expectedLeaseDays: number;
  description: string;
  status: string;
  createTime: string;
}

// 定义后端API返回的整体响应结构
export interface RentalPublishResponse {
  code: number;
  message: string;
  data: RentalPublishData | null;
  success: boolean;
  timestamp: number;
}

// 定义抖音账号租赁表单类型
interface DouyinAccountRentalForm {
  // 基础信息
  description: string;
  accountImages: File[];
  accountVideo?: File | null;
  price: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  accountRequirements: {
    canChangeName: boolean;
    canIntroduction: boolean;
    canPostComments: boolean;
    canPostVideos: boolean;
    canUnbanAccount: boolean;
  };
  loginMethods: string[]; // ['scan', 'phone_sms', 'no_login'] 支持多选
  phone: string;
  qq?: string;
  email?: string;
}


export default function DouyinAccountRentalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DouyinAccountRentalForm>({
    description: '',
    accountImages: [],
    accountVideo: null,
    price: 50,
    minLeaseDays: 1, 
    maxLeaseDays: 30,
    accountRequirements: {
      canChangeName: false,
      canIntroduction: false,
      canPostComments: false,
      canPostVideos: false,
      canUnbanAccount: false,
    },
    loginMethods: ['scan'], // 默认选择扫码登录
    phone: '',
    qq: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // API调用逻辑已移至按钮点击事件中
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: null as React.ReactNode | null
  });

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
    if (!formData.description.trim()) {
      newErrors.description = '请输入账号标题';
    } else if (formData.description.length < 5 || formData.description.length > 300) {
      newErrors.description = '账号标题长度需在5-300个字符之间';
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
    if (formData.loginMethods.length === 0) {
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
  
  // 处理登录方式多选框变化
  const handleLoginMethodChange = (value: string) => {
    setFormData(prev => {
      const currentMethods = [...prev.loginMethods];
      const index = currentMethods.indexOf(value);
      
      if (index === -1) {
        // 添加选中的值
        return {
          ...prev,
          loginMethods: [...currentMethods, value]
        };
      } else {
        // 移除未选中的值
        return {
          ...prev,
          loginMethods: currentMethods.filter(item => item !== value)
        };
      }
    });
  };
  
  // 处理复选框变化
  const handleCheckboxChange = (group: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [group]: {
        ...prev[group as keyof DouyinAccountRentalForm] as Record<string, boolean>,
        [field]: !(prev[group as keyof DouyinAccountRentalForm] as Record<string, boolean>)[field]
      }
    }));
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

  // 处理多张图片上传
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const remainingSlots = 6 - formData.accountImages.length; // 最多支持6张图片
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      setFormData(prev => ({
        ...prev,
        accountImages: [...prev.accountImages, ...filesToAdd]
      }));
    }
    
    // 清除文件输入，允许重复选择相同的文件
    if (e.target) {
      e.target.value = '';
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accountImages: prev.accountImages.filter((_, i) => i !== index)
    }));
  };

  // 获取图片的URL用于预览
  const getImagePreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  // 表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError(null); // 清除之前的错误
    
    try {
      // 构建后端API所需的请求参数
      const requestData = {
        platform: 'DOUYIN', // 固定为抖音平台
        accountType: 'Forrent', // 固定为抖音平台
        pricePerDay: formData.price || 50,
        budgetDeposit: formData.price*2 || 100, // 保证金设为价格的2倍
        minLeaseDays: formData.minLeaseDays || 1, // 最小租赁天数设为1
        maxLeaseDays: formData.maxLeaseDays || 30, // 最大租赁天数设为30
        description: formData.description
      };
      
      console.log('提交的API请求数据:', requestData);
      
      // 调用后端API提交数据
      const response = await fetch('/api/rental/publishrental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: RentalPublishResponse = await response.json();
      
      if (result.success) {
        showAlert('发布成功', '抖音账号租赁信息已成功发布', true);
        // 发布成功后跳转到账号租赁市场页面
        setTimeout(() => {
          router.push('/accountrental/account-rental-market');
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
              {/* 账号标题 - 修改为多行文本框 */}
              <div className="space-y-1">
                <Label htmlFor="description" required>账号信息</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="填写抖音账号出租的详细信息，保信息真实有效，账号无异常,及时响应"
                  className={`${errors.description ? 'border-red-500' : ''} resize-none`}
                  style={{ height: 150,width: '100%' }}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              {/* 账号截图 - 修改为支持多张图片 */}
              <div className="space-y-1">
                <Label required>上传账号截图</Label>
                <div 
                  className={`rounded-lg p-3 border-2 transition-colors ${formData.accountImages.length >= 6 ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300 bg-white hover:border-blue-500'}`}
                  style={{
                    minHeight: 230,
                    maxHeight: 'auto'
                  }}
                >
                  <input
                    id="accountImagesInput"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesUpload}
                  />
                  
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 h-full">
                    {formData.accountImages.map((file, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden shadow-sm border border-gray-100 max-w-[150px] max-h-[150px] min-w-[75px] min-h-[75px] flex-shrink-0 w-full">
                        <img 
                          src={getImagePreviewUrl(file)} 
                          alt={`账号截图 ${index + 1}`} 
                          className="w-full h-full object-contain"
                          style={{ minHeight: 75, maxHeight: 150}}
                        />
                        <button 
                          type="button"
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70 border-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                        
                    {formData.accountImages.length < 6 && (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-500 w-[87px] h-[87px]"
                        onClick={() => document.getElementById('accountImagesInput')?.click()}
                      >
                        <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-400">添加图片</span>
                      </div>
                    )}
                  </div>
                </div>
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
                <Label required>价格 (元/天)</Label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    onBlur={() => handleBlur('price', 50)}
                    className={`input ${errors.price ? 'border-red-500' : ''}`}
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
                  className={`input ${errors.minLeaseDays ? 'border-red-500' : ''}`}
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
                  className={`input ${errors.maxLeaseDays ? 'border-red-500' : ''}`}
                  step="1"
                />
                {errors.maxLeaseDays && (
                  <p className="text-red-500 text-sm">{errors.maxLeaseDays}</p>
                )}
              </div>
              

            </div>
            
            {/* 账号要求 */}
            <div className="space-y-1">
              <label className="block text-sm font-medium  mb-2">账号支持</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accountRequirements.canChangeName}
                    onChange={() => handleCheckboxChange('accountRequirements', 'canChangeName')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm ">修改抖音账号名称和头像</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accountRequirements.canIntroduction}
                    onChange={() => handleCheckboxChange('accountRequirements', 'canIntroduction')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm ">修改账号简介</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accountRequirements.canPostComments}
                    onChange={() => handleCheckboxChange('accountRequirements', 'canPostComments')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm ">支持发布评论</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accountRequirements.canPostVideos}
                    onChange={() => handleCheckboxChange('accountRequirements', 'canPostVideos')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm ">支持发布视频</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accountRequirements.canUnbanAccount}
                    onChange={() => handleCheckboxChange('accountRequirements', 'canUnbanAccount')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm ">支持账号解封</span>
                </label>
                <div className='text-sm text-gray-600'>支持勾选选项越多，出租概率越大。</div>
              </div>
            </div>
            
            {/* 登录方式 */}
            <div className="space-y-1 mt-3">
              <label className="block text-sm font-medium mb-2">登录方式（可多选）</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="scan"
                    checked={formData.loginMethods.includes('scan')}
                    onChange={() => handleLoginMethodChange('scan')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">扫码登录</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="phone_sms"
                    checked={formData.loginMethods.includes('phone_sms')}
                    onChange={() => handleLoginMethodChange('phone_sms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">手机号+短信验证登录</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="no_login"
                    checked={formData.loginMethods.includes('no_login')}
                    onChange={() => handleLoginMethodChange('no_login')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">不登录账号，按照承租方要求完成租赁</span>
                </label>
              </div>
              <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高账号出租概率。</div>
            </div>
            
            {/* 联系方式 */}
            <div className="space-y-1 mt-3">
              {/* 手机号 */}
              <div className="space-y-1">
                <Label htmlFor="phone" required>手机号</Label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="请输入手机号"
                  className={`input ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
              
              {/* QQ号 */}
              <div className="space-y-1">
                <Label htmlFor="qq">QQ号（选填）</Label>
                <input
                  id="qq"
                  type="text"
                  value={formData.qq}
                  onChange={(e) => handleInputChange('qq', e.target.value)}
                  placeholder="请输入QQ号"
                  className={`input ${errors.qq ? 'border-red-500' : ''}`}
                />
                {errors.qq && (
                  <p className="text-red-500 text-sm">{errors.qq}</p>
                )}
              </div>
              
              {/* 邮箱 */}
              <div className="space-y-1">
                <Label htmlFor="email">邮箱（选填）</Label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="请输入邮箱地址"
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* 操作按钮 - 增加总价显示 */}
          <div className="mt-3 flex justify-center space-x-3">
            <Button 
              onClick={() => router.push('/accountrental/account-rental-publish')}
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
                `发布出租`
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
        icon={alertConfig.icon}
        onClose={() => setShowAlertModal(false)}
      />

    </div>
  );
}