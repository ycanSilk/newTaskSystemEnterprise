'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';

import { GetWalletBalanceResponseData, GetWalletBalanceResponse,WalletInfo, Transaction } from '@/app/types/paymentWallet/getWalletBalanceTypes';


const TransactionListPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 从created_at中提取日期和时间
  const extractDateTime = (createTime: string) => {
    const date = new Date(createTime);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  // 获取交易图标（统一使用￥符号和黄色背景）
  const getTransactionIcon = () => {
    return {
      icon: '￥',
      color: 'text-white',
      bgColor: 'bg-yellow-500'
    };
  };

  // 处理查看交易详情
  const handleViewTransaction = (transaction: Transaction) => {
    // 将交易记录转换为URL编码的JSON字符串，作为查询参数传递
    const transactionParams = encodeURIComponent(JSON.stringify(transaction));
    router.push(`/publisher/balance/transaction-details/${transaction.id}?data=${transactionParams}` as any);
  };

  // 获取交易记录数据
  const fetchWithdrawalRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 调用后端API获取交易记录，带分页参数
      const response = await fetch(`/api/paymentWallet/getWalletBalance?page=${currentPage}&page_size=${itemsPerPage}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GetWalletBalanceResponse = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || '获取交易记录失败');
      }
      
      // 计算一年前的日期
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // 按创建时间倒序排序，并只保留一年以内的记录
      const sortedTransactions = data.data.transactions
        // 只保留最近一年的记录
        .filter(transaction => new Date(transaction.created_at) >= oneYearAgo)
        // 按创建时间倒序排序
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(sortedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取交易记录失败');
      console.error('获取交易记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 当页码或标签页变化时，重新获取数据
  useEffect(() => {
    fetchWithdrawalRecords();
  }, [currentPage, activeTab]);

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  // 当activeTab变化时，重置当前页码到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">

      
      {/* 交易记录 */}
            <div className="mt-3 bg-white">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="grid w-full grid-cols-3 border-b border-gray-100">
                  <button
                    className={`py-2 px-4 text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    全部明细
                  </button>
                  <button
                    className={`py-2 px-4 text-sm ${activeTab === 'recharge' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                    onClick={() => setActiveTab('recharge')}
                  >
                    收入明细
                  </button>
                  <button
                    className={`py-2 px-4 text-sm ${activeTab === 'withdraw' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                    onClick={() => setActiveTab('withdraw')}
                  >
                    支出明细
                  </button>
                </div>
              </div>
      
              {/* 交易记录列表 */}
              <div>
                {loading ? (
                  // 加载状态 - 优化为显示8个骨架屏，更接近实际内容数量
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs  animate-pulse">加载中...</div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center py-3 animate-pulse">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 mr-3" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3" />
                              <div className="h-4 bg-gray-200 rounded w-1/6" />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="h-3 bg-gray-200 rounded w-1/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  // 错误状态
                  <div className="py-12 px-4 text-center">
                    <div className="text-5xl mb-3">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">获取失败</h3>
                    <p className=" text-sm mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      重试
                    </Button>
                  </div>
                ) : transactions.length === 0 ? (
                  // 空状态
                  <div className="py-12 px-4 text-center">
                    <div className="text-5xl mb-3">📝</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">暂无交易记录</h3>
                    <p className=" text-sm mb-4">您还没有任何交易记录</p>
                  </div>
                ) : (
                  // 交易记录处理
                  <div>
                    {/* 1. 首先根据type字段过滤交易记录 */}
                    {(() => {
                      // 过滤交易记录
                      const filteredTransactions = transactions.filter(transaction => {
                        // 根据当前activeTab和type字段进行过滤
                        if (activeTab === 'recharge') {
                          // 收入明细：只显示type=2的记录
                          return transaction.type === 1;
                        } else if (activeTab === 'withdraw') {
                          // 支出明细：只显示type=1的记录
                          return transaction.type === 2;
                        }
                        // 全部明细：显示所有记录
                        return true;
                      });
      
                      // 2. 分页处理
                      const totalFiltered = filteredTransactions.length;
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      
                      return (
                        <>
                          {/* 显示交易记录总数信息 */}
                          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                            <div className="text-xs ">
                              共显示 {paginatedTransactions.length} / {totalFiltered} 条记录
                            </div>
                          </div>
      
                          {/* 交易记录列表 */}
                          {paginatedTransactions.map((transaction) => {
                            const iconInfo = getTransactionIcon();
                            // 根据type字段判断交易类型
                            const isIncome = transaction.type === 1;
                            const { date, time } = extractDateTime(transaction.created_at);
      
                            return (
                              <div
                                key={transaction.id}
                                className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50 flex items-center transition-colors duration-200 w-full cursor-pointer"
                                onClick={() => handleViewTransaction(transaction)}
                              >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3 text-lg font-bold flex-shrink-0`}>
                                  <span className={iconInfo.color}>{iconInfo.icon}</span>
                                </div>
      
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1 w-full">
                                    <h3 className="font-medium text-gray-900 truncate flex-1 mr-3">
                                      {(transaction.remark || transaction.type_text).slice(0, 8)}{(transaction.remark || transaction.type_text).length > 8 ? '...' : ''}
                                    </h3>
                                    <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'} flex-shrink-0 whitespace-nowrap`}>
                                      {isIncome ? '+' : '-'}{parseFloat(transaction.amount).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center w-full">
                                    <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                      {formatDate(date)} {time}
                                    </div>
                                    <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                      余额: {parseFloat(transaction.after_balance).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
      
                          {/* 3. 分页控件 */}
                          {totalFiltered > itemsPerPage && (
                            <div className="px-4 py-3 border-t border-gray-100 flex justify-center items-center space-x-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                上一页
                              </button>
                              <span className="text-sm text-gray-600">
                                第 {currentPage} / {Math.ceil(totalFiltered / itemsPerPage)} 页
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalFiltered / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalFiltered / itemsPerPage)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                下一页
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-xs text-gray-500">
        <p>交易记录保存期限为12个月</p>
      </div>
    </div>
  );
};

export default TransactionListPage;
