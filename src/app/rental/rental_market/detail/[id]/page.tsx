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
    <div className="container mx-auto py-1 px-4">
      <h1 className="text-2xl font-bold ">租赁信息详情</h1>
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
        <div className=" overflow-hidden ">
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
      <div className=" overflow-hidden">
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
    <div className="mb-5 bg-gray-50">
      {/* 主内容区域 */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="py-3 space-y-3">
          {/* 主要信息 */}
          <div className=" overflow-hidden">
            <div className="py-1 px-4">
              {/* 租赁描述 */}
              <div className="mb-2">
                <h2 className="text-lg font-medium text-gray-800 mb-2">{rentalInfo.title || "未设置标题"}</h2>
                <h2 className="text-base font-medium text-gray-800 mb-2">账号描述:</h2>
                <p className="text-gray-600 leading-relaxed py-3 px-4 border border-blue-200 rounded-md">{rentalInfo.content_json?.account_info || ""}</p>
              </div>
              <p className="text-sm text-gray-600 mb-2">发布时间：{rentalInfo.created_at || "未设置发布时间"}</p>

              {/* 租赁信息详情 */}
              <div className="mb-2">
                {/* 续租状态标签 */}
                <span className={`px-3 py-1 rounded-full text-sm mr-3 ${rentalInfo.allow_renew ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-600'}`}>
                  {rentalInfo.allow_renew ? '续租' : '不续租'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${getOrderStatusClass(rentalInfo.status_text)}`}>
                  {rentalInfo.status_text}
                </span>
              </div>
            </div>
            
            {/* 账号图片展示区域 */}
            {rentalInfo && (
              <div className="bg-white px-4 py-1 ">
                <h2 className="text-base font-medium text-gray-800 mb-1">账号图片：</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 px-1">
                  {/* 判断是否有图片，没有则显示默认图片 */}
                  {(!rentalInfo.content_json?.images || rentalInfo.content_json.images.length === 0) ? (
                    <div
                      className="cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors w-full aspect-square"
                      onClick={() => setSelectedImage('')}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">暂无图片</span>
                      </div>
                    </div>
                  ) : (
                    // 多张图片展示
                    rentalInfo.content_json.images.map((img, index) => (
                      <div
                        key={index}
                        className="cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors w-full aspect-square"
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

            {/* 账号支持 */}
            <div className="bg-white px-4 py-1 ">
              <h2 className="text-base font-medium text-gray-800 mb-1">账号支持</h2>
              <div className="flex flex-wrap gap-2">
                {rentalInfo.content_json?.basic_information && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">修改基本信息</span>
                )}
                {rentalInfo.content_json?.post_douyin && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">发布抖音</span>
                )}
                {rentalInfo.content_json?.deblocking && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">账号解禁</span>
                )}
                {rentalInfo.content_json?.identity_verification && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">实名认证</span>
                )}
              </div>
            </div>

            {/* 登录方式 */}
            <div className="bg-white px-4 py-1 ">
              <h2 className="text-base font-medium text-gray-800 mb-1">登录方式</h2>
              <div className="flex flex-wrap gap-2">
                {rentalInfo.content_json?.scan_code && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">扫码登录</span>
                )}
                {rentalInfo.content_json?.phone_message && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">短信验证</span>
                )}
                {rentalInfo.content_json?.requested_all && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">按租赁方要求</span>
                )}
              </div>
            </div>
          </div>

          {/* 价格和操作信息 */}
          <div className=" py-1 px-4 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              {/* 价格信息 */}
              <div className="mb-2 md:mb-0">
                <div className="flex items-baseline">
                  <span className="text-base font-bold text-gray-700">出租单价：</span>
                  <span className="text-2xl font-bold text-red-600 ml-2">¥{rentalInfo.price_per_day_yuan}/天</span>
                </div>
              </div>
              
              {/* 租赁信息 */}
              <div className="flex space-x-6">
                <div>
                  租期：{rentalInfo.min_days}-{rentalInfo.max_days}天                  
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 mt-10">
              <Button
                variant="ghost"
                className="py-1 px-4 "
              >
                联系客服
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-6"
                onClick={() => {
                  // 跳转到订单页面并传递offer_id
                  window.location.href = `/rental/rental_market/ordering?offer_id=${offerId}`;
                }}
                disabled={apiLoading}
              >
                {apiLoading ? '处理中...' : '立即租用'}
              </Button>
            </div>
            
            {/* API错误提示 */}
            {apiError && (
              <div className="mt-4 bg-red-50 text-red-600 p-3 rounded text-sm">
                {apiError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] py-1 px-4" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute topy-1 px-4 right-4 text-white bg-black bg-opacity-50 rounded-full z-10 w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-colors"
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
                target.src = '';
              }}
            />
          </div>
        </div>
      )}
    </div>
    )
  }

export default AccountDetailPage;