'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../../components/ui/AlertModal';
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll';
import { CalendarOutlined, SearchOutlined, ArrowLeftOutlined, ReloadOutlined, CreditCardOutlined, RollbackOutlined, GiftOutlined, FileTextOutlined, WalletOutlined } from '@ant-design/icons';

// 定义后端API返回的数据类型接口
export interface TransactionRecord {
  orderNo: string;
  transactionType: string;
  typeDescription: string;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: string;
  statusDescription: string;
  description: string;
  channel: string;
  createTime: string;
  updateTime: string;
}

export interface TransactionRecordResponse {
  code: number;
  message: string;
  data: {
    list: TransactionRecord[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// 为了兼容现有代码，保留Transaction接口
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  time: string;
  orderId: string;
  description: string;
  balance: number; // 交易后余额
}

export default function PublisherTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const initialLoadSize = 20;
  const loadMoreSize = 10;
  
  // 日历组件状态
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string) => {
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 关闭通用提示框
  const handleAlertClose = () => {
    setShowAlertModal(false);
  };

  // 加载更多交易记录
  const loadMoreTransactions = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchTransactions(true);
    }
  };
  
  // 使用无限滚动钩子
  const { containerRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMoreTransactions
  });

  // 获取交易记录数据
  const fetchTransactions = async (isLoadMore = false) => {
    const isInitialLoad = !isLoadMore;
    if (isInitialLoad) {
      setLoading(true);
      setPage(1);
      setHasMore(false);
      setTransactions([]); // 清空现有数据
    } else {
      setLoadingMore(true);
    }

    try {
      // 调用后端API
      const response = await fetch('/api/walletmanagement/transactionrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: isInitialLoad ? 1 : page + 1,
          size: initialLoadSize,
          transactionType: 'RECHARGE', // 只获取充值记录
        }),
      });

      if (!response.ok) {
        throw new Error('获取交易记录失败');
      }

      const responseData: TransactionRecordResponse = await response.json();

      if (responseData.success) {
        // 将后端返回的TransactionRecord转换为Transaction类型
        const newTransactions = responseData.data.list.map(record => ({
          id: record.orderNo, // 使用orderNo作为id
          type: record.transactionType,
          amount: record.amount,
          status: record.status,
          method: record.channel,
          time: record.createTime,
          orderId: record.orderNo,
          description: record.description,
          balance: record.afterBalance,
        }));

        if (isInitialLoad) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setPage(isInitialLoad ? 1 : page + 1);
        setHasMore(responseData.data.page < responseData.data.pages);
      } else {
        throw new Error(responseData.message || '获取交易记录失败');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('获取交易记录失败', '无法获取交易记录，请稍后再试。', '❌');
    } finally {
      if (isInitialLoad) setLoading(false);
      else setLoadingMore(false);
    }
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 处理日期选择
  const handleDateSelect = (dateValue: string) => {
    setSelectedDate(dateValue);
    setShowCalendar(false);
  };

  // 处理自定义日期范围选择
  const handleCustomDateSelect = () => {
    if (startDate && endDate) {
      // 计算日期范围对应的预设选项
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // 判断选择的日期范围是否匹配预设选项
      if (start.getTime() === today.getTime() && end.getTime() === today.getTime()) {
        setSelectedDate('today');
      } else if (start.getTime() === yesterday.getTime() && end.getTime() === yesterday.getTime()) {
        setSelectedDate('yesterday');
      } else if (start.getTime() === sevenDaysAgo.getTime() && end.getTime() === today.getTime()) {
        setSelectedDate('7days');
      } else if (start.getTime() === thirtyDaysAgo.getTime() && end.getTime() === today.getTime()) {
        setSelectedDate('30days');
      } else if (start.getTime() === firstDayOfThisMonth.getTime() && end.getTime() === today.getTime()) {
        setSelectedDate('thisMonth');
      } else if (start.getTime() === firstDayOfLastMonth.getTime() && end.getTime() === lastDayOfLastMonth.getTime()) {
        setSelectedDate('lastMonth');
      } else {
        // 自定义日期范围
        setSelectedDate(`custom:${startDate}:${endDate}`);
      }
      setShowCalendar(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedDate(null);
    setStartDate('');
    setEndDate('');
    fetchTransactions();
  };

  // 获取日期选项
  const getDateOptions = () => {
    return [
      { label: '全部', value: 'all' },
      { label: '今天', value: 'today' },
      { label: '昨天', value: 'yesterday' },
      { label: '近7天', value: '7days' },
      { label: '近30天', value: '30days' },
      { label: '本月', value: 'thisMonth' },
      { label: '上月', value: 'lastMonth' }

    ];
  };

  // 跳转到详情页
  const handleTransactionClick = (transactionId: string) => {
    router.push(`/publisher/recharge/rechargeDetail/${transactionId}`);
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}${amount.toFixed(2)}`;
  };

  // 格式化余额
  const formatBalance = (balance: number) => {
    return `${balance}元`;
  };

  // 筛选交易记录
  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];
    
    // 搜索筛选
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction => 
        transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 日期筛选
    if (selectedDate) {
      const now = new Date();
      let startDate: Date;
      
      if (selectedDate.startsWith('custom:')) {
        // 自定义日期范围
        const [, start, end] = selectedDate.split(':');
        const customStartDate = new Date(start);
        const customEndDate = new Date(end);
        customEndDate.setHours(23, 59, 59, 999); // 设置为当天的最后一刻
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.time);
          return transactionDate >= customStartDate && transactionDate <= customEndDate;
        });
        return filtered;
      }
      
      switch (selectedDate) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.time);
            return transactionDate >= startDate && transactionDate < endDate;
          });
          return filtered;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(transaction => {
            const transactionDate = new Date(transaction.time);
            return transactionDate >= startDate && transactionDate <= lastDayOfLastMonth;
          });
          return filtered;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(transaction => 
        new Date(transaction.time) >= startDate
      );
    }
    
    return filtered;
  }, [transactions, searchQuery, selectedDate]);

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // 直接获取交易记录，移除登录验证
  useEffect(() => {
    fetchTransactions();
  }, []);

  // 当交易数据、搜索条件或日期筛选变化时，更新筛选结果
  useEffect(() => {
    const result = filterTransactions();
    setFilteredTransactions(result);
  }, [filterTransactions]);

  // 删除返回上一页功能

  // 获取交易类型图标组件
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RECHARGE':
        return '￥';
      default:
        return '￥';
    }
  };

  // 获取交易类型文本
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'RECHARGE':
        return '充值';
      default:
        return '其他';
    }
  };


  // 显示选择的日期文本
  const getSelectedDateText = () => {
    if (!selectedDate) {
      return '选择日期';
    }
    
    if (selectedDate.startsWith('custom:')) {
      const [, start, end] = selectedDate.split(':');
      // 格式化日期为 MM/DD 格式
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      };
      return `${formatDate(start)} 至 ${formatDate(end)}`;
    }
    
    switch (selectedDate) {
      case 'today': return '今天';
      case 'yesterday': return '昨天';
      case '7days': return '近7天';
      case '30days': return '近30天';
      case 'thisMonth': return '本月';
      case 'lastMonth': return '上月';
      default: return '选择日期';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 顶部导航和标题 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">充值记录</h1>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="输入订单号搜索"
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
          />
          <SearchOutlined className="absolute left-3 top-3.5 " />
        </div>
      </div>
      
      {/* 日历筛选组件 - 改进为日历组件界面 */}
      <div className="mb-6 relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-4 py-2 rounded-lg flex items-center bg-blue-500 hover:bg-blue-600 transition-colors text-white shadow-md"
        >
          <CalendarOutlined className="mr-2" />
          {getSelectedDateText()}
        </button>
        
        {showCalendar && (
          <div 
            ref={calendarRef} 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 w-80 overflow-hidden"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-900">
              <span className="">日期筛选</span>
              <button 
                onClick={() => setShowCalendar(false)}
                className=""
              >
                X
              </button>
            </div>
            
            {/* 日期范围选择器 - 改进为更友好的日历组件界面 */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block  mb-1">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block  mb-1">结束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleCustomDateSelect}
                  disabled={!startDate || !endDate}
                  className={`w-full py-2 rounded-md transition-colors bg-blue-500 text-white cursor-not-allowed`}
                >
                  确认选择
                </button>
              </div>
            </div>
            
            {/* 快速筛选选项 */}
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium ">常用筛选</div>
              <div className="grid grid-cols-2 gap-1 p-2">
                {getDateOptions().map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleDateSelect(option.value)}
                    className={`px-3 py-2 rounded-md transition-colors text-center ${selectedDate === option.value ? 'bg-blue-500 text-white font-medium' : ' hover:bg-gray-50'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <button 
                onClick={handleRefresh}
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <ReloadOutlined className="inline mr-2" /> 清除筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 交易记录列表 - 取消高度限制，使用containerRef实现无限滚动 */}
      <div 
        ref={containerRef} 
        className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* 交易记录内容 */}
        {loading ? (
          <div className="p-8 text-center">加载中...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center ">暂无交易记录</div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleTransactionClick(transaction.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full items-center  w-10 h-10 bg-orange-400 flex items-center justify-center">
                        <div className="flex items-center justify-center text-white text-2xl">
                            {getTransactionIcon(transaction.type)}
                        </div>
                    </div>

                    <div>
                      <div className="">{getTransactionTypeText(transaction.type)}</div>
                      <div className="">{new Date(transaction.time).toLocaleString('zh-CN')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className='text-green-600'>
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载更多指示器 */}
            <div className="p-4 text-center">
              {loadingMore && <div className="">加载中...</div>}
              {!hasMore && !loading && filteredTransactions.length > 0 && (
                <div className="text-gray-400 text-sm">已显示全部交易记录</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={handleAlertClose}
      />
    </div>
  );
}