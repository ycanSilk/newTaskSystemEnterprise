'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义已发布账号的接口类型
interface PublishedAccount {
  userid?: string;
  orderId?: string;
  title?: string;
  status?: string;
  price?: number;
  platform?: string;
  followers?: string;
  minRentalDays?: number;
  maxRentalDays?: number;
  rentalCount?: number;
  rating?: number;
  commenterName?: string;
  sellerName?: string;
  sellerAvatar?: string;
  hasReturnInsurance?: boolean;
  [key: string]: any; // 允许其他未知属性
}

function PublishedAccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [publishedAccounts, setPublishedAccounts] = useState<PublishedAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('published'); // 默认选中已发布选项卡

  useEffect(() => {
    const fetchPublishedAccounts = async () => {
      console.log('开始获取已发布账号数据...');
      try {
        setLoading(true);
        // 调用已创建的后端API路由
        const apiUrl = '/api/accountrental/rental-information/myrental?userId=3&page=0&size=10&sort=createTime&direction=DESC';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API响应数据:', data);
        
        // 直接使用API返回的原始数据结构，不进行额外映射
        if (data.code === 200 && data.data && Array.isArray(data.data.content)) {
          setPublishedAccounts(data.data.content);
          console.log('发布账号数据设置成功，数量:', data.data.content.length);
        } else {
          throw new Error('获取发布账号列表失败: 获取出租信息成功');
        }
      } catch (err) {
        console.error('获取发布账号列表失败:', err);
        setError(err instanceof Error ? err.message : String(err));
        setPublishedAccounts([]);
      } finally {
        setLoading(false);
        console.log('数据加载完成，loading状态:', loading);
      }
    };

    fetchPublishedAccounts();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 获取状态显示信息
  const getStatusInfo = (status?: string) => {
    const statusMap: {[key: string]: {text: string, color: string}} = {
      'active': { text: '已发布', color: 'text-green-600' },
      'pending': { text: '审核中', color: 'text-yellow-600' },
      'inactive': { text: '已下架', color: 'text-gray-600' }
    };
    return statusMap[status || 'active'] || statusMap.active;
  };

  // 获取平台名称
  const getPlatformName = (platform?: string) => {
    const platformMap: {[key: string]: string} = {
      'douyin': '抖音',
      'xiaohongshu': '小红书',
      'kuaishou': '快手',
      'weibo': '微博',
      'zhihu': '知乎'
    };
    return platformMap[platform || ''] || platform || '其他';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">已发布账号</h1>
            
            {/* 发布新账号按钮 */}
            <div className="mb-6">
              <button 
                onClick={() => router.push('/accountrental/account-rental-publish')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                发布新账号
              </button>
            </div>

            {/* 状态切换选项卡 */}
            <div className="flex border-b border-gray-200 mb-6">
              <button 
                onClick={() => setActiveTab('published')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'published' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                已发布
              </button>
              <button 
                onClick={() => setActiveTab('rented')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'rented' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                已出租
              </button>
              <button 
                onClick={() => setActiveTab('renting')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'renting' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                出租中
              </button>
              <button 
                onClick={() => setActiveTab('canceled')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'canceled' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                已取消
              </button>
            </div>

            {/* 账号列表展示 */}
            <div className="space-y-4">
              {loading ? (
                // 加载状态
                <div className="bg-white rounded-xl p-4 text-center text-blue-500">
                  正在加载账号信息...
                </div>
              ) : error ? (
                // 错误状态
                <div className="bg-red-50 rounded-xl p-4 text-center text-red-600">
                  {error}
                </div>
              ) : publishedAccounts.length === 0 ? (
                // 空状态
                <div className="bg-white rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无已发布账号</h3>
                  <p className="text-gray-500 mb-6">您目前还没有发布任何出租账号信息</p>
                  <button
                    onClick={() => router.push('/accountrental/account-rental-publish')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    去发布新账号
                  </button>
                </div>
              ) : (
                // 账号列表 - 使用原始API数据直接渲染
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center text-green-600">
                    成功获取到 {publishedAccounts.length} 条账号数据
                  </div>
                  {publishedAccounts.map((account) => {
                    const statusInfo = getStatusInfo(account.status);
                    
                    // 平台图标映射
                    const platformImages = {
                      'douyin': '/images/douyin-logo.png',
                      'xiaohongshu': '/images/xiaohongshu-logo.png',
                      'kuaishou': '/images/kuaishou-logo.png'
                    };
                    
                    return (
                      <div key={account.orderId || Math.random()} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        {/* 卖家信息和订单状态 */}
                        <div className="flex justify-between items-center px-4 py-2 border-b">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                              {account.sellerAvatar || '👤'}
                            </div>
                            <span className="text-sm font-medium">{account.sellerName || '未知卖家'}</span>
                          </div>
                          <span className={`text-sm ${statusInfo.color} font-medium`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        
                        {/* 商品信息和价格 */}
                        <div className="flex px-4 py-3 space-x-4">
                          {/* 平台图标 */}
                          <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img 
                              src={platformImages[account.platform as keyof typeof platformImages] || platformImages.douyin}
                              alt={account.platform || '平台图标'}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          
                          {/* 账号详情 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium mb-1 line-clamp-2">
                              {account.title || '未命名账号'}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-1">
                              <span className="text-xs text-gray-600">
                                租赁天数：{account.minRentalDays || 1}天 - {account.maxRentalDays || 30}天
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {statusInfo.text}
                              </span>
                            </div>
                            {account.hasReturnInsurance && (
                              <span className="text-xs text-orange-500 border border-orange-200 px-1.5 py-0.5 rounded">
                                退货包运费
                              </span>
                            )}
                          </div>
                          
                          {/* 价格 */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ¥{(account.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex justify-end px-4 py-2 border-t space-x-2">
                          <button className="px-3 py-1 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                            联系客服
                          </button>
                          <button className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded">
                            查看详情
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishedAccountsPage;