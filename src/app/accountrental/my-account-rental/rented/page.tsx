'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import AudioOutlined from '@ant-design/icons/AudioOutlined';
import BookOutlined from '@ant-design/icons/BookOutlined';
import ToolOutlined from '@ant-design/icons/ToolOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import SearchBar from '@/components/button/SearchBar';

// 根据平台获取对应图标
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'douyin':
      return <AudioOutlined className="text-2xl" />;
    case 'xiaohongshu':
      return <BookOutlined className="text-2xl" />;
    case 'kuaishou':
      return <ToolOutlined className="text-2xl" />;
    default:
      return <BookOutlined className="text-2xl" />;
  }
};

// 模拟租赁的账号数据
interface RentedAccount {
  id: string;
  orderId: string;
  accountId: string;
  accountTitle: string;
  platform: string;
  platformIcon: React.ReactNode;
  rentalStartTime: string;
  rentalEndTime: string;
  actualEndTime?: string;
  price: number;
  totalHours: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired' | 'overdue' | 'scheduled';
  rating?: number;
  review?: string;
  paymentStatus: 'paid' | 'unpaid';
  description?: string;
  images?: string[];
}

const RentedAccountsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [rentedAccounts, setRentedAccounts] = useState<RentedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // 账号租赁相关的搜索模块配置
  const accountRentalModules = [
    {
      keywords: ['账号', '账号租赁', '出租'],
      urlPath: '/accountrental/account-rental-market',
      moduleName: '账号租赁市场',
    },
    {
      keywords: ['我的账号', '发布账号'],
      urlPath: '/accountrental/my-account-rental/published',
      moduleName: '我发布的账号',
    },
    {
      keywords: ['租赁记录', '租用账号'],
      urlPath: '/accountrental/my-account-rental/rented',
      moduleName: '我租用的账号',
    },
  ];

  // 处理应用筛选条件
  const handleApplyFilters = () => {
    setIsFilterModalVisible(false);
    // 在实际项目中，这里可以添加应用筛选条件的逻辑
    console.log('应用筛选条件:', { selectedStatus, selectedPlatform });
  };

  // 账号操作菜单状态管理
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // 处理下拉菜单开关
  const toggleDropdownMenu = (orderId: string) => {
    // 先关闭排序菜单
    setSortMenuOpen(false);
    // 直接切换下拉菜单状态
    setDropdownMenuOpen(prev => {
      console.log(`当前打开的菜单: ${prev}, 点击的菜单: ${orderId}`);
      return prev === orderId ? null : orderId;
    });
  };

  // 处理排序菜单开关
  const toggleSortMenu = () => {
    // 先关闭下拉菜单
    setDropdownMenuOpen(null);
    // 再切换排序菜单状态
    setSortMenuOpen(!sortMenuOpen);
  };

  // 关闭所有下拉菜单
  const closeAllMenus = () => {
    setDropdownMenuOpen(null);
    setSortMenuOpen(false);
  };

  // 点击页面其他地方关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 使用特定类名来查找菜单容器
      const menuContainers = document.querySelectorAll('.account-menu-container');
      let isClickInsideAnyMenu = false;
      
      menuContainers.forEach(container => {
        if (container.contains(event.target as Node)) {
          isClickInsideAnyMenu = true;
        }
      });
      
      // 如果点击不在任何菜单内，则关闭所有菜单
      if (!isClickInsideAnyMenu) {
        // 添加调试日志
        console.log('点击了菜单外部，关闭所有菜单');
        closeAllMenus();
      }
    };

    // 添加点击事件监听器到document
    document.addEventListener('click', handleClickOutside);

    // 清理函数
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); // 移除依赖项，只在组件挂载时添加一次事件监听器

  // 模拟获取数据
  useEffect(() => {
    const fetchRentedAccounts = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 模拟数据
        const mockData: RentedAccount[] = [
          {
            id: 'rent001',
            orderId: 'ORD-20230701-001',
            accountId: 'acc-001',
            accountTitle: '美食探店达人',
            platform: 'douyin',
            platformIcon: getPlatformIcon('douyin'),
            rentalStartTime: '2023-07-01T10:00:00',
            rentalEndTime: '2023-07-01T14:00:00',
            actualEndTime: '2023-07-01T13:45:00',
            price: 120,
            totalHours: 4,
            totalAmount: 480,
            status: 'completed',
            rating: 4.8,
            review: '账号质量很好，粉丝互动率高',
            paymentStatus: 'paid',
            description: '用于拍摄美食探店视频，主要展示餐厅环境和菜品特色，账号有50万粉丝，互动率高。',
            images: [
              '/images/1758380776810_96.jpg',
              '/images/1758384598887_578.jpg'
            ]
          },
          {
            id: 'rent002',
            orderId: 'ORD-20230628-002',
            accountId: 'acc-002',
            accountTitle: '时尚搭配指南',
            platform: 'xiaohongshu',
            platformIcon: '📕',
            rentalStartTime: '2023-06-28T15:30:00',
            rentalEndTime: '2023-06-28T18:30:00',
            actualEndTime: '2023-06-28T18:30:00',
            price: 180,
            totalHours: 3,
            totalAmount: 540,
            status: 'completed',
            rating: 5,
            review: '非常满意，账号活跃度很高',
            paymentStatus: 'paid',
            description: '时尚穿搭分享账号，专注于夏季女装搭配，适合发布服装展示和搭配技巧内容。',
            images: [
              '/images/1758596791656_544.jpg'
            ]
          },
          {
            id: 'rent003',
            orderId: 'ORD-20230702-003',
            accountId: 'acc-005',
            accountTitle: '生活方式分享',
            platform: 'douyin',
            platformIcon: '🎵',
            rentalStartTime: '2023-07-02T09:00:00',
            rentalEndTime: '2023-07-02T13:00:00',
            price: 150,
            totalHours: 4,
            totalAmount: 600,
            status: 'active',
            paymentStatus: 'paid',
            description: '生活方式类账号，主要分享日常家居布置、生活小技巧和健康饮食内容。',
            images: [
              '/images/default.png',
              '/images/1758380776810_96.jpg',
              '/images/1758384598887_578.jpg',
              '/images/1758596791656_544.jpg'
            ]
          },
          {
            id: 'rent004',
            orderId: 'ORD-20230630-004',
            accountId: 'acc-003',
            accountTitle: '科技产品评测',
            platform: 'kuaishou',
            platformIcon: '🔧',
            rentalStartTime: '2023-06-30T14:00:00',
            rentalEndTime: '2023-06-30T17:00:00',
            actualEndTime: '2023-06-30T16:00:00',
            price: 90,
            totalHours: 3,
            totalAmount: 270,
            status: 'completed',
            rating: 4.5,
            paymentStatus: 'paid',
            description: '专注于手机、电脑等数码产品的评测账号，适合发布产品开箱、功能测试和使用体验内容。',
            images: [
              '/images/1758384598887_578.jpg',
              '/images/1758596791656_544.jpg'
            ]
          },
          {
            id: 'rent005',
            orderId: 'ORD-20230702-005',
            accountId: 'acc-004',
            accountTitle: '旅行摄影分享',
            platform: 'douyin',
            platformIcon: '🎵',
            rentalStartTime: '2023-07-03T16:00:00',
            rentalEndTime: '2023-07-03T19:00:00',
            price: 150,
            totalHours: 3,
            totalAmount: 450,
            status: 'scheduled',
            paymentStatus: 'unpaid',
            description: '旅行摄影账号，分享国内外旅游景点和摄影技巧，适合发布风景照片和旅行Vlog。',
            images: [
              '/images/default.png',
              '/images/1758380776810_96.jpg'
            ]
          }
        ];
        
        setRentedAccounts(mockData);
      } catch (error) {
        console.error('获取租赁账号列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentedAccounts();
  }, []);

  // 筛选和搜索逻辑
  const filteredAccounts = rentedAccounts.filter(account => {
    const matchesSearch = account.accountTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         account.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus;
    const matchesPlatform = selectedPlatform === 'all' || account.platform === selectedPlatform;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // 排序逻辑
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.rentalStartTime).getTime() - new Date(a.rentalStartTime).getTime();
    } else if (sortBy === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else if (sortBy === 'hours') {
      return b.totalHours - a.totalHours;
    }
    return 0;
  });

  // 获取状态对应的颜色和文本
  const getStatusInfo = (status: string, paymentStatus: string) => {
    // 待付款: scheduled且未付款
    if (status === 'scheduled' && paymentStatus === 'unpaid') {
      return { color: 'bg-red-100 text-red-700', text: '待付款' };
    }
    // 租赁中: active
    if (status === 'active') {
      return { color: 'bg-blue-100 text-blue-700', text: '租赁中' };
    }
    // 已过期: 其他所有状态
    return { color: 'bg-green-100 text-green-700', text: '已过期' };
  };

  // 获取平台对应的名称
  const getPlatformName = (platform: string) => {
    const platformMap: Record<string, string> = {
      douyin: '抖音',
      xiaohongshu: '小红书',
      kuaishou: '快手'
    };
    return platformMap[platform] || platform;
  };

  // 处理查看账号详情
  const handleViewAccount = (accountId: string) => {
    // 在实际项目中，应该跳转到账号详情页
    console.log('查看账号详情:', accountId);
    // router.push(`/accountrental/account-rental-market/detail/${accountId}`);
  };

  // 处理查看订单详情
  const handleViewOrder = (orderId: string) => {
    // 在实际项目中，应该跳转到订单详情页
    console.log('查看订单详情:', orderId);
    // router.push(`/accountrental/orders/${orderId}`);
  };

  // 处理付款
  const handlePay = (orderId: string) => {
    // 在实际项目中，应该跳转到付款页面
    console.log('付款订单:', orderId);
    // router.push(`/accountrental/payment/${orderId}`);
  };

  // 处理取消订单
  const handleCancelOrder = (orderId: string) => {
    // 在实际项目中，应该调用API取消订单
    console.log('取消订单:', orderId);
    // 这里可以添加取消订单的逻辑
  };

  // 处理评价
  const handleReview = (orderId: string) => {
    // 在实际项目中，应该跳转到评价页面
    console.log('评价订单:', orderId);
    // router.push(`/accountrental/review/${orderId}`);
  };

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  // 格式化时间（带时分）
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化时间（只带时分）
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 提示信息 */}
      <div className="px-4 py-3 bg-blue-50 mt-2">
        <div className="flex items-start">
          <InfoCircleOutlined className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
          <p className="text-xs text-blue-700">租赁期间请遵守平台规则，文明使用账号</p>
        </div>
      </div>

      {/* 搜索和筛选区域 - 调整为一行显示 */}
      <div className="px-4 py-3 mt-2">
        <div className="flex items-center space-x-3">
          {/* 搜索组件 */}
          <button 
            className="rounded-full py-1.5 px-6 bg-blue-500 text-white"
            onClick={() => document.querySelector('.anticon-search')?.closest('button')?.click()}
            aria-label="搜索"
          >
            <SearchOutlined className="h-6 w-5" />
          </button>
          
          {/* 隐藏原始的SearchBar按钮，保留其功能 */}
          <SearchBar
            placeholder="搜索订单号、账号名称或ID"
            className="hidden"
            customModules={accountRentalModules}
          />

          {/* 筛选按钮 */}
          <button 
            onClick={() => setIsFilterModalVisible(true)}
            className="w-auto p-2 flex items-center text-black text-sm px-3 rounded-full border border-gray-200"
          >
            <FilterOutlined className="mr-1 h-4 w-4" />
            筛选
          </button>

          {/* 自定义排序下拉菜单 */}
          <div className="relative">
            <button 
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="w-auto p-2 flex items-center text-black text-sm px-3 rounded-full border border-gray-200"
            >
              {sortBy === 'latest' && '最新租赁'}
              {sortBy === 'amount' && '金额最高'}
              {sortBy === 'hours' && '时长最长'}
              <DownOutlined className={`ml-1 h-4 w-4 transition-transform ${sortMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {sortMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden">
                <button 
                  onClick={() => { setSortBy('latest'); setSortMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  最新租赁
                </button>
                <button 
                  onClick={() => { setSortBy('amount'); setSortMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  金额最高
                </button>
                <button 
                  onClick={() => { setSortBy('hours'); setSortMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  时长最长
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 筛选模态框 */}
      {isFilterModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg">筛选条件</h3>
              <button 
                onClick={() => setIsFilterModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseOutlined className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <h4 className="text-sm text-gray-700 mb-2">租赁状态</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedStatus === 'all' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setSelectedStatus('active')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedStatus === 'active' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    进行中
                  </button>
                  <button
                    onClick={() => setSelectedStatus('completed')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedStatus === 'completed' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    已完成
                  </button>
                  <button
                    onClick={() => setSelectedStatus('scheduled')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedStatus === 'scheduled' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    待开始
                  </button>
                  <button
                    onClick={() => setSelectedStatus('cancelled')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedStatus === 'cancelled' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    已取消
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-700 mb-2">平台类型</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedPlatform === 'all' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('douyin')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedPlatform === 'douyin' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    抖音
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('xiaohongshu')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedPlatform === 'xiaohongshu' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    小红书
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('kuaishou')}
                    className={`px-3 py-1 text-xs rounded-full ${selectedPlatform === 'kuaishou' ? 'bg-blue-200 text-blue-700' : 'bg-blue-200 text-gray-700'}`}
                  >
                    快手
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Button 
                onClick={handleApplyFilters}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 账号列表 */}
      <div className="px-4 py-3">
        {loading ? (
          // 加载状态 - 调整为卡片网格样式
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedAccounts.length === 0 ? (
          // 空状态
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <SearchOutlined className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">暂无租赁账号记录</p>
            <button 
              onClick={() => router.push('/accountrental/account-rental-market')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              浏览账号市场
            </button>
          </div>
        ) : (
          // 账号列表 - 调整为卡片网格样式
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedAccounts.map((account) => {
              const statusInfo = getStatusInfo(account.status, account.paymentStatus);
              const isActive = account.status === 'active';
              const isScheduled = account.status === 'scheduled';
              const isCompleted = account.status === 'completed';
              const isPaid = account.paymentStatus === 'paid';
              
              return (
                <div 
                  key={account.orderId} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 relative"
                >
                  {/* 账号信息卡片 */}
                  <div className="p-4">
                    {/* 订单编号、状态和平台信息 - 调整为一行显示 */}
                    <div className="flex items-center justify-between mb-2">
                      
                      <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full flex  justify-center text-sm mr-1">
                            {account.platformIcon}
                          </div>
                          <div className="text-sm">{getPlatformName(account.platform)}</div>
                        </div>

                      <div className="flex items-center space-x-2">
                        <div className={`text-sm px-2 py-0.5 rounded ${statusInfo.color}`}>
                          {statusInfo.text}
                        </div>
                        
                      </div>
                    </div>

                    <div className="flex items-center flex-1 mb-2">
                        <div className="text-sm truncate w-9/10 mr-2">
                          订单编号: {account.orderId}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(account.orderId);
                            // 可以添加复制成功的提示
                            console.log('订单编号已复制');
                          }}
                          className="text-sm hover:text-blue-700 w-1/10 whitespace-nowrap" 
                          title="复制订单编号"
                        >
                          复制
                        </button>
                      </div>
                    {/* 租赁详情网格 */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="flex flex-col">
                        <span className="text-sm mb-1">租赁日期</span>
                        <span className="text-sm font-medium">{formatDate(account.rentalStartTime)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm mb-1">租赁时长</span>
                        <span className="text-sm font-medium">{account.totalHours}小时</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm mb-1">租金</span>
                        <span className="text-sm font-medium">{account.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm mb-1">账号ID</span>
                        <span className="text-sm font-medium">{account.accountId}</span>
                      </div>
                    </div>
                    
                    {/* 订单描述 */}
                    {account.description && (
                      <div className="mb-3">
                        <span className="text-sm font-medium block mb-1">订单描述</span>
                        <p className="text-sm bg-gray-50 p-2 rounded">{account.description}</p>
                      </div>
                    )}
                    
                    {/* 图片显示，一行最多展示两个图片 */}
                    {account.images && account.images.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium block mb-1">上传图片</span>
                        <div className="grid grid-cols-2 gap-2">
                          {account.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="aspect-video bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={image} 
                                alt={`订单图片 ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onClick={() => window.open(image, '_blank')}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          ))}
                        </div>
                        {account.images.length > 4 && (
                          <p className="text-sm text-gray-500 mt-1">+{account.images.length - 4} 张图片</p>
                        )}
                      </div>
                    )}
                    
                    {/* 时间范围 */}
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-2 text-sm">
                      <div className="flex items-center">
                        <CalendarOutlined className="h-3 w-3 mr-1" />
                        <span>
                          {formatTime(account.rentalStartTime)} - {formatTime(account.rentalEndTime)}
                        </span>
                      </div>
                      {account.actualEndTime && (
                        <div>
                          实际结束: {formatTime(account.actualEndTime)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 操作按钮区域 */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between">
                      {isActive && (
                        <button 
                          onClick={() => handleViewAccount(account.accountId)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-full hover:bg-green-700"
                        >
                          查看账号
                        </button>
                      )}
                      {isScheduled && !isPaid && (
                        <button 
                          onClick={() => handlePay(account.orderId)}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          立即付款
                        </button>
                      )}
                      {isCompleted && !account.rating && (
                        <button 
                          onClick={() => handleReview(account.orderId)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-full"
                        >
                          评价
                        </button>
                      )}
                      {isScheduled && isPaid && (
                        <button 
                          onClick={() => handleCancelOrder(account.orderId)}
                          className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-full"
                        >
                          取消订单
                        </button>
                      )}
                      
                      {/* 账号详情按钮 */}
                      <button 
                        onClick={() => handleViewOrder(account.orderId)}
                        className="px-3 items-right py-1.5 text-sm border bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        订单详情
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-sm">
        <p>账号租赁记录保存期限为12个月</p>
      </div>
    </div>
  );
};

export default RentedAccountsPage;