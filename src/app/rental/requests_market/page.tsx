'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { GetRequestRentalMarketListResponse, RequestRentalItem } from '@/app/types/rental/requestRental/getRequestRentalMarketListTypes';

// 格式化时间，只显示月、日、时、分
const formatTime = (timeString: string | undefined): string => {
  if (!timeString) {
    return '未知时间';
  }
  const date = new Date(timeString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

const RentalRequestsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rentalRequests, setRentalRequests] = useState<RequestRentalItem[]>([]);
  
  // 无限滚动相关状态
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [displayedRequests, setDisplayedRequests] = useState<RequestRentalItem[]>([]);
  
  // 排序状态管理
  const [sortBy, setSortBy] = useState<'time' | 'price'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 筛选模态框状态
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // 筛选选项状态
  const [filterOptions, setFilterOptions] = useState({
    accountSupport: {
      basic_information: false,
      other_requirements: false,
      deblocking: false
    },
    loginMethods: {
      scan_code: false,
      phone_message: false,
      requested_all: false
    }
  });

  // 获取求租市场列表数据
  useEffect(() => {
    const fetchRentalRequests = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/rental/requestRental/getRequestRentalMarketList');
        const data: GetRequestRentalMarketListResponse = await response.json();
        
        if (data.code === 0) {
          if (!data.data || !data.data.list) {
            console.error('API返回数据格式错误: 缺少data.list');
            setRentalRequests([]);
            return;
          }
          setRentalRequests(data.data.list);
        } else {
          console.error('API返回数据格式错误:', data);
          setRentalRequests([]);
        }
      } catch (error) {
        console.error('获取求租信息失败:', error);
        setRentalRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequests();
  }, []);

  // 使用useMemo优化排序操作，避免不必要的重复计算
  const filteredRequests = useMemo(() => {
    let result = [...rentalRequests];

    // 根据排序条件排序
    result.sort((a, b) => {
      if (sortBy === 'time') {
        // 按创建时间排序
        const timeA = new Date(a.created_at || '').getTime();
        const timeB = new Date(b.created_at || '').getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else if (sortBy === 'price') {
        // 按价格排序
        const priceA = typeof a.budget_amount_yuan === 'number' ? a.budget_amount_yuan : 0;
        const priceB = typeof b.budget_amount_yuan === 'number' ? b.budget_amount_yuan : 0;
        return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
      }
      return 0;
    });

    return result;
  }, [rentalRequests, sortBy, sortOrder]);

  // 当请求列表变化时，重新设置显示的请求
  useEffect(() => {
    if (filteredRequests.length > 0) {
      const initialBatch = filteredRequests.slice(0, itemsPerPage);
      setDisplayedRequests(initialBatch);
      setHasMore(filteredRequests.length > initialBatch.length);
      setPage(1); // 重置页码
    } else {
      setDisplayedRequests([]);
      setHasMore(false);
      setPage(1); // 重置页码
    }
  }, [filteredRequests]);

  // 处理查看详情
  const handleViewDetail = (requestId: number) => {
    router.push(`/rental/requests_market/detail/${requestId}`);
  };

  // 加载更多请求
  const loadMoreRequests = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newBatch = filteredRequests.slice(startIndex, endIndex);

      if (newBatch.length > 0) {
        setDisplayedRequests(prev => [...prev, ...newBatch]);
        setPage(prev => prev + 1);
        setHasMore(endIndex < filteredRequests.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载更多请求失败:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 使用无限滚动钩子
  const { containerRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMoreRequests,
    threshold: 200
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
          <div className="text-xs text-gray-500 mt-2">
            正在获取求租市场数据，请稍候...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 min-h-screen bg-gray-50">
      {/* 发布求租信息按钮 */}
      <div className="px-4 pt-4 mb-3 max-w-7xl mx-auto">
        <Button
          onClick={() => router.push('/rental/rental_publish/requests')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          发布求租信息
        </Button>
      </div>
      
      {/* 筛选和排序按钮 */}
      <div className="px-4 mb-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${sortBy === 'time' ? 'bg-orange-50 text-orange-600 border border-orange-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => {
                  setSortBy('time');
                  setSortOrder('desc');
                  setPage(1); // 重置页码
                }}
              >
                <span>最新发布</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 10L1 5H11L6 10Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className="relative">
              <button 
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${sortBy === 'price' ? 'bg-orange-50 text-orange-600 border border-orange-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => {
                  setSortBy('price');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setPage(1); // 重置页码
                }}
              >
                <span>价格</span>
                {sortOrder === 'asc' ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L1 7H11L6 2Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 10L1 5H11L6 10Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button 
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              // 检查是否有任何筛选选项被选中
              Object.values(filterOptions.accountSupport).some(Boolean) || 
              Object.values(filterOptions.loginMethods).some(Boolean)
                ? 'bg-orange-50 text-orange-600 border border-orange-300'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setShowFilterModal(true)}
          >
            <span>筛选</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 10L1 5H11L6 10Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* 求租信息列表 - 添加滚动容器引用 */}
      <div
        className="max-w-[1200px] mx-auto px-4"
        ref={containerRef}
      >
        {displayedRequests.length === 0 && !loading ? (
          <div className="bg-white p-8 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无求租信息</h3>
            <p className="text-gray-600 mb-4">目前市场上没有求租信息</p>
          </div>
        ) : (
          <div>
            {/* 移动端布局 */}
            <div className="md:hidden space-y-4">
              {displayedRequests.map((request, index) => (
                <div
                  key={request.id}
                  className={`cursor-pointer group ${index > 0 ? 'border-t border-gray-100 pt-4' : ''}`}
                  onClick={() => handleViewDetail(request.id)}
                >
                  {/* 移动端布局 - 左右结构 */}
                  <div className="flex space-x-3 min-h-[120px] bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    {/* 右侧信息区域 */}
                    <div className="w-full">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 text-lg">{request.title}</h3>
                      <p className="text-gray-600 mb-1 line-clamp-2">{request.requirements_json?.account_requirements || ''}</p>
                      {/* 筛选项标签展示 */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(() => {
                          const tags = [];
                          const requirementsJson = request.requirements_json || {};
                          
                          // 账号要求标签
                          if (requirementsJson.basic_information === 'true' ) tags.push('修改基本信息');
                          if (requirementsJson.other_requirements === 'true' ) tags.push('实名认证');
                          if (requirementsJson.deblocking === 'true' ) tags.push('账号解禁');
                          
                          // 登录方式标签
                          if (requirementsJson.scan_code === 'true' ) tags.push('扫码登录');
                          if (requirementsJson.phone_message === 'true' ) tags.push('短信验证');
                          if (requirementsJson.requested_all === 'true' ) tags.push('按租赁方要求');
                          
                          // 最多显示5个标签
                          return tags.slice(0, 5).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                              {tag}
                            </span>
                          ));
                        })()}
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs text-gray-500">租期: {request.days_needed}天</div>
                        <div className="text-xs text-gray-500">{formatTime(request.created_at)}</div>
                      </div>
                      
                      <div className="text-lg text-red-600">¥<span className='text-2xl ml-1'>{request.budget_amount_yuan}</span>/天</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* PC端布局 - 一行4列 */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-xl p-4"
                    onClick={() => handleViewDetail(request.id)}
                  >
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-1 text-sm">{request.title}</h3>
                    <p className="text-gray-600 mb-1 line-clamp-2">{request.requirements_json?.account_requirements || ''}</p>
                    
                    {/* 筛选项标签展示 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(() => {
                        const tags = [];
                        const requirementsJson = request.requirements_json || {};
                        
                        // 账号要求标签
                          if (requirementsJson.basic_information === 'true' ) tags.push('修改基本信息');
                        if (requirementsJson.other_requirements === 'true' ) tags.push('实名认证');
                        if (requirementsJson.deblocking === 'true' ) tags.push('账号解禁');
                        
                        // 登录方式标签
                        if (requirementsJson.scan_code === 'true' ) tags.push('扫码登录');
                        if (requirementsJson.phone_message === 'true' ) tags.push('短信验证');
                        if (requirementsJson.requested_all === 'true' ) tags.push('按租赁方要求');
                        
                        // 最多显示5个标签
                        return tags.slice(0, 5).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {tag}
                          </span>
                        ));
                      })()}
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-gray-500">租期: {request.days_needed}天</div>
                      <div className="text-xs text-gray-500">{formatTime(request.created_at)}</div>
                    </div>
                    
                    <div className="text-lg font-bold text-red-600">¥{request.budget_amount_yuan}/天</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 加载更多指示器 */}
            {loadingMore && (
              <div className="py-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            )}

            {/* 没有更多数据时的提示 */}
            {!hasMore && displayedRequests.length > 0 && (
              <div className="py-6 text-center text-gray-500 text-sm">
                没有更多求租信息了
              </div>
            )}
          
          </div>
          )}
        {/* 提示信息 */}
        <div className="px-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">求租提示</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  请根据您的需求发布求租信息，租赁前请仔细查看账号详情和租赁条款，确保账号符合您的推广需求。如有疑问，可联系客服咨询。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选模态框 */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-t-lg rounded-b-none w-full max-w-md max-h-[80vh] overflow-y-auto mb-10">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">快速筛选</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowFilterModal(false)}
                >
                  <CloseOutlined className="text-xl" />
                </button>
              </div>
              <div className="p-4">
                {/* 账号支持选项 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">账号支持:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.basic_information ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          basic_information: !prev.accountSupport.basic_information
                        }
                      }))}
                    >
                      修改基本信息
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.other_requirements ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          other_requirements: !prev.accountSupport.other_requirements
                        }
                      }))}
                    >
                      实名认证
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.deblocking ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          deblocking: !prev.accountSupport.deblocking
                        }
                      }))}
                    >
                      账号解禁
                    </button>
                  </div>
                </div>
                
                {/* 登录方式选项 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">登录方式:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.loginMethods.scan_code ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        loginMethods: {
                          ...prev.loginMethods,
                          scan_code: !prev.loginMethods.scan_code
                        }
                      }))}
                    >
                      扫码登录
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.loginMethods.phone_message ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        loginMethods: {
                          ...prev.loginMethods,
                          phone_message: !prev.loginMethods.phone_message
                        }
                      }))}
                    >
                      短信验证
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.loginMethods.requested_all ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        loginMethods: {
                          ...prev.loginMethods,
                          requested_all: !prev.loginMethods.requested_all
                        }
                      }))}
                    >
                      按租赁方要求
                    </button>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-4 border-t mb-10">
                  <button 
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setFilterOptions({
                      accountSupport: {
                        basic_information: false,
                        other_requirements: false,
                        deblocking: false
                      },
                      loginMethods: {
                        scan_code: false,
                        phone_message: false,
                        requested_all: false
                      }
                    })}
                  >
                    重置
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={() => {
                      // 这里可以添加筛选逻辑
                      console.log('筛选选项:', filterOptions);
                      setShowFilterModal(false);
                    }}
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalRequestsPage;