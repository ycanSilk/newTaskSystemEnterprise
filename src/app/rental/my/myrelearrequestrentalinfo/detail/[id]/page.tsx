'use client'
import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

// 租赁请求详情接口定义
interface RentalRequestDetailResponse {
  id: string;
  userId: string;
  platform: string;
  accountType: string;
  expectedPricePerDay: string;
  budgetDeposit?: string;
  depositAmount?: string;
  expectedLeaseDays: string;
  description: string;
  status: string;
  createTime: string;
  createdAt?: string;
  updatedAt?: string;
  // 联系方式字段
  contactPhone?: string;
  contactQQ?: string;
  contactEmail?: string;
  // 账号支持相关布尔值字段
  supportModifyName: boolean;
  supportModifyAvatar: boolean;
  supportModifyBio: boolean;
  supportPublishComment: boolean;
  supportPublishVideo: boolean;
  supportUnblockAccount: boolean;
  // 登录方式相关布尔值字段
  loginByScan: boolean;
  loginByPhoneSMS: boolean;
  noLoginRequired: boolean;
}

const RentalRequestDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || '';
  const [loading, setLoading] = useState(false);
  const [offerDetail, setOfferDetail] = useState<RentalRequestDetailResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 表单数据状态
  const [formData, setFormData] = useState<RentalRequestDetailResponse>({
    id: '',
    userId: '',
    platform: '',
    accountType: '',
    expectedPricePerDay: '',
    budgetDeposit: '',
    depositAmount: '',
    expectedLeaseDays: '',
    description: '',
    status: '',
    createTime: '',
    // 联系方式相关字段
    contactPhone: '',
    contactQQ: '',
    contactEmail: '',
    // 账号支持相关字段
    supportModifyName: false,
    supportModifyAvatar: false,
    supportModifyBio: false,
    supportPublishComment: false,
    supportPublishVideo: false,
    supportUnblockAccount: false,
    // 登录方式相关字段
    loginByScan: false,
    loginByPhoneSMS: false,
    noLoginRequired: false
  });
  
  // 模态框状态
  const [isOffShelfModalVisible, setIsOffShelfModalVisible] = useState(false);

  // 加载数据
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/rental/getrequestinfodetail?rentRequestId=${id}`, {
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
        
        // 解析description字段，提取账号支持和登录方式信息
        const enhancedData = extractInfoFromDescription(apiData);
        
        // 确保所有字段都被正确设置，包括布尔值字段和类型转换
        // 平台类型映射：将字符串转换为数字
        const platformMap: Record<string, string> = {
          'DOUYIN': '抖音',
          'KUAI_SHOU': '快手',
          'XIAOHONGSHU': '小红书'
        };
        
        const finalData: RentalRequestDetailResponse = {
          // 基础字段，确保类型正确
          id: apiData.id || '',
          userId: apiData.userId || '',
          platform: typeof apiData.platform === 'string' ? (platformMap[apiData.platform] || '') : '',
          accountType: String(apiData.accountType || ''),
          expectedPricePerDay: String(apiData.expectedPricePerDay || ''),
          budgetDeposit: apiData.budgetDeposit ? String(apiData.budgetDeposit) : '',
          depositAmount: apiData.depositAmount ? String(apiData.depositAmount) : '',
          expectedLeaseDays: String(apiData.expectedLeaseDays || ''),
          description: String(apiData.description || ''),
          status: String(apiData.status || ''),
          createTime: String(apiData.createTime || ''),
          createdAt: apiData.createdAt ? String(apiData.createdAt) : undefined,
          updatedAt: apiData.updatedAt ? String(apiData.updatedAt) : undefined,
          
          // 布尔值字段，确保有明确的值
          supportModifyName: !!enhancedData.supportModifyName,
          supportModifyAvatar: !!enhancedData.supportModifyAvatar,
          supportModifyBio: !!enhancedData.supportModifyBio,
          supportPublishComment: !!enhancedData.supportPublishComment,
          supportPublishVideo: !!enhancedData.supportPublishVideo,
          supportUnblockAccount: !!enhancedData.supportUnblockAccount,
          loginByScan: !!enhancedData.loginByScan,
          loginByPhoneSMS: !!enhancedData.loginByPhoneSMS,
          noLoginRequired: !!enhancedData.noLoginRequired,
          
          // 联系方式字段，从enhancedData中获取
          contactPhone: enhancedData.contactPhone || '',
          contactQQ: enhancedData.contactQQ || '',
          contactEmail: enhancedData.contactEmail || ''
        };
        console.log('API原始数据:', apiData);
        console.log('增强后数据:', enhancedData);
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
  
  // 从description字段提取账号支持和登录方式信息
  const extractInfoFromDescription = (data: any): RentalRequestDetailResponse => {
    const description = data.description || '';
    const enhancedData: Partial<RentalRequestDetailResponse> = {};
    
    // 初始化所有布尔值字段为false
    enhancedData.supportModifyName = false;
    enhancedData.supportModifyAvatar = false;
    enhancedData.supportModifyBio = false;
    enhancedData.supportPublishComment = false;
    enhancedData.supportPublishVideo = false;
    enhancedData.supportUnblockAccount = false;
    enhancedData.loginByScan = false;
    enhancedData.loginByPhoneSMS = false;
    enhancedData.noLoginRequired = false;
    
    // 从description中提取联系方式信息
    // 提取手机号
    const phoneRegex = /手机号[:：]\s*(1[3-9]\d{9})/;
    const phoneMatch = description.match(phoneRegex);
    if (phoneMatch && phoneMatch[1]) {
      enhancedData.contactPhone = phoneMatch[1];
    }
    
    // 提取QQ号
    const qqRegex = /QQ号[:：]\s*([1-9]\d{4,14})/;
    const qqMatch = description.match(qqRegex);
    if (qqMatch && qqMatch[1]) {
      enhancedData.contactQQ = qqMatch[1];
    }
    
    // 提取邮箱
    const emailRegex = /邮箱[:：]\s*([^\s@]+@[^\s@]+\.[^\s@]+)/;
    const emailMatch = description.match(emailRegex);
    if (emailMatch && emailMatch[1]) {
      enhancedData.contactEmail = emailMatch[1];
    }
    
    // 账号支持关键词匹配规则
    if (description.includes('修改抖音账号名称和头像') || description.includes('修改账号名称')) {
      enhancedData.supportModifyName = true;
    }
    if (description.includes('修改抖音账号名称和头像') || description.includes('修改头像')) {
      enhancedData.supportModifyAvatar = true;
    }
    if (description.includes('修改账号简介')) {
      enhancedData.supportModifyBio = true;
    }
    if (description.includes('支持发布评论')) {
      enhancedData.supportPublishComment = true;
    }
    if (description.includes('支持发布视频')) {
      enhancedData.supportPublishVideo = true;
    }
    if (description.includes('支持账号解封')) {
      enhancedData.supportUnblockAccount = true;
    }
    
    // 登录方式关键词匹配规则
    if (description.includes('扫码登录')) {
      enhancedData.loginByScan = true;
    }
    if (description.includes('手机号+短信验证登录') || description.includes('短信')) {
      enhancedData.loginByPhoneSMS = true;
    }
    if (description.includes('不登录账号，按照承租方要求完成租赁') || description.includes('不登录')) {
      enhancedData.noLoginRequired = true;
    }
    
    return enhancedData as RentalRequestDetailResponse;
  };

  // 表单验证函数
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 平台类型不能为空
    if (!formData.platform) {
      newErrors.platform = '平台类型不能为空';
    }
    
    // 账号类型不能为空
    if (!formData.accountType?.trim()) {
      newErrors.accountType = '账号类型不能为空';
    }
    
    // 期望日租金验证
    if (!formData.expectedPricePerDay?.trim()) {
      newErrors.expectedPricePerDay = '期望日租金不能为空';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.expectedPricePerDay)) {
      newErrors.expectedPricePerDay = '请输入有效的价格，最多两位小数';
    }
    
    // 期望租赁天数验证
    if (!formData.expectedLeaseDays?.trim()) {
      newErrors.expectedLeaseDays = '期望租赁天数不能为空';
    }
    
    // 描述验证
    if (!formData.description?.trim()) {
      newErrors.description = '描述不能为空';
    } else if (formData.description.length < 10) {
      newErrors.description = '描述至少需要10个字符';
    }
    
    // 联系方式验证 - 设为非必填项，仅在输入值时进行验证
    validateContactInfo(formData.contactPhone || '', 'contactPhone', newErrors);
    validateContactInfo(formData.contactQQ || '', 'contactQQ', newErrors);
    validateContactInfo(formData.contactEmail || '', 'contactEmail', newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 联系方式验证函数
  const validateContactInfo = (value: string, field: string, errorObject: Record<string, string>) => {
    // 非必填项，仅当有值时进行格式验证
    if (!value || !value.trim()) return;
    
    // 手机号验证
    if (field === 'contactPhone') {
      if (!/^1[3-9]\d{9}$/.test(value.trim())) {
        errorObject.contactPhone = '请输入有效的手机号';
      }
    }
    // QQ号验证
    else if (field === 'contactQQ') {
      if (!/^[1-9]\d{4,14}$/.test(value.trim())) {
        errorObject.contactQQ = '请输入有效的QQ号';
      }
    }
    // 邮箱验证
    else if (field === 'contactEmail') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        errorObject.contactEmail = '请输入有效的邮箱地址';
      }
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // 准备提交数据，将布尔值字段转换为描述文本
    const submitData = {
      ...formData,
      description: generateDescriptionFromBooleans(formData)
    };
    
    try {
      const response = await fetch(`/api/rental-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      message.success('保存成功');
      setIsEditing(false);
      // 重新加载数据
      const updatedData: RentalRequestDetailResponse = await response.json();
      setOfferDetail(updatedData);
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('保存失败');
    }
  };
  
  // 从布尔值字段生成描述文本
  const generateDescriptionFromBooleans = (data: RentalRequestDetailResponse): string => {
    let description = '';
    
    // 添加账号支持相关描述
    if (data.supportModifyName) description += '修改账号名称\n';
    if (data.supportModifyAvatar) description += '修改账号头像\n';
    if (data.supportModifyBio) description += '修改账号简介\n';
    if (data.supportPublishComment) description += '支持发布评论\n';
    if (data.supportPublishVideo) description += '支持发布视频\n';
    if (data.supportUnblockAccount) description += '支持账号解封\n';
    
    // 添加登录方式相关描述
    if (data.loginByScan) description += '扫描登录\n';
    if (data.loginByPhoneSMS) description += '手机短信登录\n';
    if (data.noLoginRequired) description += '无登录\n';
    
    return description;
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    // 恢复原始数据
      if (offerDetail) {
        setFormData({
          ...offerDetail,
          contactPhone: offerDetail.contactPhone || '',
          contactQQ: offerDetail.contactQQ || '',
          contactEmail: offerDetail.contactEmail || ''
        });
      }
    setErrors({});
  };

  // 处理下架
  const handleOffShelf = () => {
    setIsOffShelfModalVisible(true);
  };

  // 确认下架
  const confirmOffShelf = async () => {
    try {
      const response = await fetch(`/api/rental-requests/${id}/off-shelf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('下架失败');
      }
      
      message.success('下架成功');
      setIsOffShelfModalVisible(false);
      // 重新加载数据
      const updatedData: RentalRequestDetailResponse = await response.json();
      setOfferDetail(updatedData);
    } catch (error) {
      console.error('Error off-shelf:', error);
      message.error('下架失败');
    }
  };

  // 取消下架
  const cancelOffShelf = () => {
    setIsOffShelfModalVisible(false);
  };

  // 渲染登录方式显示
  const renderLoginMethod = (method: string) => {
    switch (method) {
      case 'scan':
        return '扫码登录';
      case 'phone_sms':
        return '手机号+短信验证登录';
      case 'no_login':
        return '不登录账号，按照承租方要求完成租赁';
      default:
        return method;
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 页面标题 */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">求租详情</h1>
          </div>
          
          {/* 主要内容 */}
          <div className="p-6">
            {isEditing ? (
              // 编辑模式
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h2 className="text-lg font-medium mb-4">基本信息</h2>
                  
                  {/* 平台类型 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">平台类型 <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.platform ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入平台类型"
                    />
                    {errors.platform && (
                      <p className="mt-1 text-sm text-red-500">{errors.platform}</p>
                    )}
                  </div>
                  
                  {/* 账号类型 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">账号类型 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="accountType"
                      value={formData.accountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.accountType ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入账号类型"
                    />
                    {errors.accountType && (
                      <p className="mt-1 text-sm text-red-500">{errors.accountType}</p>
                    )}
                  </div>
                  
                  {/* 期望日租金 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">日租金（元/天） <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="expectedPricePerDay"
                      value={formData.expectedPricePerDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedPricePerDay: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.expectedPricePerDay ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入期望日租金"
                    />
                    {errors.expectedPricePerDay && (
                      <p className="mt-1 text-sm text-red-500">{errors.expectedPricePerDay}</p>
                    )}
                  </div>
                  
                  {/* 预算押金 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">押金（元）</label>
                    <input
                      type="text"
                      name="budgetDeposit"
                      value={formData.budgetDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetDeposit: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md h-10 border-gray-300"
                      placeholder="请输入预算押金"
                    />
                  </div>
                  
                  {/* 期望租赁天数 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">期望租赁天数 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="expectedLeaseDays"
                      value={formData.expectedLeaseDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedLeaseDays: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.expectedLeaseDays ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入期望租赁天数"
                    />
                    {errors.expectedLeaseDays && (
                      <p className="mt-1 text-sm text-red-500">{errors.expectedLeaseDays}</p>
                    )}
                  </div>
                  
                  {/* 描述 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">描述 <span className="text-red-500">*</span></label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'} h-40`}
                      placeholder="请输入求租要求"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
                
                {/* 联系方式 - 设为非必填项 */}
                <div>
                  <h2 className="text-lg font-medium mb-4">联系方式（选填）</h2>
                  
                  {/* 手机号 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">手机号</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入手机号（选填）"
                    />
                    {errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactPhone}</p>
                    )}
                  </div>
                  
                  {/* QQ号 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">QQ号</label>
                    <input
                      type="text"
                      name="contactQQ"
                      value={formData.contactQQ}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactQQ: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.contactQQ ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入QQ号（选填）"
                    />
                    {errors.contactQQ && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactQQ}</p>
                    )}
                  </div>
                  
                  {/* 邮箱 */}
                  <div className="mb-4">
                    <label className="block text-sm  mb-1">邮箱</label>
                    <input
                      type="text"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md h-10 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入邮箱（选填）"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>
                    )}
                  </div>
                </div>
                
                {/* 账号支持 - 编辑模式 */}
                <div>
                  <h2 className="text-lg font-medium mb-4">账号支持</h2>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportModifyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportModifyName: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>修改账号名称</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportModifyAvatar}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportModifyAvatar: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>修改账号头像</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportModifyBio}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportModifyBio: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>修改账号简介</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportPublishComment}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportPublishComment: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>支持发布评论</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportPublishVideo}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportPublishVideo: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>支持发布视频</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.supportUnblockAccount}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportUnblockAccount: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>支持账号解封</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* 登录方式 - 编辑模式 */}
                <div>
                  <h2 className="text-lg font-medium mb-4">登录方式</h2>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.loginByScan}
                          onChange={(e) => setFormData(prev => ({ ...prev, loginByScan: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>扫描登录</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.loginByPhoneSMS}
                          onChange={(e) => setFormData(prev => ({ ...prev, loginByPhoneSMS: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>手机短信登录</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.noLoginRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, noLoginRequired: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span>无登录</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                // 查看模式
                <div className="space-y-6">
                  {/* 基本信息 */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">基本信息</h2>
                    <div className="space-y-3">
                       <div>
                         <span className="">平台类型: </span>
                         <span>{formData.platform}</span>
                       </div>
                       <div>
                         <span className="">账号类型: </span>
                         <span>{formData.accountType || '未设置'}</span>
                       </div>
                       <div>
                         <span className="">期望日租金: </span>
                         <span>{formData.expectedPricePerDay || '未设置'} 元/天</span>
                       </div>
                       <div>
                         <span className="">预算押金: </span>
                         <span>{formData.budgetDeposit || '未设置'} 元</span>
                       </div>
                       <div>
                         <span className="">期望租赁天数: </span>
                         <span>{formData.expectedLeaseDays || '未设置'}</span>
                       </div>
                      <div>
                        <span className=" block mb-1">信息描述: </span>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-900">
                          <p>{formData.description || '未设置'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 联系方式 - 查看模式下显示 */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">联系方式</h2>
                    <div className="space-y-3">
                      <div>
                        <span className="">手机号: </span>
                        <span>{formData.contactPhone || '未设置'}</span>
                      </div>
                      <div>
                        <span className="">QQ号: </span>
                        <span>{formData.contactQQ || '未设置'}</span>
                      </div>
                      <div>
                        <span className="">邮箱: </span>
                        <span>{formData.contactEmail || '未设置'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 账号支持 - 修改为根据布尔值字段显示 */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">账号支持</h2>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>修改账号名称</span>
                          <span className={formData.supportModifyName ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportModifyName ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>修改账号头像</span>
                          <span className={formData.supportModifyAvatar ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportModifyAvatar ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>修改账号简介</span>
                          <span className={formData.supportModifyBio ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportModifyBio ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>支持发布评论</span>
                          <span className={formData.supportPublishComment ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportPublishComment ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>支持发布视频</span>
                          <span className={formData.supportPublishVideo ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportPublishVideo ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>支持账号解封</span>
                          <span className={formData.supportUnblockAccount ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.supportUnblockAccount ? '√' : '×'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 登录方式 - 修改为根据布尔值字段显示 */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">登录方式</h2>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>扫描登录</span>
                          <span className={formData.loginByScan ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.loginByScan ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>手机短信登录</span>
                          <span className={formData.loginByPhoneSMS ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.loginByPhoneSMS ? '√' : '×'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>无登录</span>
                          <span className={formData.noLoginRequired ? 'text-green-500 font-bold px-2 border border-green-500' : 'text-red-500 font-bold px-2 border border-red-500'}>
                            {formData.noLoginRequired ? '√' : '×'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
          
          {/* 底部操作按钮 */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-center space-x-4">
            {isEditing ? (
              // 编辑模式下的按钮
              <>
                <Button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  保存
                </Button>
              </>
            ) : (
              // 查看模式下的按钮 - 移除状态限制，始终显示编辑和下架按钮
              <>
                <Button
                  onClick={handleStartEdit}
                  icon={<EditOutlined />}
                  className="px-6 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  编辑
                </Button>
                <Button
                  onClick={handleOffShelf}
                  icon={<DeleteOutlined />}
                  className="px-6 py-2 bg-red-600 text-white hover:bg-red-700"
                >
                  下架
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 下架确认弹窗 */}
      <Modal
        title="确认下架"
        open={isOffShelfModalVisible}
        onOk={confirmOffShelf}
        onCancel={cancelOffShelf}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p className="flex items-center">
          <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
          确定要下架该求租信息吗？下架后将不再展示。
        </p>
      </Modal>
    </div>
  );
};

export default RentalRequestDetailPage;