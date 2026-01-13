'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Card } from 'antd';

// 导入钱包余额和交易明细的类型定义
import { GetWalletBalanceResponse, WalletInfo, Transaction } from '@/app/types/paymentWallet/getWalletBalanceTypes';
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
  
  // 获取钱包余额和交易明细
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用新的钱包API端点
        const response = await fetch('/api/paymentWallet/getWalletBalance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

      
     
        
        if (!response.ok) {
          throw new Error(`获取钱包数据失败: ${response.status}`);
        }
        
        const walletData: ApiResponse<GetWalletBalanceResponse> = await response.json();
        console.log('获取钱包余额和交易明细响应:', walletData);
          console.log('获取钱包余额和交易明细响应:', walletData.data);
        if (walletData.code === 0 && walletData.success) {
          // 设置余额信息
          const walletInfo = walletData.data.wallet;
          setTotalBalance(parseFloat(walletInfo.balance) || 0);
          // 假设可用余额等于总余额，冻结余额为0，因为新API没有返回这些字段
          setBalance(parseFloat(walletInfo.balance) || 0);
          setFrozenBalance(0);
          
          // 设置交易记录，按创建时间排序（最新的在前）
          const sortedTransactions = [...walletData.data.transactions].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setTransactions(sortedTransactions);
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
  }, []);

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
    // 使用状态管理或localStorage传递数据
    localStorage.setItem('transactionData', JSON.stringify(transaction));
    router.push(`/publisher/balance/transactionDetails/${transaction.id}` as any);
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
                <div>{totalBalance}</div>
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
            // 根据当前tab过滤交易记录 - 显示最多20条最新记录
            <div>
              {/* 显示交易记录总数信息 */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="text-xs ">
                  共显示最新的 {transactions.filter(t => {
                    const isIncome = parseFloat(t.amount) > 0;
                    if (activeTab === 'recharge') return isIncome;
                    if (activeTab === 'withdraw') return !isIncome && parseFloat(t.amount) < 0;
                    return true;
                  }).length} 条记录
                </div>
              </div>
              
              {transactions
                .filter(transaction => {
                  // 判断是否为收入记录（金额大于0）
                  const isIncome = parseFloat(transaction.amount) > 0;
                  
                  // 根据当前activeTab进行过滤
                  if (activeTab === 'recharge') {
                    // 收入明细：只显示金额大于0的记录
                    return isIncome;
                  } else if (activeTab === 'withdraw') {
                    // 支出明细：只显示金额小于0的记录
                    return !isIncome && parseFloat(transaction.amount) < 0;
                  }
                  // 全部明细：显示所有记录
                  return true;
                })
                .map((transaction) => {
                  const iconInfo = getTransactionIcon();
                  const isIncome = parseFloat(transaction.amount) > 0;
                  const { date, time } = extractDateTime(transaction.created_at);
                  
                  return (
                    <div 
                      key={transaction.id}
                      onClick={() => handleViewTransaction(transaction)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50 flex items-center transition-colors duration-200 cursor-pointer"
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3 text-lg font-bold`}>
                        <span className={iconInfo.color}>{iconInfo.icon}</span>
                      </div>
                          
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 truncate max-w-[60%]">{transaction.remark || transaction.type_text}</h3>
                          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : ''}{parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs ">
                            {formatDate(date)} {time}
                          </div>
                          <div className="text-xs ">
                            余额: {parseFloat(transaction.after_balance).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-xs ">
        <div>
          <p>交易记录保存期限为12个月</p>
        </div>
      </div>
    </div>
  );
};

export default BalancePage;