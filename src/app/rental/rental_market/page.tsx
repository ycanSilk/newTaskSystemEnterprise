'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { EyeOutlined, CloseOutlined } from '@ant-design/icons';
import { GetOffersRentalMarketListResponse, RentalAccountInfo } from '@/app/types/rental/rentOut/getOffersRentalMarketListTypes';

export default function AccountRentalMarketPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<RentalAccountInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 为DisplayedAccounts添加类型定义
  const [displayedAccounts, setDisplayedAccounts] = useState<RentalAccountInfo[]>([]);
  // 排序状态管理
  const [sortBy, setSortBy] = useState<'time' | 'price'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // 筛选模态框状态
  const [showFilterModal, setShowFilterModal] = useState(false);
  // 筛选选项状态
  const [filterOptions, setFilterOptions] = useState({
    platformType: {
      douyin: false,
      qq: false
    },
    accountSupport: {
      post_douyin: false,
      post_ad: false,
      basic_information: false,
      deblocking: false,
      identity_verification: false
    },
    loginMethods: {
      scan_code: false,
      phone_message: false,
      account_password: false,
      other_require: false
    }
  });

  // 从后端API获取账号租赁市场数据
  useEffect(() => {
    const fetchRentalMarketData = async () => {
      setLoading(true);

      try {
        // 调用新的API端点
        const response = await fetch('/api/rental/rentOut/getOffersRentalMarketList', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }

        const result: GetOffersRentalMarketListResponse = await response.json();
        
        console.log('请求成功,code码', result.code);
        console.log('原始数据', result);
        // 检查API响应是否成功
        // 检查API响应是否成功
        if (result.code === 0) {
          // 显示全部数据，不移除is_my的筛选
          // 检查data.list是否存在
          if (!result.data || !result.data.list) {
            console.error('API返回数据格式错误: 缺少data.list');
            return;
          }

        
          // 显示全部数据
          const allAccounts = result.data.list;
          if (allAccounts.length > 0) {
            setAccounts(allAccounts);
          } else {
            console.log('没有账号数据');
            // 即使没有数据，也要设置为空数组，避免状态不一致
            setAccounts([]);
          }
          console.log('全部数据', allAccounts);
        } else {
          console.error('API返回数据格式错误:', result);
        }
      } catch (error) {
        console.error('获取账号租赁市场数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalMarketData();
  }, []);

  // 使用useMemo优化排序操作，避免不必要的重复计算
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // 应用筛选条件
    result = result.filter(account => {
      const contentJson = account.content_json || {};
      
      // 平台类型筛选
      const platformFilters = Object.entries(filterOptions.platformType)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      if (platformFilters.length > 0) {
        if (!contentJson.platform_type || !platformFilters.includes(contentJson.platform_type)) {
          return false;
        }
      }
      
      // 账号支持筛选
      const accountSupportFilters = Object.entries(filterOptions.accountSupport)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      if (accountSupportFilters.length > 0) {
        const hasMatchingSupport = accountSupportFilters.some(filter => {
          switch (filter) {
            case 'post_douyin':
              return contentJson.post_douyin === 'true';
            case 'post_ad':
              return contentJson.post_ad === 'true';
            case 'basic_information':
              return contentJson.basic_information === 'true';
            case 'deblocking':
              return contentJson.deblocking === 'true';
            case 'identity_verification':
              return contentJson.identity_verification === 'true';
            default:
              return false;
          }
        });
        if (!hasMatchingSupport) {
          return false;
        }
      }
      
      // 登录方式筛选
      const loginMethodsFilters = Object.entries(filterOptions.loginMethods)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      if (loginMethodsFilters.length > 0) {
        const hasMatchingLogin = loginMethodsFilters.some(filter => {
          switch (filter) {
            case 'scan_code':
              return contentJson.scan_code === 'true';
            case 'phone_message':
              return contentJson.phone_message === 'true';
            case 'account_password':
              return contentJson.account_password === 'true';
            case 'other_require':
              return contentJson.other_require === 'true';
            default:
              return false;
          }
        });
        if (!hasMatchingLogin) {
          return false;
        }
      }
      
      return true;
    });

    // 根据排序条件排序
    result.sort((a, b) => {
      if (sortBy === 'time') {
        // 按创建时间排序
        const timeA = new Date(a.created_at || '').getTime();
        const timeB = new Date(b.created_at || '').getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else if (sortBy === 'price') {
        // 按价格排序，确保转换为数字类型
        const priceA = (a.price_per_day_yuan) ;
        const priceB = (b.price_per_day_yuan) ;
        return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
      }
      return 0;
    });

    return result;
  }, [accounts, sortBy, sortOrder, filterOptions]);

  // 当账号列表变化时，重新设置显示的账号
  useEffect(() => {
    if (filteredAccounts.length > 0) {
      const initialBatch = filteredAccounts.slice(0, itemsPerPage);
      setDisplayedAccounts(initialBatch);
      setHasMore(filteredAccounts.length > initialBatch.length);
    } else {
      setDisplayedAccounts([]);
      setHasMore(false);
    }
  }, [filteredAccounts]);

  // 加载更多账号
  const loadMoreAccounts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      // 模拟网络请求延迟 - 减少延迟时间
      await new Promise(resolve => setTimeout(resolve, 300));

      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newBatch = filteredAccounts.slice(startIndex, endIndex);

      if (newBatch.length > 0) {
        setDisplayedAccounts(prev => [...prev, ...newBatch]);
        setPage(prev => prev + 1);
        setHasMore(endIndex < filteredAccounts.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载更多账号失败:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, itemsPerPage, filteredAccounts]);

  // 使用无限滚动钩子
  const { containerRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMoreAccounts,
    threshold: 200
  });

  // 处理账号卡片点击
  const handleAccountClick = (accountId: number) => {
    router.push(`/rental/rental_market/detail/${accountId}`);
  };

  // 处理图片点击，显示大图预览
  const handleImageClick = (event: React.MouseEvent, imageUrl: string) => {
    event.stopPropagation();
    setPreviewImage(imageUrl);
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // 格式化时间，只显示月、日、时、分
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl ">🔄</div>
          <div>加载中...</div>
          <div className="text-sm text-gray-500 mt-2">
            正在获取账号租赁市场数据，请稍候...
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="pb-28 min-h-screen bg-gray-50">
        {/* 发布出租账号按钮 */}
        <div className="px-4 pt-4 mb-3 max-w-7xl mx-auto flex justify-end">
          <Button
            onClick={() => router.push('/rental/rental_publish/rental')}
            className="flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            发布出租信息
          </Button>
        </div>
        
        {/* 筛选和排序按钮 */}
        <div className="px-4 mb-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between bg-white  shadow-sm p-2">
            <div className="flex items-center space-x-1">
              <div className="relative">
                <button 
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors ${sortBy === 'time' ? 'bg-orange-50 text-orange-600 border border-orange-300' : 'bg-gray-100 hover:bg-gray-200'}`}
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
        
        {/* 账号列表 - 添加滚动容器引用 */}
        <div
          className="max-w-[1200px] mx-auto px-4"
          ref={containerRef}
        >
          {displayedAccounts.length === 0 && !loading ? (
            <div className="bg-white p-8 text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-800 ">暂无账号</h3>
              <p className="text-gray-600 mb-4">目前市场上没有可租赁的账号</p>
            </div>
          ) : (
            <div>
              {/* 移动端布局 */}
              <div className="md:hidden">
                {displayedAccounts.map((account, index) => (
                  <div
                    key={account.id}
                    className={`cursor-pointer group ${index > 0 ? 'border-t border-gray-100 pt-4' : ''}`}
                    onClick={() => handleAccountClick(account.id)}
                  >
                    {/* 移动端布局 - 左右结构 */}
                    <div className="flex space-x-3 min-h-[120px] max-h-[155px]">
                      {/* 左侧图片区域 */}
                      {account.content_json && account.content_json.images && account.content_json.images.length > 0 && (
                        <div className="w-1/3 bg-gray-100 border border-gray-200 min-h-[120px] max-h-[155px]">
                          <img
                            src={account.content_json.images[0]}
                            alt="账号图片"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {/* 右侧信息区域 */}
                      <div className="w-2/3 min-h-[120px] max-h-[155px]">
                        <h3 className="font-bold text-gray-800  line-clamp-1 text-lg">{account.title}</h3>
                        <p className="text-gray-600  line-clamp-1 text-sm">{account.content_json?.account_info || ''}</p>
                        {/* 筛选项标签展示 */}
                        <div className="flex flex-wrap gap-1 mb-1 max-h-[50px] overflow-hidden">
                          {(() => {
                            const tags = [];
                            const contentJson = account.content_json || {};
                            
                            // 账号要求标签
                            if (contentJson.basic_information === 'true') tags.push('修改基本信息');
                            if (contentJson.post_douyin === 'true') tags.push('发布抖音');
                            if (contentJson.post_ad === 'true') tags.push('发布广告');
                            if (contentJson.deblocking === 'true') tags.push('账号解禁');
                            if (contentJson.identity_verification === 'true') tags.push('实名认证');
                            
                            // 登录方式标签
                            if (contentJson.scan_code === 'true') tags.push('扫码登录');
                            if (contentJson.phone_message === 'true') tags.push('短信验证');
                            if (contentJson.account_password === 'true') tags.push('账号密码');
                            if (contentJson.other_require === 'true') tags.push('不登录，按承租方需求修改账户相关方要求');
                            
                            // 最多显示6个标签
                            return tags.slice(0, 10).map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ));
                          })()}
                        </div>
                        
                        {/* 续租状态标签和平台类型标签 */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-sm ${account.allow_renew ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {account.allow_renew ? '续租' : '不续租'}
                          </span>
                          {account.content_json && account.content_json.platform_type && (
                            <span className={`px-2 py-0.5 rounded-full text-sm bg-blue-100 text-blue-600`}>
                              {account.content_json.platform_type === 'douyin' ? '抖音' : 'QQ'}
                            </span>
                          )}
                          <div className="text-sm text-gray-500 ml-auto">租期: {account.min_days}-{account.max_days}天</div>
                        </div>
                        
                        <div className="text-lg text-red-600">¥<span className='text-xl ml-1'>{account.price_per_day_yuan}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* PC端布局 - 一行4列 */}
              <div className="hidden md:block">
                <div className="grid grid-cols-4 gap-4">
                  {displayedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleAccountClick(account.id)}
                    >
                      {/* 图片展示区域 - 显示API返回的第一张图片 */}
                      {account.content_json && account.content_json.images && account.content_json.images.length > 0 && (
                        <div className="bg-gray-100 overflow-hidden">
                          <img
                            src={account.content_json.images[0]}
                            alt="账号图片"
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="py-1 px-2">
                        <h3 className="font-medium text-gray-800  line-clamp-1 text-sm">{account.title}</h3>
                        <p className="text-gray-600  line-clamp-2">{account.content_json?.account_info || ''}</p>
                        {/* 筛选项标签展示 */}
                        <div className="flex flex-wrap gap-1 mb-1 max-h-[50px] overflow-hidden">
                          {(() => {
                            const tags = [];
                            const contentJson = account.content_json || {};
                            
                            // 账号要求标签
                            if (contentJson.basic_information === 'true') tags.push('修改基本信息');
                            if (contentJson.post_douyin === 'true') tags.push('发布抖音');
                            if (contentJson.post_ad === 'true') tags.push('发布广告');
                            if (contentJson.deblocking === 'true') tags.push('账号解禁');
                            if (contentJson.identity_verification === 'true') tags.push('实名认证');
                            
                            // 登录方式标签
                            if (contentJson.scan_code === 'true') tags.push('扫码登录');
                            if (contentJson.phone_message === 'true') tags.push('短信验证');
                            if (contentJson.account_password === 'true') tags.push('账号密码');
                            if (contentJson.other_require === 'true') tags.push('不登录，按承租方需求修改账户相关方要求');
                            
                            // 最多显示6个标签
                            return tags.slice(0, 10).map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ));
                          })()}
                        </div>
                        
                        {/* 续租状态标签和平台类型标签 */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-sm ${account.allow_renew ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {account.allow_renew ? '续租' : '不续租'}
                          </span>
                          {account.content_json && account.content_json.platform_type && (
                            <span className={`px-2 py-0.5 rounded-full text-sm bg-blue-100 text-blue-600`}>
                              {account.content_json.platform_type === 'douyin' ? '抖音' : 'QQ'}
                            </span>
                          )}
                          <div className="text-sm text-gray-500 ml-auto">租期: {account.min_days}-{account.max_days}天</div>
                          
                        </div>
                        <div className="text-sm text-gray-500">{formatTime(account.created_at)}</div>
                        <div className="text-lg font-bold text-red-600">¥{account.price_per_day_yuan}</div>
                      </div>
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
              {!hasMore && displayedAccounts.length > 0 && (
                <div className="py-6 text-center text-gray-500 text-sm">
                  没有更多账号了
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
                <h3 className="font-medium text-blue-900 ">账号租赁提示</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  请根据您的需求筛选合适的账号进行租赁。租赁前请仔细查看账号详情和租赁条款，确保账号符合您的推广需求。如有疑问，可联系客服咨询。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 图片预览模态框 */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
                onClick={handleClosePreview}
              >
                <CloseOutlined className="text-xl" />
              </button>
              <img
                src={`/${previewImage}`}
                alt="预览图片"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}
        
        {/* 筛选模态框 */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative bg-white rounded-lg w-full max-w-[800px] min-h-[600px] max-h-[80vh] overflow-y-auto mx-4">
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
                {/* 平台类型选项 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">平台类型:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.platformType.douyin ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        platformType: {
                          ...prev.platformType,
                          douyin: !prev.platformType.douyin
                        }
                      }))}
                    >
                      抖音
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.platformType.qq ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        platformType: {
                          ...prev.platformType,
                          qq: !prev.platformType.qq
                        }
                      }))}
                    >
                      QQ
                    </button>
                  </div>
                </div>
                
                {/* 账号支持选项 */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">账号支持:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.post_douyin ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          post_douyin: !prev.accountSupport.post_douyin
                        }
                      }))}
                    >
                      发布抖音
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.post_ad ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          post_ad: !prev.accountSupport.post_ad
                        }
                      }))}
                    >
                      发布广告
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.identity_verification ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          identity_verification: !prev.accountSupport.identity_verification
                        }
                      }))}
                    >
                      实名认证
                    </button>
                
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
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.accountSupport.deblocking ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        accountSupport: {
                          ...prev.accountSupport,
                          deblocking: !prev.accountSupport.deblocking
                        }
                      }))}
                    >
                      账号解封
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
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.loginMethods.account_password ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        loginMethods: {
                          ...prev.loginMethods,
                          account_password: !prev.loginMethods.account_password
                        }
                      }))}
                    >
                      账号密码
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${filterOptions.loginMethods.other_require ? 'bg-orange-100 text-orange-600 border border-orange-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                      onClick={() => setFilterOptions(prev => ({
                        ...prev,
                        loginMethods: {
                          ...prev.loginMethods,
                          other_require: !prev.loginMethods.other_require
                        }
                      }))}
                    >
                      不登录，按承租方需求修改账户相关
                    </button>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-3 pt-4 border-t 0">
                  <button 
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setFilterOptions({
                      platformType: {
                        douyin: false,
                        qq: false
                      },
                      accountSupport: {
                        post_douyin: false,
                        post_ad: false,
                        basic_information: false,
                        deblocking: false,
                        identity_verification: false
                      },
                      loginMethods: {
                        scan_code: false,
                        phone_message: false,
                        account_password: false,
                        other_require: false
                      }
                    })}
                  >
                    重置
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={() => {
                      setPage(1); // 重置页码
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
}
