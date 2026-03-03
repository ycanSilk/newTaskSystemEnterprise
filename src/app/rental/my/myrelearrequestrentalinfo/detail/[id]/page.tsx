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
    post_ad: string;
    account_password: string;
    phone_number: string;

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
      account_password: 'false',
      account_requirements: '',
      basic_information: 'false',
      other_requirements: 'false',
      deblocking: 'false',
      post_douyin: 'false',
      additional_requirements_tag: 'false',
      requested_all: 'false',
      phone_message: 'false',
      scan_code: 'false',
      phone_number: '',
      post_ad: 'false',
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
        
        // 确保所有字段都被正确设置，包括布尔值字段
        const finalData: RentalRequestDetailResponse = {
          id: apiData.id || '',
          userId: apiData.userId || '',
          title: apiData.title || '',
          budget_amount_yuan: apiData.budget_amount_yuan || 0,
          days_needed: apiData.days_needed || 1,
          deadline: apiData.deadline || 0,
          requirements_json: {
            account_password: apiData.requirements_json?.account_password ? 'true' : 'false',
            account_requirements: apiData.requirements_json?.account_requirements || '',
            basic_information: apiData.requirements_json?.basic_information ? 'true' : 'false',
            other_requirements: apiData.requirements_json?.other_requirements ? 'true' : 'false',
            deblocking: apiData.requirements_json?.deblocking ? 'true' : 'false',
            post_douyin: apiData.requirements_json?.post_douyin ? 'true' : 'false',
            additional_requirements_tag: apiData.requirements_json?.additional_requirements_tag ? 'true' : 'false',
            requested_all: apiData.requirements_json?.requested_all ? 'true' : 'false',
            phone_message: apiData.requirements_json?.phone_message ? 'true' : 'false',
            scan_code: apiData.requirements_json?.scan_code ? 'true' : 'false',
            phone_number: apiData.requirements_json?.phone_number || '',
            post_ad: apiData.requirements_json?.post_ad ? 'true' : 'false',
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
    // 手机号验证（选填）
    if (formData.requirements_json.phone_number?.trim() && !/^1[3-9]\d{9}$/.test(formData.requirements_json.phone_number)) {
      newErrors.phone_number = '请输入有效的手机号';
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
        phone_number: formData.requirements_json.phone_number,
        post_ad: formData.requirements_json.post_ad,
        account_password: formData.requirements_json.account_password,

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
    <div className="min-h-screen bg-gray-50 mt-5 mb-10">
      <div className="px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 p-2">
              <div className="text-blue-700 text-sm mb-1">填写抖音账号求租的详细信息，保信息真实有效，账号无异常,及时响应</div>
              <div className="text-red-700 text-sm mb-1">风险提醒:涉及抖音平台规则，账号可能被平台封控，需要协助进行账号解封。</div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="px-4 py-2">
        {/* 表单内容 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-5 px-3">
          {/* 页面标题 */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">求租详情</h1>
          </div>
          
          {/* 主要内容 */}
          {isEditMode ? (
            // 编辑模式
            <div className="space-y-3">
              {/* 标题输入 */}
              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  求租信息标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="请输入求租标题"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-gray-500">{formData.title.length}/50 字</p>
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>

              {/* 描述输入 */}
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  求租信息描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.requirements_json.account_requirements}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.account_requirements ? 'border-red-500' : ''}`}
                  placeholder="填写抖音账号求租的详细信息，保信息真实有效，账号无异常,及时响应"
                  style={{ height: 100, width: '100%' }}
                  maxLength={150}
                  required
                />
                <p className="text-xs text-gray-500">{formData.requirements_json.account_requirements.length}/150 字</p>
                {errors.account_requirements && (
                  <p className="text-red-500 text-sm">{errors.account_requirements}</p>
                )}
              </div>

              {/* 预算金额 */}
              <div className="space-y-1">
                <label htmlFor="budget_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  预算金额 (元)/天 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="budget_amount"
                  name="budget_amount"
                  value={formData.budget_amount_yuan === 0 ? '' : formData.budget_amount_yuan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.budget_amount_yuan ? 'border-red-500' : ''}`}
                  placeholder="请输入预算金额"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.budget_amount_yuan && (
                  <p className="text-red-500 text-sm">{errors.budget_amount_yuan}</p>
                )}
              </div>

              {/* 需要天数 */}
              <div className="space-y-1">
                <label htmlFor="days_needed" className="block text-sm font-medium text-gray-700 mb-1">
                  需要租赁天数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="days_needed"
                  name="days_needed"
                  value={formData.days_needed === 0 ? '' : formData.days_needed}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.days_needed ? 'border-red-500' : ''}`}
                  placeholder="请输入需要天数"
                  min="1"
                  required
                />
                {errors.days_needed && (
                  <p className="text-red-500 text-sm">{errors.days_needed}</p>
                )}
              </div>

              {/* 截止时间 */}
              <div className="space-y-1">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.deadline ? 'border-red-500' : ''}`}
                  required
                />
                {errors.deadline && (
                  <p className="text-red-500 text-sm">{errors.deadline}</p>
                )}
              </div>

              {/* 手机号 */}
              <div className="space-y-1">
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  联系电话（选填）
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.requirements_json.phone_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.phone_number ? 'border-red-500' : ''}`}
                  placeholder="请输入手机号"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">{errors.phone_number}</p>
                )}
              </div>
    
              
              {/* 账号要求 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  账号要求 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
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
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.other_requirements === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('other_requirements')}
                  >
                    实名认证
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.post_douyin === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('post_douyin')}
                  >
                    发布抖音
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.post_ad === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('post_ad')}
                  >
                    发布广告
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.additional_requirements_tag === 'true' ? 'bg-blue-100 text-blue-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('additional_requirements_tag')}
                  >
                    其他
                  </button>
                </div>
                <div className='text-sm text-gray-600'>选择的要求越多，匹配到合适账号的概率越大。</div>
              </div>
          
              {/* 登录方式 */}
              <div className="space-y-3 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  登录方式（可多选） <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.scan_code === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('scan_code')}
                  >
                    扫码登录
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.phone_message === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('phone_message')}
                  >
                    短信验证
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.account_password === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('account_password')}
                  >
                    账号密码
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.requirements_json.requested_all === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-300 hover:bg-gray-200'}`}
                    onClick={() => handleTagClick('requested_all')}
                  >
                    不登录，按承租方需求修改账户相关方要求
                  </button>
                </div>
                <div className='text-sm text-gray-600'>请至少选择一种登录方式。支持多种登录方式可以提高匹配概率。</div>
              </div>
            </div>
          ) : (
            // 查看模式
            <div className="space-y-1 mb-1">  
              <div className="space-y-1">
                {/* 求租信息标题 */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    求租信息标题
                  </label>
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    {formData.title || '未设置'}
                  </div>
                </div>
                
                {/* 求租信息描述 */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    求租信息描述
                  </label>
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    {formData.requirements_json.account_requirements || '未设置'}
                  </div>
                </div>
              </div>
              
              {/* 商品信息 */}
              <div className="space-y-1 mb-10">
                <div className="space-y-1">
                  {/* 预算金额 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      预算金额 (元)/天
                    </label>
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                      {formData.budget_amount_yuan || '未设置'} 元/天
                    </div>
                  </div>
                  
                  {/* 需要租赁天数 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      需要租赁天数 (天)
                    </label>
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                      {formData.days_needed || '未设置'} 天
                    </div>
                  </div>
                  
                  {/* 截止时间 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      截止时间
                    </label>
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                      {formData.deadline ? new Date(formData.deadline * 1000).toLocaleDateString() : '未设置'}
                    </div>
                  </div>
                </div>
                
                {/* 账号要求 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    账号要求
                  </label>
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
                    {formData.requirements_json.post_ad === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">发布广告</span>
                    )}
                    {formData.requirements_json.additional_requirements_tag === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800">其他</span>
                    )}
                    {!formData.requirements_json.basic_information && !formData.requirements_json.deblocking && !formData.requirements_json.other_requirements && 
                     !formData.requirements_json.post_douyin && !formData.requirements_json.post_ad && !formData.requirements_json.additional_requirements_tag && (
                      <span className="text-sm text-gray-500">暂无账号要求选项</span>
                    )}
                  </div>
                </div>
                
                {/* 登录方式 */}
                <div className="space-y-3 mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    登录方式
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements_json.scan_code === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">扫码登录</span>
                    )}
                    {formData.requirements_json.phone_message === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">短信验证</span>
                    )}
                    {formData.requirements_json.account_password === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">账号密码</span>
                    )}
                    {formData.requirements_json.requested_all === 'true' && (
                      <span className="px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">按租赁方要求</span>
                    )}
                    {!formData.requirements_json.scan_code && !formData.requirements_json.phone_message && !formData.requirements_json.account_password && !formData.requirements_json.requested_all && (
                      <span className="text-sm text-gray-500">暂无登录方式选项</span>
                    )}
                  </div>
                </div>
                
                {/* 联系方式 */}
                <div className="space-y-1 mt-3">
                  {/* 手机号 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      联系电话
                    </label>
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                      {formData.requirements_json.phone_number || '未设置'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="mt-3 flex justify-center space-x-3">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
              onClick={handleCancelEdit}
            >
              取消
            </button>
            {!isEditMode && (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => router.push(`/rental/my/myrelearrequestrentalinfo/detail/${id}?edit=1`)}
              >
                编辑
              </button>
            )}
            {isEditMode && (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={handleSaveEdit}
              >
                更新求租信息
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestDetailPage;