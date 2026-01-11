'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// 定义与后端API返回数据结构匹配的接口
export interface RentalAccountInfo {
  id: string;
  userId: string;
  accountType: number;
  accountLevel: string;
  platform: number;
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
  images?: string[];
}

export interface RentalMarketResponse {
  code: number;
  message: string;
  data: {
    list: RentalAccountInfo[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Radio } from '@/components/ui/Radio';
import { Label } from '@/components/ui/Label';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { CopyOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons';
import AccountCard from '../components/AccountCard';
import AccountRentalLayout from '../layout';

export default function AccountRentalMarketPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<RentalAccountInfo[]>([]);
  
  // 处理返回逻辑
  const handleBack = () => {
    // 检查是否有from参数，如果有且等于commenter-hall，则返回抢单大厅
    const fromParam = searchParams?.from;
    if (fromParam === 'commenter-hall') {
      router.push('/commenter/hall');
    } else {
      // 否则使用浏览器的返回功能
      router.back();
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  // 为DisplayedAccounts添加类型定义
  const [displayedAccounts, setDisplayedAccounts] = useState<RentalAccountInfo[]>([]);

  // 从后端API获取账号租赁市场数据
  useEffect(() => {
    const fetchRentalMarketData = async () => {
      setLoading(true);
      
      try {
        // 构建请求参数
        const requestParams = {
          page: 0,
          size: 20,
          sortField: "createTime",
          sortOrder: "DESC",
          status: "ACTIVE",
          platform: "",
          accountType: "",
          minPrice: 1,
          maxPrice: 1000
        };
        
        // 调用后端API
        const response = await fetch('/api/rental/rentalmarket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestParams)
        });
        
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }
        
        const result: RentalMarketResponse = await response.json();
        console.log('请求成功', result);
        // 检查API响应是否成功
        if (result && result.success && result.data && result.data.list) {
          // 添加默认图片以确保UI渲染正常
          const accountsWithImages = result.data.list.map(account => ({
            ...account,
            images: account.images && account.images.length > 0 
              ? account.images 
              : ['images/1758380776810_96.jpg'] // 默认图片路径
          }));
          
          setAccounts(accountsWithImages);
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

    // 按创建时间降序排序
    result.sort((a, b) => {
      return new Date(b.createTime || '').getTime() - new Date(a.createTime || '').getTime();
    });

    return result;
  }, [accounts]);

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
  const loadMoreAccounts = async () => {
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
  };

  // 使用无限滚动钩子
  const { containerRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMoreAccounts,
    threshold: 200
  });

  // 已删除搜索相关功能

  // 根据订单状态返回对应的样式类名
  const getOrderStatusClass = (status: string): string => {
    switch (status) {
      case '待确认':
        return 'bg-yellow-100 text-yellow-800';
      case '已确认':
        return 'bg-green-100 text-green-800';
      case '进行中':
        return 'bg-blue-100 text-blue-800';
      case '已完成':
        return 'bg-purple-100 text-purple-800';
      case '已取消':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化发布时间
  const formatPublishTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 处理账号卡片点击
  const handleAccountClick = (accountId: string) => {
    router.push(`/accountrental/account-rental-market/market-detail/${accountId}`);
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

  // 复制订单号
  const copyOrderNumber = (event: React.MouseEvent, orderNumber: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderNumber)
      .then(() => {
        setCopySuccess(orderNumber);
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
          <div className="text-xs text-gray-500 mt-2">
            正在获取账号租赁市场数据，请稍候...
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen pb-28 max-w-7xl mx-auto">
      {/* 发布出租账号按钮 */}
      <div className="px-4 pt-4 mb-3">
        <Button 
          onClick={() => router.push('/accountrental/account-rental-publish/publish-for-rent')}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg text-lg font-medium shadow-md transition-all min-h-12 active:scale-95"
        >
          发布出租账号
        </Button>
      </div>

      {/* 筛选和搜索区域 - 优化移动端体验 */}
      <div className="px-4">
          <div className="bg-white rounded-xl">
          </div>
        </div>

              {/* 账号列表 - 添加滚动容器引用 */}
              <div 
                className="px-4"
                ref={containerRef}
                style={{ 
                  overflowY: 'auto'
                }}
              >
                {displayedAccounts.length === 0 && !loading ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">暂无账号</h3>
                      <p className="text-gray-600 mb-4">目前市场上没有可租赁的账号</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {displayedAccounts.map(account => (
                      <div 
                        key={account.id} 
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAccountClick(account.id)}
                      >
                        {/* 图片缩略图区域 */}
                        {account.images && account.images.length > 0 && (
                          <div className="mb-3">
                            <div 
                              className="w-full max-w-[300px] h-[200px] bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity mx-auto"
                              onClick={(e) => handleImageClick(e, account.images![0])}
                            >
                              <img 
                                src={`/${account.images[0]}`} 
                                alt="账号缩略图" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                                <EyeOutlined className="text-white text-2xl" />
                              </div>
                            </div>
                          </div>
                        )}
                        

                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{account.description}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                          <div>发布时间: {formatPublishTime(account.createTime)}</div>
                          <div>租期范围: {account.minLeaseDays}-{account.maxLeaseDays}天</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-bold text-red-600">¥{account.pricePerDay}/天</div>
                          <Button 
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccountClick(account.id);
                            }}
                          >
                            查看详情
                          </Button>
                        </div>
                      </div>
                    ))}

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
              </div>

      {/* 提示信息 */}
      <div className="px-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">账号租赁提示</h3>
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

      </div>
    );
}
  