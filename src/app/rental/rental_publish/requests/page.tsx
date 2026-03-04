'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateRequestRentalInfoParams } from '@/app/types/rental/requestRental/createRequestRentalInfoTypes';

const PublishForm = () => {
  const router = useRouter();
  
  // 表单状态，直接使用API接口类型
  const [formData, setFormData] = useState<CreateRequestRentalInfoParams>({
    title: '',
    budget_amount: 0,
    days_needed: 1,
    deadline: 0,
    requirements_json: { 
      account_requirements: '账号真实有效，无异常，及时回应租客消息',   // 账号要求
      basic_information: 'false',          //支持修改账号基本信息
      identity_verification: 'false',          //需要实名认证
      deblocking: 'false',                 //需要人脸验证解封
      post_douyin: 'false',                 //发布抖音
      post_ad: 'false',                     //发布广告（QQ）

      other_require: 'false',           //按承租方要求登录
      phone_message: 'false',           //手机号+短信验证登录
      scan_code: 'false',        // 扫码登录
      account_password: 'false',        // 账号密码登录（QQ）

      platform_type: 'douyin',           // 平台类型（抖音或QQ）
      qq_number:''               //联系方式：QQ号

    }
  });

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 错误信息提示
  const [errorMessage, setErrorMessage] = useState('');
  
  // 成功模态框状态
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // QQ验证函数
  const validateQQ = (qq: string): boolean => {
    // QQ号格式：1-9开头，5-11位数字
    const qqRegex = /^[1-9]\d{4,10}$/;
    return qqRegex.test(qq);
  };
  
  // 表单验证函数
  const validateForm = (): boolean => {
    // 1. 标题验证
    if (!formData.title.trim()) {
      setErrorMessage('请输入求租信息标题');
      return false;
    }
    
    // 2. 描述验证
    if (!formData.requirements_json.account_requirements.trim()) {
      setErrorMessage('请输入求租信息描述');
      return false;
    }
    
    // 3. 预算金额验证
    if (formData.budget_amount <= 0) {
      setErrorMessage('请输入有效的预算金额');
      return false;
    }
    
    // 4. 租赁天数验证
    if (formData.days_needed <= 0) {
      setErrorMessage('请输入有效的租赁天数');
      return false;
    }
    
    // 5. 截止时间验证
    if (formData.deadline <= 0) {
      setErrorMessage('请选择截止时间');
      return false;
    }
    
    // 6. 平台类型验证
    if (!formData.requirements_json.platform_type) {
      setErrorMessage('请选择平台类型');
      return false;
    }
    
    // 7. QQ验证（必填）
    if (!formData.requirements_json.qq_number.trim()) {
      setErrorMessage('请输入QQ号码');
      return false;
    } else if (!validateQQ(formData.requirements_json.qq_number)) {
      setErrorMessage('请输入有效的QQ号码');
      return false;
    }
    
    // 8. 账号要求验证
    // 至少选择一个账号要求
    const hasAccountRequirement = 
      formData.requirements_json.basic_information === 'true' ||
      formData.requirements_json.other_require === 'true' ||
      formData.requirements_json.deblocking === 'true' ||
      (formData.requirements_json.platform_type === 'douyin' && formData.requirements_json.post_douyin === 'true') ||
      (formData.requirements_json.platform_type === 'qq' && formData.requirements_json.post_ad === 'true');
    
    if (!hasAccountRequirement) {
      setErrorMessage('请至少选择一个账号要求');
      return false;
    }
    
    // 9. 登录方式验证
    // 至少选择一个登录方式
    const hasLoginMethod = 
      formData.requirements_json.scan_code === 'true' ||
      formData.requirements_json.phone_message === 'true' ||
      formData.requirements_json.other_require === 'true' ||
      (formData.requirements_json.platform_type === 'qq' && formData.requirements_json.account_password === 'true');
    
    if (!hasLoginMethod) {
      setErrorMessage('请至少选择一种登录方式');
      return false;
    }
    
    return true;
  };

  // 处理平台类型选择
  const handlePlatformTypeChange = (platformType: string) => {
    setFormData(prev => ({
      ...prev,
      platformType,
      requirements_json: {
        ...prev.requirements_json,
        platform_type: platformType,
        basic_information: 'false',
        other_requirements: 'false',
        deblocking: 'false',
        post_douyin: 'false',
        post_ad: 'false',
        additional_requirements_tag: 'false',
        requested_all: 'false',
        phone_message: 'false',
        scan_code: 'false',
        account_password: 'false'
      }
    }));
  };

  // 输入变化处理函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 处理顶层字段
    if (['title', 'budget_amount', 'days_needed', 'deadline'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: 
          name === 'budget_amount' ? (value === '' ? 0 : parseFloat(value) || 0) : 
          name === 'days_needed' ? (value === '' ? 0 : parseInt(value) || 0) :
          name === 'deadline' ? parseInt(value) || 0 : value
      }));
    }
    // 处理描述字段，映射到account_requirements
    else if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        requirements_json: {
          ...prev.requirements_json,
          account_requirements: value
        }
      }));
    }
    // 处理QQ号码（表单字段名qq -> API字段名qq_number）
    else if (name === 'qq') {
      setFormData(prev => ({
        ...prev,
        requirements_json: {
          ...prev.requirements_json,
          qq_number: value
        }
      }));
    }
    // 处理其他requirements_json字段
    else if (name in formData.requirements_json) {
      setFormData(prev => ({
        ...prev,
        requirements_json: {
          ...prev.requirements_json,
          [name]: value
        }
      }));
    }
    
    // 清除对应字段错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // 处理标签点击变更
  const handleTagClick = (field: keyof CreateRequestRentalInfoParams['requirements_json']) => {
    setFormData(prev => ({
      ...prev,
      requirements_json: {
        ...prev.requirements_json,
        [field]: prev.requirements_json[field] === 'false' ? 'true' : 'false'
      }
    }));
  };

  // 复选框变化处理函数（0/1切换）
  const handleCheckboxChange = (field: keyof CreateRequestRentalInfoParams['requirements_json']) => {
    setFormData(prev => ({
      ...prev,
      requirements_json: {
        ...prev.requirements_json,
        [field]: prev.requirements_json[field] === 'false' ? 'true' : 'false'
      }
    }));
  };

  // 成功确认处理函数
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/rental/requests_market');
  };
  
  // 取消处理函数
  const handleCancel = () => {
    router.push('/rental/rental_publish');
  };

  // 表单提交处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage('');
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    try {
      // 准备请求体，确保预算金额和天数转换为数字类型，并将boolean值转换为0/1
      const requestBody = {
        ...formData,
        days_needed: formData.days_needed === 0 ? 1 : formData.days_needed, // 确保最小天数为1
        budget_amount: formData.budget_amount * 100, // 转换为分
        requirements_json: {
          ...formData.requirements_json,
          platform_type: formData.requirements_json.platform_type,
          basic_information: formData.requirements_json.basic_information === 'true',
          other_require: formData.requirements_json.other_require === 'true',
          deblocking: formData.requirements_json.deblocking === 'true',
          post_douyin: formData.requirements_json.post_douyin === 'true',
          post_ad: formData.requirements_json.post_ad === 'true',
        
        
          phone_message: formData.requirements_json.phone_message === 'true',
          scan_code: formData.requirements_json.scan_code === 'true',
          account_password: formData.requirements_json.account_password === 'true'
        }
      };
      
      // 调用API
      const response = await fetch('/api/rental/requestRental/createRequestRentalInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      // 处理响应
      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.message || '发布失败，请稍后重试');
      }
    } catch (error) {
      console.error('发布求租信息失败:', error);
      setErrorMessage('发布失败，请稍后重试');
    }
  };

  // 渲染函数，所有函数定义在return之前
  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-3xl mx-auto px-5 mb-10">   
        <div className="py-2">
            <div className="bg-blue-50 border border-blue-200 p-2">
              <div className="text-blue-700 text-sm mb-1">{formData.requirements_json.platform_type === 'douyin' ? '填写抖音账号租赁的详细信息，保信息真实有效，账号无异常,及时响应' : '填写QQ账号租赁的详细信息，保信息真实有效，账号无异常,及时响应'}</div>
              <div className="text-red-700 text-sm mb-1">{formData.requirements_json.platform_type === 'douyin' ? '风险提醒:账号可能会在租赁期间受到风控，发生后将提前完成租赁并物归原主。原主需要自行解除账号风控。' : '风险提醒:账号可能会在租赁期间受到风控，发生后将提前完成租赁并物归原主。原主需要自行解除账号风控。'}</div>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-3">
          {/* 标题输入 */}
          <div className="mb-1">
            <label htmlFor="title" className="block text-sm font-medium  mb-1">
              求租信息标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入求租信息标题"
              maxLength={50}
              required
            />
          </div>

          {/* 描述输入 */}
          <div className="mb-1">
            <label htmlFor="description" className="block text-sm font-medium  mb-1">
              求租信息描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.requirements_json.account_requirements}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder={formData.requirements_json.platform_type === 'douyin' ? '填写抖音账号求租的详细信息，保信息真实有效，账号无异常,及时响应' : '填写QQ账号求租的详细信息，保信息真实有效，账号无异常,及时响应'}
              rows={3}
              maxLength={80}
              required
            />          
          </div>

          {/* 预算金额 */}
          <div className="mb-1">
            <label htmlFor="budget_amount" className="block text-sm font-medium  mb-1">
              预算金额 (元)/天 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="budget_amount"
              name="budget_amount"
              value={formData.budget_amount === 0 ? '' : formData.budget_amount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入预算金额"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* 需要天数 */}
          <div className="mb-1">
            <label htmlFor="days_needed" className="block text-sm font-medium  mb-1">
              需要租赁天数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="days_needed"
              name="days_needed"
              value={formData.days_needed === 0 ? '' : formData.days_needed}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入需要天数"
              min="1"
              required
            />
          </div>

          {/* 截止时间 */}
          <div className="mb-1">
            <label htmlFor="deadline" className="block text-sm font-medium  mb-1">
              截止时间<span className="text-red-500">（请选择具体时间，不可以选择日期）*</span>
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              onChange={(e) => {
                // 将选择的日期转换为当天0点0分0秒的时间戳
                const selectedDate = new Date(e.target.value);
                // 设置为当天0点
                selectedDate.setHours(0, 0, 0, 0);
                const timestamp = Math.floor(selectedDate.getTime() / 1000);
                setFormData(prev => ({ ...prev, deadline: timestamp }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            />
          </div>

          {/* 平台类型 */}
          <div className="mb-1">
            <label className="block text-sm font-medium mb-2">平台类型 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.platform_type === 'douyin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handlePlatformTypeChange('douyin')}
              >
                抖音
              </button>
              <button
                type="button"
                className={`px-5 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.platform_type === 'qq' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handlePlatformTypeChange('qq')}
              >
                QQ
              </button>
            </div>
          </div>

          {/* QQ */}
          <div className="mb-1">
            <label htmlFor="qq" className="block text-sm font-medium  mb-1">
              QQ号码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="qq"
              name="qq"
              value={formData.requirements_json.qq_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="请输入QQ号码"
              required
            />
          </div>
          
          {/* 账号要求 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">账号要求 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {/* 抖音和QQ都显示的标签 */}
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.basic_information === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('basic_information')}
              >
                修改基本信息
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.deblocking === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('deblocking')}
              >
                账号解禁
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.identity_verification === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('identity_verification')}
              >
                实名认证
              </button>
              
              {/* 抖音特有的标签 */}
              {formData.requirements_json.platform_type === 'douyin' && (
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.post_douyin === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('post_douyin')}
                >
                  发布抖音
                </button>
              )}
              
              {/* QQ特有的标签 */}
              {formData.requirements_json.platform_type === 'qq' && (
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.post_ad === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('post_ad')}
                >
                  发布广告
                </button>
              )}
            </div>
            <div className='text-sm text-gray-600'>选择的要求越多，匹配到合适账号的概率越大。</div>
          </div>
          
         
          
          {/* 登录方式 */}
          <div className="space-y-3 mt-3">
            <label className="block text-sm font-medium mb-2">登录方式（可多选） <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.account_password === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                  onClick={() => handleTagClick('account_password')}
                >
                  账号密码
                </button>
              
              {/* 抖音和QQ都显示的登录方式 */}
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.scan_code === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('scan_code')}
              >
                扫码登录
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.phone_message === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('phone_message')}
              >
                短信验证
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.other_require === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                onClick={() => handleTagClick('other_require')}
              >
                不登录，按承租方需求修改账户相关方要求
              </button>
            </div>
            <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高匹配概率。</div>
          </div>

          {/* 错误信息 */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">❌</span>
                <span className="text-sm text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}
          
          {/* 表单操作按钮 */}
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 mb-1">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 rounded-lg  hover:bg-gray-50 transition-colors duration-200"
              onClick={handleCancel}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              发布求租信息
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