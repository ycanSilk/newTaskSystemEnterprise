'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Card } from 'antd';

// 导入钱包余额和交易明细的类型定义
import { GetWalletBalanceResponseData, GetWalletBalanceResponse, WalletInfo, Transaction } from '@/app/types/paymentWallet/getWalletBalanceTypes';
// 导入通用API响应类型
import { ApiResponse } from '@/api/types/common';

const BalancePage = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(0.00);
  const [frozenBalance, setFrozenBalance] = useState(0.00);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [totalBalance, setTotalBalance] = useState(0.00);
  const [latestBalanceStr, setLatestBalanceStr] = useState('0.00');
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const itemsPerPage = 20;

  // 获取钱包余额和交易明细
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 构建API请求参数
        let apiUrl = `/api/paymentWallet/getWalletBalance?page=${currentPage}&page_size=${itemsPerPage}`;
        // 根据当前标签页添加type参数
        if (activeTab === 'recharge') {
          apiUrl += '&type=1'; // 收入
        } else if (activeTab === 'withdraw') {
          apiUrl += '&type=2'; // 支出
        }

        console.log('API请求URL:', apiUrl);

        // 调用新的钱包API端点，添加分页参数和type参数
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`获取钱包数据失败: ${response.status}`);
        }

        const walletData: ApiResponse<GetWalletBalanceResponseData> = await response.json();
        console.log('获取钱包余额和交易明细响应:', walletData);
        console.log('获取钱包余额和交易明细响应:', walletData.data);
        if (walletData.code === 0 && walletData.success) {
          // 设置交易记录，按创建时间排序（最新的在前）
          const sortedTransactions = [...walletData.data.transactions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setTransactions(sortedTransactions);
          
          // 设置余额信息
          const walletInfo = walletData.data.wallet;
          // 直接使用钱包信息中的balance作为总余额，而不是使用交易记录的after_balance
          const latestBalance = parseFloat(walletInfo.balance) || 0;
          setTotalBalance(latestBalance);
          // 存储最新余额的字符串格式
          setLatestBalanceStr(walletInfo.balance);
          // 假设可用余额等于总余额，冻结余额为0，因为新API没有返回这些字段
          setBalance(latestBalance);
          setFrozenBalance(0);
          
          // 更新分页信息
          if (walletData.data.pagination) {
            setTotalPages(walletData.data.pagination.total_pages || 1);
            setTotalTransactions(walletData.data.pagination.total || 0);
          }
        } else {
          throw new Error(walletData.message || '获取钱包数据失败');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [currentPage, itemsPerPage, activeTab]);

  // 当activeTab变化时，重置当前页码到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // 格式化日期
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

  // 获取交易类型对应的图标和颜色 - 统一使用￥符号和黄色背景
  const getTransactionIcon = () => {
    return {
      icon: '￥',
      color: 'text-white',
      bgColor: 'bg-yellow-500'
    };
  };

  // 处理充值
  const handleRecharge = () => {
    router.push('/publisher/recharge' as any);
  };



  // 处理查看交易详情，传递完整交易记录数据
  const handleViewTransaction = (transaction: Transaction) => {
    // 通过URL参数传递数据
    const transactionDataStr = encodeURIComponent(JSON.stringify(transaction));
    router.push(`/publisher/balance/transactionDetails/${transaction.id}?data=${transactionDataStr}` as any);
  };

  // 从created_at中提取日期和时间
  const extractDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  };

  // 处理查看资金流水
  const handleViewAllTransactions = () => {
    router.push('/publisher/balance/transactionList' as any);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 余额卡片 */}
      <div className="p-2 mt-3 relative">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="absolute left-0 bottom-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
          <div className="p-2 relative z-10 ">
            <div className="mb-10 grid grid-cols-1 gap-2">
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>余额:</div>
                <div>{latestBalanceStr}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRecharge}
                className="bg-blue-700 text-white flex-1 border-none rounded-full"
              >
                充值
              </Button>
              <Button
                onClick={handleViewAllTransactions}
                className="bg-blue-700 text-white flex-1 border-none rounded-full"
              >
                全部明细
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
              {/* 直接使用API返回的交易记录（后端已过滤和分页） */}
              {(() => {
                // 直接使用API返回的交易记录
                const paginatedTransactions = transactions;
                const totalFiltered = transactions.length;

                return (
                  <>
                    {/* 显示交易记录总数信息 */}
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                      <div className="text-xs ">
                        共 {totalTransactions} 条记录，当前显示第 {currentPage} 页
                      </div>
                    </div>

                    {/* 交易记录列表 */}
                    {paginatedTransactions.map((transaction) => {
                      const iconInfo = getTransactionIcon();
                      // 根据type字段判断交易类型
                      const isIncome = Number(transaction.type) === 1;
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
                                {isIncome ? '+' : '-'}{transaction.amount}
                              </span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                              <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                {formatDate(date)} {time}
                              </div>
                              <div className="text-xs flex-shrink-0 whitespace-nowrap">
                                余额: {transaction.after_balance}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 3. 分页控件 */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-4">
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            上一页
                          </button>
                          <span className="px-4 py-2 text-gray-700 font-medium">
                            第 {currentPage} / {totalPages} 页
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            下一页
                          </button>
                        </nav>
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
      <div className="px-4 py-4 text-center text-xs ">
        <div>
          <p>显示近30天内的记录</p>
        </div>
      </div>
    </div>
  );
};

export default BalancePage;