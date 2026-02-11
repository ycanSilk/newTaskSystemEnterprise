'use client'
import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

// 租赁请求详情接口定义
interface RentalRequestDetailResponse {
  id: string;
  userId: string;
  title: string;
  budget_amount_yuan: number;
  days_needed: number;
  deadline: number;
  requirements_json: {
    account_requirements: string;
    basic_information: string;
    other_requirements: string;
    deblocking: string;
    post_douyin: string;
    additional_requirements_tag: string;
    requested_all: string;
    phone_message: string;
    scan_code: string;
    qq_number: string;
    phone_number: string;
    email: string;
    additional_requirements: string;
  };
  status: string;
  createTime: string;
  createdAt?: string;
  updatedAt?: string;
}

const RentalRequestDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id as string || '';
  const editParam = searchParams.get('edit') || '0';
  const isEditMode = editParam === '1';
  const [loading, setLoading] = useState(false);
  const [offerDetail, setOfferDetail] = useState<RentalRequestDetailResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 表单数据状态
  const [formData, setFormData] = useState<RentalRequestDetailResponse>({
    id: '',
    userId: '',
    title: '',
    budget_amount_yuan: 0,
    days_needed: 1,
    deadline: 0,
    requirements_json: {
      account_requirements: '',
      basic_information: 'false',
      other_requirements: 'false',
      deblocking: 'false',
      post_douyin: 'false',
      additional_requirements_tag: 'false',
      requested_all: 'false',
      phone_message: 'false',
      scan_code: 'false',
      qq_number: '',
      phone_number: '',
      email: '',
      additional_requirements: ''
    },
    status: '',
    createTime: ''
  });

  // 加载数据
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/rental/requestRental/getRequestRentalInfoDetail?demand_id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch rental request detail');
        }
        
        const responseData = await response.json();
        
        // 正确访问嵌套的数据结构
        const apiData = responseData.data;
        console.log('API原始数据:', apiData);
        
        // 确保所有字段都被正确设置，包括字符串布尔值字段
        const finalData: RentalRequestDetailResponse = {
          id: apiData.id || '',
          userId: apiData.userId || '',
          title: apiData.title || '',
          budget_amount_yuan: apiData.budget_amount_yuan || 0,
          days_needed: apiData.days_needed || 1,
          deadline: apiData.deadline || 0,
          requirements_json: {
            account_requirements: apiData.requirements_json?.account_requirements || '',
            basic_information: apiData.requirements_json?.basic_information === 1 ? 'true' : 'false',
            other_requirements: apiData.requirements_json?.other_requirements === 1 ? 'true' : 'false',
            deblocking: apiData.requirements_json?.deblocking === 1 ? 'true' : 'false',
            post_douyin: apiData.requirements_json?.post_douyin === 1 ? 'true' : 'false',
            additional_requirements_tag: apiData.requirements_json?.additional_requirements_tag === 1 ? 'true' : 'false',
            requested_all: apiData.requirements_json?.requested_all === 1 ? 'true' : 'false',
            phone_message: apiData.requirements_json?.phone_message === 1 ? 'true' : 'false',
            scan_code: apiData.requirements_json?.scan_code === 1 ? 'true' : 'false',
            qq_number: apiData.requirements_json?.qq_number || '',
            phone_number: apiData.requirements_json?.phone_number || '',
            email: apiData.requirements_json?.email || '',
            additional_requirements: apiData.requirements_json?.additional_requirements || ''
          },
          status: String(apiData.status || ''),
          createTime: String(apiData.createTime || ''),
          createdAt: apiData.createdAt ? String(apiData.createdAt) : undefined,
          updatedAt: apiData.updatedAt ? String(apiData.updatedAt) : undefined
        };
        console.log('最终数据:', finalData);

        setOfferDetail(finalData);
        
        // 直接使用API返回的数据作为表单初始数据
        setFormData(finalData);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // 表单验证函数
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 标题不能为空
    if (!formData.title?.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    // 预算金额验证
    if (formData.budget_amount_yuan <= 0) {
      newErrors.budget_amount_yuan = '预算金额必须大于0';
    }
    
    // 需要租赁天数验证
    if (formData.days_needed <= 0) {
      newErrors.days_needed = '需要租赁天数必须大于0';
    }
    
    // 截止时间验证
    if (formData.deadline <= 0) {
      newErrors.deadline = '请选择截止时间';
    }
    
    // 描述验证
    if (!formData.requirements_json.account_requirements?.trim()) {
      newErrors.account_requirements = '描述不能为空';
    }
    
    // QQ号码验证
    if (!formData.requirements_json.qq_number?.trim()) {
      newErrors.qq = '请输入QQ号码';
    } else if (!/^[1-9]\d{4,10}$/.test(formData.requirements_json.qq_number)) {
      newErrors.qq = '请输入有效的QQ号码';
    }
    
    // 手机号验证（选填）
    if (formData.requirements_json.phone_number?.trim() && !/^1[3-9]\d{9}$/.test(formData.requirements_json.phone_number)) {
      newErrors.phone_number = '请输入有效的手机号';
    }
    
    // 邮箱验证（选填）
    if (formData.requirements_json.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requirements_json.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 处理顶层字段
    if (['title', 'budget_amount', 'days_needed'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: 
          name === 'budget_amount' ? (value === '' ? 0 : parseFloat(value) || 0) : 
          name === 'days_needed' ? (value === '' ? 0 : parseInt(value) || 0) : value
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
  const handleTagClick = (field: keyof typeof formData.requirements_json) => {
    setFormData(prev => ({
      ...prev,
      requirements_json: {
        ...prev.requirements_json,
        [field]: prev.requirements_json[field] === 'false' ? 'true' : 'false'
      }
    }));
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // 准备提交数据，确保字段名称与API请求示例一致
    const submitData = {
      demand_id: parseInt(id),
      title: formData.title,
      budget_amount_yuan: formData.budget_amount_yuan,
      days_needed: formData.days_needed,
      deadline: formData.deadline,
      requirements_json: {
        account_requirements: formData.requirements_json.account_requirements,
        basic_information: formData.requirements_json.basic_information,
        other_requirements: formData.requirements_json.other_requirements,
        deblocking: formData.requirements_json.deblocking,
        post_douyin: formData.requirements_json.post_douyin,
        additional_requirements_tag: formData.requirements_json.additional_requirements_tag,
        requested_all: formData.requirements_json.requested_all,
        phone_message: formData.requirements_json.phone_message,
        scan_code: formData.requirements_json.scan_code,
        qq_number: formData.requirements_json.qq_number,
        phone_number: formData.requirements_json.phone_number,
        email: formData.requirements_json.email,
        additional_requirements: formData.requirements_json.additional_requirements
      }
    };
    
    try {
      const response = await fetch('/api/rental/requestRental/updateRequestRentalInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('更新后返回的数据', response);
      if (response.status !== 200) {
        throw new Error('保存失败');
      }
      
      const result = await response.json();
      message.success(result.message || '保存成功');
      // 跳转到不带edit参数的页面
      router.push(`/rental/my/myrelearrequestrentalinfo/detail/${id}?edit=0`);
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('保存失败');
    }
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    // 跳转到不带edit参数的页面
    router.push(`/rental/my/myrelearrequestrentalinfo/detail/${id}?edit=0`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-10">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!offerDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-10">
          <p className="text-gray-500">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-3xl mx-auto px-1">
      {/*
          <div className="py-2">
          <div className="bg-blue-50 border border-blue-200 p-2">
            <div className="text-blue-700 text-sm mb-1">填写抖音账号租赁的详细信息，保信息真实有效，账号无异常,及时响应</div>
            <div className="text-red-700 text-sm mb-1">风险提醒:涉及抖音平台规则，账号可能被平台封控，需要协助进行账号解封。</div>
          </div>
        </div>


      */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          {/* 页面标题 */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">求租详情</h1>
          </div>
          
          {/* 主要内容 */}
          {isEditMode ? (
            // 编辑模式
            <div className="space-y-3">
              {/* 标题输入 */}
              <div className="mb-1">
                <label htmlFor="title" className="block text-sm   mb-1">
                  求租信息标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="请输入求租标题"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/50 字</p>
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* 描述输入 */}
              <div className="mb-1">
                <label htmlFor="description" className="block text-sm   mb-1">
                  求租信息描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.requirements_json.account_requirements}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.account_requirements ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="填写抖音账号求租的详细信息，保信息真实有效，账号无异常,及时响应"
                  rows={4}
                  maxLength={150}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.requirements_json.account_requirements.length}/150 字</p>
                {errors.account_requirements && (
                  <p className="text-red-500 text-xs mt-1">{errors.account_requirements}</p>
                )}
              </div>

              {/* 预算金额 */}
              <div className="mb-1">
                <label htmlFor="budget_amount" className="block text-sm   mb-1">
                  预算金额 (元)/天 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="budget_amount"
                  name="budget_amount"
                  value={formData.budget_amount_yuan === 0 ? '' : formData.budget_amount_yuan}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.budget_amount_yuan ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="请输入预算金额"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.budget_amount_yuan && (
                  <p className="text-red-500 text-xs mt-1">{errors.budget_amount_yuan}</p>
                )}
              </div>

              {/* 需要天数 */}
              <div className="mb-1">
                <label htmlFor="days_needed" className="block text-sm   mb-1">
                  需要租赁天数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="days_needed"
                  name="days_needed"
                  value={formData.days_needed === 0 ? '' : formData.days_needed}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.days_needed ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="请输入需要天数"
                  min="1"
                  required
                />
                {errors.days_needed && (
                  <p className="text-red-500 text-xs mt-1">{errors.days_needed}</p>
                )}
              </div>

              {/* 截止时间 */}
              <div className="mb-1">
                <label htmlFor="deadline" className="block text-sm   mb-1">
                  截止时间 <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-2 border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  required
                />
                {errors.deadline && (
                  <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                )}
              </div>

              {/* 手机号 */}
              <div className="mb-1">
                <label htmlFor="phone_number" className="block text-sm   mb-1">
                  联系电话（选填）
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.requirements_json.phone_number}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="请输入手机号"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
                )}
              </div>
              
              {/* 邮箱 */}
              <div className="mb-1">
                <label htmlFor="email" className="block text-sm   mb-1">
                  邮箱（选填）
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.requirements_json.email}
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
                <label htmlFor="qq" className="block text-sm   mb-1">
                  QQ号码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="qq"
                  name="qq"
                  value={formData.requirements_json.qq_number}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border ${errors.qq ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                  placeholder="请输入QQ号码"
                  required
                />
                {errors.qq && (
                  <p className="text-red-500 text-xs mt-1">{errors.qq}</p>
                )}
              </div>
              
              {/* 账号要求 */}
              <div className="space-y-3">
                <label className="block text-sm  mb-2">账号要求</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.basic_information === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('basic_information')}
                  >
                    修改基本信息
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.deblocking === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('deblocking')}
                  >
                    账号解禁
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.other_requirements === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('other_requirements')}
                  >
                    实名认证
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.post_douyin === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('post_douyin')}
                  >
                    发布抖音
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.additional_requirements_tag === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('additional_requirements_tag')}
                  >
                    其他
                  </button>
                </div>
                <div className='text-sm text-gray-600'>选择的要求越多，匹配到合适账号的概率越大。</div>
              </div>
              
              {/* 其他要求 */}
              {formData.requirements_json.additional_requirements_tag === 'true' && (
                <div className="mb-1">
                  <label htmlFor="additional_requirements" className="block text-sm   mb-1">
                    其他要求（选填）
                  </label>
                  <textarea
                    id="additional_requirements"
                    name="additional_requirements"
                    value={formData.requirements_json.additional_requirements}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="请输入其他特殊要求"
                    rows={3}
                    maxLength={100}
                  />
                </div>
              )}
              
              {/* 登录方式 */}
              <div className="space-y-3 mt-3">
                <label className="block text-sm  mb-2">登录方式（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.scan_code === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300  hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('scan_code')}
                  >
                    扫码登录
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.phone_message === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300  hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('phone_message')}
                  >
                    短信验证
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.requested_all === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300  hover:bg-gray-300'}`}
                    onClick={() => handleTagClick('requested_all')}
                  >
                    按租赁方要求
                  </button>
                </div>
                <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高匹配概率。</div>
              </div>
            </div>
          ) : (
            // 查看模式
            <div className="space-y-1">
              {/* 基本信息 */}
              <div className="space-y-1">
                <div className="text-lg font-bold">
                  <span className=" mr-2">标题:</span>
                  <span>{formData.title || '未设置'}</span>
                </div>
                <div className="">
                  <span className="text-sm  mr-2">金额:</span>
                  <span>{formData.budget_amount_yuan || '未设置'} 元/天</span>
                </div>
                <div className="">
                  <span className="text-sm  mr-2">需要租赁天数:</span>
                  <span>{formData.days_needed || '未设置'} 天</span>
                </div>
                <div className="">
                  <span className="text-sm  mr-2">截止时间:</span>
                  <span>{formData.deadline ? new Date(formData.deadline * 1000).toLocaleDateString() : '未设置'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold mb-1">信息描述:</span>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p>{formData.requirements_json.account_requirements || '未设置'}</p>
                  </div>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">联系方式:</h3>
                <div className="">
                  <span className="text-sm mr-2">手机号:</span>
                  <span>{formData.requirements_json.phone_number || '未设置'}</span>
                </div>
                <div className="">
                  <span className="text-sm mr-2">QQ号:</span>
                  <span>{formData.requirements_json.qq_number || '未设置'}</span>
                </div>
                <div className="">
                  <span className="text-sm mr-2">邮箱:</span>
                  <span>{formData.requirements_json.email || '未设置'}</span>
                </div>
              </div>

              {/* 账号要求 */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">账号要求:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements_json.basic_information === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">修改基本信息</span>
                  )}
                  {formData.requirements_json.deblocking === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">账号解禁</span>
                  )}
                  {formData.requirements_json.other_requirements === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">实名认证</span>
                  )}
                  {formData.requirements_json.post_douyin === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">发布抖音</span>
                  )}
                  {formData.requirements_json.additional_requirements_tag === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">其他</span>
                  )}
                  {formData.requirements_json.additional_requirements && (
                    <div className="w-full mt-2">
                      <span className="text-lg font-bold mb-1">其他要求:</span>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p>{formData.requirements_json.additional_requirements}</p>
                      </div>
                    </div>
                  )}
                  {!formData.requirements_json.basic_information && !formData.requirements_json.deblocking && !formData.requirements_json.other_requirements && 
                   !formData.requirements_json.post_douyin && !formData.requirements_json.additional_requirements_tag && (
                    <span className="text-sm text-gray-500">暂无账号要求选项</span>
                  )}
                </div>
              </div>

              {/* 登录方式 */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">登录方式:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements_json.scan_code === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">扫码登录</span>
                  )}
                  {formData.requirements_json.phone_message === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">短信验证</span>
                  )}
                  {formData.requirements_json.requested_all === 'true' && (
                    <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">按租赁方要求</span>
                  )}
                  {!formData.requirements_json.scan_code && !formData.requirements_json.phone_message && !formData.requirements_json.requested_all && (
                    <span className="text-sm text-gray-500">暂无登录方式选项</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mb-1">
            {isEditMode ? (
              // 编辑模式下的按钮
              <>
                <button
                  type="button"
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={handleCancelEdit}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 "
                  onClick={handleSaveEdit}
                >
                  更新求租信息
                </button>
              </>
            ) : (
              // 查看模式下的按钮
              <>
                <button
                  type="button"
                  className="px-6 py-2.5 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200 "
                  onClick={() => router.push(`/rental/my/myrelearrequestrentalinfo/detail/${id}?edit=1`)}
                >
                  编辑
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestDetailPage;