'use client';

import { useState, useEffect } from 'react';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// 导入新的类型定义
import { GetOffersRentalInfoDetailResponse, RentalInfoDetail } from '../../../../types/rental/rentOut/getOffersRentalInfoDetailTypes';

// 客户端组件
const AccountDetailPage = ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  const { id } = params;
  const offerId = id || '';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rentalInfo, setRentalInfo] = useState<RentalInfoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [orderId, setOrderId] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [leaseDays, setLeaseDays] = useState<number>(0);

  // 当rentalInfo加载完成后，可以根据需要设置默认租赁天数，但允许用户修改为0
  useEffect(() => {
    if (rentalInfo && rentalInfo.min_days) {
      // 保持默认值为最小租赁天数，但用户可以修改为0
      setLeaseDays(rentalInfo.min_days);
    }
  }, [rentalInfo?.min_days]);

  // 组件挂载时获取数据
  useEffect(() => {
    const loadRentalInfoDetail = async () => {
      if (!offerId) {
        setError('租赁信息ID无效');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('offerId:', offerId);
        // 调用新的API端点，使用offer_id参数
        const response = await fetch(`/api/rental/rentOut/getOffersRentalInfoDetail?offer_id=${offerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API请求失败: HTTP ${response.status}`);
        }

        const result: GetOffersRentalInfoDetailResponse = await response.json();

        if (result.code === 0) {
          setRentalInfo(result.data);
          setError(null);
        } else {
          throw new Error(result.message || '获取租赁信息失败');
        }
      } catch (error) {
        console.error('获取租赁信息详情失败:', error);
        setError(error instanceof Error ? error.message : '获取租赁信息失败');
        setRentalInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadRentalInfoDetail();
  }, [offerId]);

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
        <div className="bg-white shadow-sm overflow-hidden ">
          <div className="bg-red-50 p-6 border-l-4 border-red-400 ">
            <div className="flex items-start ">
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
                <div className="mt-1">
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
      <div className="bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">无效的租赁信息ID</h3>
              <p className="mt-1 text-sm">请检查您访问的链接是否正确</p>
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
  if (!offerId) {
    return <InvalidIdState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!rentalInfo || error) {
    return <ErrorState message={error || '未找到租赁信息'} />;
  }

  // 根据订单状态返回对应的样式类名
  const getOrderStatusClass = (statusText: string): string => {
    switch (statusText) {
      case '上架中':
        return 'bg-green-100 text-green-800';
      case '已下架':
        return 'bg-gray-100 text-gray-800';
      case '已出租':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="max-w-full mx-auto">
        <div className="">
          {/* 左侧主要信息 */}
          <div className="">
            <div className="bg-white shadow-sm overflow-hidden">
              <div className="p-3">
                {/* 订单基本信息 */}
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-gray-800">出租账号详情</h1>
                </div>

                {/* 租赁描述 */}
                <div className="mb-1">
                  <h2 className="text-lg font-medium text-gray-800">标题：{rentalInfo.title || "未设置标题"}</h2>
                  <h2 className="text-lg font-medium text-gray-800">账号描述:</h2>
                  <p className="text-gray-600 leading-relaxed p-3 border border-blue-200 rounded-md">{rentalInfo.content_json?.account_info || ""}</p>
                </div>

                {/* 租赁信息详情 */}
                <div className="grid grid-cols-3 gap-4 mb-1 border-y border-gray-100 py-2">
                  <div>
                    <div className="text-sm ">发布者：</div>
                    <div>{rentalInfo.publisher_username}</div>
                  </div>
                  <div>
                    <div className="text-sm">是否允许续租：</div>
                    <div>{rentalInfo.allow_renew_text}</div>
                  </div>
                  <div>
                    <div className="text-sm">当前状态：</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getOrderStatusClass(rentalInfo.status_text)}`}>
                      {rentalInfo.status_text}
                    </div>
                  </div>
                </div>
              </div>
              {/* 账号图片展示区域 */}
              {rentalInfo && rentalInfo.content_json && (
                <div className="bg-white px-3">
                  <h2 className="text-lg font-medium text-gray-800 mb-1">账号图片：</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {/* 判断是否有图片，没有则显示默认图片 */}
                    {(!rentalInfo.content_json.images || rentalInfo.content_json.images.length === 0) ? (
                      <div
                        className="cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors w-[100px] h-[100px]"
                        onClick={() => setSelectedImage('')}
                      >
                        <img
                          src=""
                          alt="账号默认图片"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      // 多张图片展示
                      rentalInfo.content_json.images.map((img, index) => (
                        <div
                          key={index}
                          className="cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors w-[100px] h-[100px]"
                          onClick={() => setSelectedImage(img.trim())}
                        >
                          <img
                            src={img.trim()}
                            alt={`账号图片 ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // 图片加载失败时显示默认图片
                              const target = e.target as HTMLImageElement;
                              target.src = '';
                              target.alt = '账号默认图片';
                            }}
                          />
                        </div>
                      ))
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
                        target.src = '/public';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 支付密码模态框 */}
              {showPaymentModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentPassword('');
                    setOrderId('');
                    // 取消后跳转到租赁订单页面
                    window.location.href = '/accountrental/my-account-rental/myrentedorder';
                  }}
                >
                  <div
                    className="bg-white shadow-lg p-6 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2 className="text-xl font-bold mb-4 text-center">支付确认</h2>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">支付密码</label>
                      <input
                        type="password"
                        placeholder="请输入支付密码"
                        value={paymentPassword}
                        onChange={(e) => setPaymentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={6}
                      />
                      {paymentPassword.length > 0 && paymentPassword.length !== 6 && (
                        <p className="text-red-500 text-xs mt-1">支付密码为6位</p>
                      )}
                    </div>

                    <div className="flex justify-between gap-3">
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={() => {
                          setShowPaymentModal(false);
                          setPaymentPassword('');
                          setOrderId('');
                          // 取消后跳转到租赁订单页面
                          window.location.href = '/accountrental/my-account-rental/myrentedorder';
                        }}
                        disabled={apiLoading}
                      >
                        取消
                      </Button>
                      <Button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          // 这里可以添加实际的支付逻辑
                          setShowPaymentModal(false);
                          alert('支付功能待实现');
                        }}
                        disabled={apiLoading || paymentPassword.length !== 6}
                      >
                        {apiLoading ? '支付中...' : '确认支付'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 账号支持 */}
              <div className="bg-white shadow-sm py-2 px-4">
                <h2 className="text-lg font-medium text-gray-800 mb-1">账号支持</h2>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.name_and_photo ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.name_and_photo && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">修改抖音账号名称和头像</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.account_info ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.account_info && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">修改账号简介</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.publish_comment ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.publish_comment && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">支持发布评论</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.publish_video ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.publish_video && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">支持发布视频</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.deblocking ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.deblocking && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">支持账号解封</span>
                  </div>
                </div>
              </div>

              {/* 登录方式 */}
              <div className="bg-white shadow-sm py-2 px-4">
                <h2 className="text-lg font-medium text-gray-800 mb-1">登录方式</h2>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.scan_code_login ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.scan_code_login && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">扫码登录</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.phone_message ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.phone_message && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">手机号+短信验证登录</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-4 w-4 rounded border ${rentalInfo.content_json.requested_all ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center mr-2`}>
                      {rentalInfo.content_json.requested_all && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 5 3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">不登录账号，按照承租方要求完成租赁</span>
                  </div>
                </div>
              </div>
              
              {/* 联系方式 */}
              <div className="bg-white shadow-sm py-2 px-4">
                <h2 className="text-lg font-medium text-gray-800 mb-1">联系方式</h2>
                <div className="space-y-1">
                  {/* 手机号 */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm">手机号</div>
                    <div className="text-gray-700 font-medium">{rentalInfo.content_json.phone_number || '未设置'}</div>
                  </div>
                  
                  {/* QQ号 */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm">QQ号</div>
                    <div className="text-gray-700 font-medium">{rentalInfo.content_json.qq_number || '未设置'}</div>
                  </div>
                  
                  {/* 邮箱 */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm">邮箱</div>
                    <div className="text-gray-700 font-medium">{rentalInfo.content_json.email || '未设置'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧价格和操作信息 */}
        <div className="">
          <div className="bg-white shadow-sm p-3 sticky top-6">
            {/* 价格信息 */}
            <div className="mb-2">
              <div className="flex items-end">
                <span className="text-2xl">出租单价：</span>
                <span className="text-2xl font-bold text-red-600">¥{rentalInfo.price_per_day_yuan}/天</span>
              </div>
            </div>
            {/* 租赁信息 */}
            <div className="">
              <div className="flex justify-between text-sm mb-2">
                <span>最低租期</span>
                <span>{rentalInfo.min_days}天</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>最高租期</span>
                <span>{rentalInfo.max_days}天</span>
              </div>
              <div className="">
                <label className="block text-sm font-medium mb-2">租赁天数</label>
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
                        setLeaseDays(Math.max(0, Math.min(rentalInfo.max_days, numValue)));
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  min="0"
                />
                <p className="text-xs text-gray-500 mb-2">请输入0-{rentalInfo.max_days}天</p>
              </div>
            </div>
            {/* 操作按钮 */}
            <div className="space-y-1">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  // 这里可以添加实际的立即租赁逻辑
                  alert('立即租赁功能待实现');
                }}
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
    );
  }

export default AccountDetailPage;