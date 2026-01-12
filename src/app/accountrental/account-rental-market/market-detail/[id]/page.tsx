'use client';

import { useState, useEffect } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// 定义租赁信息数据类型，符合后端API返回格式
export interface LeaseInfo {
  id: string;
  userId: string;
  accountType: string;
  accountLevel: string;
  platform: string;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  status: string;
  totalOrders: number;
  completedOrders: number;
  successRate: number;
  createTime: string;
  image?: string;
  images?: string[];
}

export interface CreateLeaseOrderResponseData {
  id: string;
  userId: string;
  leaseInfoId: string;
  lessorId: string;
  renterId: string;
  orderNo: string;
}

// 定义API响应数据类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

// 调用后端API获取租赁信息详情
const fetchLeaseInfoDetail = async (leaseInfoId: string): Promise<LeaseInfo> => {
  try {
    // 调用本地API路由，将leaseInfoId通过headers传递给后端
    console.log('正在发送请求，leaseInfoId通过headers传递:', leaseInfoId);
    const response = await fetch(`/api/rental/getleaseinfodetail?leaseInfoId=${leaseInfoId}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('这是获取租赁信息详情的日志输出:', response.status);
    console.log('请求url:', `/api/rental/getleaseinfodetail?leaseInfoId=${leaseInfoId}`);
    console.log(await response.clone().json());
    // 首先检查响应是否成功
    if (!response.ok) {
      // 尝试解析错误响应内容
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // 如果无法解析JSON，则使用HTTP状态码作为错误信息
        throw new Error(`API请求失败: HTTP ${response.status}`);
      }
      // 如果错误响应包含message，则使用它
      throw new Error(`API请求失败: ${errorData.message || `HTTP ${response.status}`}`);
    }

    // 成功时解析并返回数据
    const result: ApiResponse<LeaseInfo> = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取租赁信息详情失败:', error);
    // 重新抛出错误，保持原有的错误处理流程
    throw error;
  }
}


// 客户端组件
const AccountDetailPage = ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  const { id } = params;
  const leaseInfoId = id || '';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [leaseInfo, setLeaseInfo] = useState<LeaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [password, setpassword] = useState('');
  const [orderId, setOrderId] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Toast提示框状态
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'loading'>('success');
  const [toastMessage, setToastMessage] = useState('');
  
  // 显示Toast提示
  const showToast = (type: 'success' | 'error' | 'loading', message: string, duration: number = 2000) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
    
    // 自动隐藏
    setTimeout(() => {
      setToastVisible(false);
    }, duration);
  };
  const [leaseDays, setLeaseDays] = useState<number>(0);
  
  // 当leaseInfo加载完成后，可以根据需要设置默认租赁天数，但允许用户修改为0
  useEffect(() => {
    if (leaseInfo && leaseInfo.minLeaseDays) {
      // 保持默认值为最小租赁天数，但用户可以修改为0
      setLeaseDays(leaseInfo.minLeaseDays);
    }
  }, [leaseInfo?.minLeaseDays]);
  // 创建租赁订单
  const createLeaseOrder = async (leaseInfoId: string, leaseDays: number) => {
    try {
      const response = await fetch('/api/rental/creatleaseorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leaseInfoId,
          leaseDays
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建订单失败');
      }
      
      const data = await response.json();
      console.log('创建订单API响应:', data.data.orderNo);
      return data;
    } catch (error) {
      console.error('创建租赁订单失败:', error);
      throw error;
    }
  };


   // 支付租赁订单
  const payLeaseOrder = async (orderId: CreateLeaseOrderResponseData["id"]): Promise<ApiResponse<unknown>> => {
    try {
      
      const response = await fetch(`/api/rental/paymentleaseorder?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('正在发送支付请求，orderId:', orderId);
      console.log('到这一步可以确定传递的orderId是正确的。并且支付订单API响应状态:', response.status);
      console.log('支付订单API响应内容:', await response.clone().json());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '支付失败');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('支付租赁订单失败:', error);
      throw error;
    }
  };
 

  // 处理立即租赁
  const handleRentNow = async () => {
    if (!leaseInfo || apiLoading) return;
    
    try {
      setApiLoading(true);
      setApiError('');
      
      console.log('开始创建租赁订单，租期:', leaseDays);
      // 创建租赁订单，使用用户选择的租期
      const result = await createLeaseOrder(leaseInfo.id, leaseDays);
      
      console.log('创建订单API响应:', result);
      
      // 根据API返回的数据结构，订单ID是id字段
      let orderId = null;
      if (result && result.success && result.data && result.data.id) {
        orderId = result.data.id;
        console.log('获取到订单ID:', orderId);
        // 保存订单ID
        setOrderId(orderId);
        // 显示支付密码模态框
        console.log('设置显示支付模态框为true');
        setShowPaymentModal(true);
      } else {
        // 更宽容地处理可能的不同响应格式
        if (result && result.data && result.data.id) {
          // 如果找不到orderNo但有id，使用id作为后备
          orderId = result.data.id;
          console.log('使用id作为后备订单ID:', orderId);
          setOrderId(orderId);
          setShowPaymentModal(true);
        } else {
          throw new Error(result?.message || '创建订单失败，未找到订单ID');
        }
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      setApiError(error instanceof Error ? error.message : '创建订单失败，请稍后重试');
    } finally {
      setApiLoading(false);
    }
  };

  // 处理取消支付
  const handleCancelPayment = () => {
    setShowPaymentModal(false);
    setpassword('');
    setOrderId('');
    // 取消后跳转到租赁订单页面
    window.location.href = '/accountrental/my-account-rental/myrentedorder';
  };

  // 处理确认支付
  const handleConfirmPayment = async () => {
    if (!orderId || password.length !== 6 || apiLoading) return;
    
    try {
      setApiLoading(true);
      setApiError('');
      
      // 1. 首先显示验证中提示
      showToast('loading', '验证支付密码中...', 0);
      
      // 2. 验证支付密码
      const validateResponse = await fetch(`/api/walletmanagement/verificationpwd?password=${password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const validateData = await validateResponse.json();
      
      if (!validateResponse.ok || !validateData.success) {
        showToast('error', validateData.message || '支付密码验证失败');
        throw new Error(validateData.message || '支付密码验证失败');
      }
      
      // 3. 密码验证成功，显示支付中提示
      showToast('loading', '支付处理中...', 0);
      
      // 4. 支付订单
      const result: ApiResponse<unknown> = await payLeaseOrder(orderId);

      console.log('支付订单API响应:', result);
      // 检查是否成功
      if (result.success) {
        // 支付成功，显示成功提示
        setShowPaymentModal(false);
        showToast('success', '支付成功！正在跳转到订单页面...', 1500);
        
        // 延迟跳转到订单页面，让用户看到成功提示
        setTimeout(() => {
          window.location.href = '/app/accountrental/my-account-rental/rentalorder';
        }, 1500);
      } else {
        showToast('error', result.message || '支付失败');
        throw new Error(result.message || '支付失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '支付失败，请稍后重试';
      setApiError(errorMsg);
      if (!toastVisible) {
        showToast('error', errorMsg);
      }
    } finally {
      setApiLoading(false);
      // 确保Toast在操作完成后隐藏
      if (toastType === 'loading') {
        setToastVisible(false);
      }
    }
  };

  
  
  // 组件挂载时获取数据
  useEffect(() => {
    const loadLeaseInfoDetail = async () => {
      if (!leaseInfoId) {
        setError('租赁信息ID无效');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchLeaseInfoDetail(leaseInfoId);
        setLeaseInfo(data);
        setError(null);
      } catch (error) {
        console.error('获取租赁信息详情失败:', error);
        setError(error instanceof Error ? error.message : '获取租赁信息失败');
        setLeaseInfo(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaseInfoDetail();
  }, [leaseInfoId]);
  
  // 统一的页面布局组件 - 使用更简单的结构避免Hydration mismatch
  const PageContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">租赁信息详情</h1>
      {children}
    </div>
  );

  // 加载状态组件
  const LoadingState = () => (
    <PageContainer>
      <div className="animate-pulse bg-gray-100 p-8 rounded-md">
        <p className="text-gray-500">正在加载租赁信息...</p>
      </div>
    </PageContainer>
  );

  // 错误状态组件
  const ErrorState = ({ message }: { message: string }) => {
    // 分析错误类型，提供更友好的错误提示
    const getFriendlyErrorMessage = () => {
      if (message.includes('求租信息不存在')) {
        return '很抱歉，您查找的租赁信息不存在或已被删除';
      } else if (message.includes('认证')) {
        return '登录状态已过期，请重新登录后再试';
      } else if (message.includes('404')) {
        return '找不到请求的页面，请检查链接是否正确';
      } else if (message.includes('500')) {
        return '服务器暂时无法处理请求，请稍后再试';
      }
      return message;
    };

    return (
      <PageContainer>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-red-50 p-6 border-l-4 border-red-400">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">加载失败</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getFriendlyErrorMessage()}</p>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:text-blue-500">
                    重试
                  </Button>
                  <Button variant="ghost" onClick={() => window.history.back()} className="ml-3 text-sm text-gray-600 hover:text-gray-500">
                    返回上一页
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  };

  // 无效ID状态组件
  const InvalidIdState = () => (
    <PageContainer>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">无效的租赁信息ID</h3>
              <p className="mt-1 text-sm text-gray-500">请检查您访问的链接是否正确</p>
              <div className="mt-6">
                <Button variant="ghost" onClick={() => window.history.back()} className="inline-flex text-sm text-blue-600 hover:text-blue-500">
                  返回上一页
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );

  // 渲染相应的状态
  if (!leaseInfoId) {
    return <InvalidIdState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!leaseInfo || error) {
    return <ErrorState message={error || '未找到租赁信息'} />;
  }

    // 格式化发布时间
    const formatPublishTime = (timeString: string): string => {
      const date = new Date(timeString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 根据订单状态返回对应的样式类名
    const getOrderStatusClass = (leaseInfoStatus: string): string => {
      switch (leaseInfoStatus) {
        case 'ACTIVE':
          return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED':
          return 'bg-green-100 text-green-800';
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-800';
        case 'COMPLETED':
          return 'bg-purple-100 text-purple-800';
        case 'CANCELLED':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Toast提示框 */}
        {toastVisible && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
          >
            <div 
              className={`flex items-center px-6 py-4 rounded-lg shadow-lg bg-white bg-opacity-90 animate-fadeInUp`}
              style={{ animation: 'fadeInUp 0.3s ease-out' }}
            >
              {/* 加载图标 */}
              {toastType === 'loading' && (
                <div className="animate-spin mr-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              {/* 成功图标 */}
              {toastType === 'success' && (
                <div className="mr-3 text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {/* 错误图标 */}
              {toastType === 'error' && (
                <div className="mr-3 text-red-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
              )}
              
              {/* 提示文字 */}
              <span className="text-gray-800 font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
        
        {/* 添加CSS动画 */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        {/* 主内容区域 */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧主要信息 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3">
                  {/* 订单基本信息 */}
                  <div className="mb-6">
                    <div>
                      <h1 className="text-xl font-bold text-gray-800">出租账号详情</h1>
                    </div>
                  </div>
                  
                  {/* 租赁描述 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">账号描述</h2>
                    <p className="text-gray-600 leading-relaxed">{leaseInfo.description}</p>
                  </div>
                  
                  {/* 租赁信息详情 */}
                  <div className="grid grid-cols-3 gap-4 mb-6 border-t border-gray-100 pt-4">
                    <div>
                      <div className="text-sm ">平台</div>
                      <div>{leaseInfo.platform}</div>
                    </div>
                    <div>
                      <div className="text-sm">账号类型</div>
                      <div>{leaseInfo.accountType}</div>
                    </div>
                    <div>
                      <div className="text-sm">租赁状态</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getOrderStatusClass(leaseInfo.status)}`}>
                        {leaseInfo.status}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 账号图片展示区域 */}
                {leaseInfo && (
                  <div className="bg-white px-3">
                    <h2 className="text-lg font-medium text-gray-800 mb-3">账号图片：</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {/* 判断是否有图片，没有则显示默认图片 */}
                      {(!leaseInfo.image && (!leaseInfo.images || leaseInfo.images.length === 0)) ? (
                        <div 
                          className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-colors w-[100px] h-[100px]"
                          onClick={() => setSelectedImage('/images/default.png')}
                        >
                          <img 
                            src="/images/default.png" 
                            alt="账号默认图片" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                      ) : (
                        // 优先使用单张图片
                        leaseInfo.image ? (
                          <div 
                            className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-colors w-[100px] h-[100px]"
                            onClick={() => setSelectedImage(leaseInfo.image!)}
                          >
                            <img 
                              src={leaseInfo.image} 
                              alt="账号图片" 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                              onError={(e) => {
                                // 图片加载失败时显示默认图片
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/default.png';
                                target.alt = '账号默认图片';
                              }}
                            />
                          </div>
                        ) : (
                          // 多张图片展示
                          leaseInfo.images?.map((img, index) => (
                            <div 
                              key={index} 
                              className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-colors w-[100px] h-[100px]"
                              onClick={() => setSelectedImage(img)}
                            >
                              <img 
                                src={img} 
                                alt={`账号图片 ${index + 1}`} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                                onError={(e) => {
                                  // 图片加载失败时显示默认图片
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/default.png';
                                  target.alt = '账号默认图片';
                                }}
                              />
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 图片预览模态框 */}
                {selectedImage && (
                  <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" 
                    onClick={() => setSelectedImage(null)}
                  >
                    <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full  z-10 w-8 h-8 hover:bg-opacity-70 transition-colors"
                        onClick={() => setSelectedImage(null)}
                      >
                        ✕
                      </button>
                      <img 
                        src={selectedImage} 
                        alt="预览图片" 
                        className="max-w-full max-h-[85vh] object-contain" 
                        onError={(e) => {
                          // 预览图片加载失败时显示默认图片
                          const target = e.target as HTMLImageElement;
                          target.src = '/public/images/default.png';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* 支付密码模态框 */}
                {showPaymentModal && (
                  <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
                    onClick={handleCancelPayment}
                  >
                    <div 
                      className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-xl font-bold mb-4 text-center">支付确认</h2>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">请输入支付密码</label>
                        <label className="block text-sm font-medium text-red-500 mb-1">*如果无支付密码或忘记支付密码，点击此处重置支付密码</label>
                        <a href="/accountrental/paymentsettings/setpaymentpwd" className="text-blue-500 hover:underline mb-1">设置/重置支付密码</a>
                        <input
                          type="password"
                          placeholder="请输入支付密码"
                          value={password}
                          onChange={(e) => setpassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={6}
                        />
                        {password.length > 0 && password.length !== 6 && (
                          <p className="text-red-500 text-xs mt-1">支付密码为6位</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between gap-3">
                        <Button 
                          variant="ghost" 
                          className="flex-1" 
                          onClick={handleCancelPayment}
                          disabled={apiLoading}
                        >
                          取消
                        </Button>
                        <Button 
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" 
                          onClick={handleConfirmPayment}
                          disabled={apiLoading || password.length !== 6}
                        >
                          {apiLoading ? '支付中...' : '确认支付'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 右侧价格和操作信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-3 sticky top-6">
                {/* 价格信息 */}
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-red-600">¥{leaseInfo.pricePerDay}/天</span>
                  </div>
                </div>
                {/* 租赁信息 */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>最低租期</span>
                    <span>{leaseInfo.minLeaseDays}天</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>最高租期</span>
                    <span>{leaseInfo.maxLeaseDays}天</span>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">租赁天数</label>
                    <input
                      type="number"
                      value={leaseDays === 0 ? '' : leaseDays}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 当输入框为空时，设置默认值为0
                        if (value === '') {
                          setLeaseDays(0);
                        } else {
                          const numValue = parseInt(value);
                          // 允许输入0和正整数，只要它在有效范围内
                          if (!isNaN(numValue)) {
                            setLeaseDays(Math.max(0, Math.min(leaseInfo.maxLeaseDays, numValue)));
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">请输入0-{leaseInfo.maxLeaseDays}天</p>
                  </div>
                </div>
                {/* 操作按钮 */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleRentNow}
                    disabled={apiLoading}
                  >
                    {apiLoading ? '处理中...' : '立即租赁'}
                  </Button>
                  
                  <Button variant="ghost" className="w-full">
                    联系发布者
                  </Button>
                </div>
                {/* API错误提示 */}
                {apiError && (
                  <div className="mt-3 bg-red-50 text-red-600 p-2 rounded text-sm">
                    {apiError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      
      </div>
    );
};

export default AccountDetailPage;