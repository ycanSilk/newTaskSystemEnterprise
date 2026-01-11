'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Card } from 'antd';

// 交易记录类型定义
interface TransactionRecord {
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
  totalBalance: number,
  totalIncome: number,
}

// 交易响应类型定义
interface TransactionResponse {
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

//钱包信息接口定义
interface WalletInfoInfo {
  userId: string,
  totalBalance: number,
  availableBalance: number,
  frozenBalance: number,
  totalIncome: number,
  totalExpense: number,
  status: string,
  currency: string,
  createTime: string
}
// 钱包信息类型定义
  interface WalletInfoResponse {
    code: number;
    message: string;
    data: {
      userId: string,
      totalBalance: number,
      availableBalance: number,
      frozenBalance: number,
      totalIncome: number,
      totalExpense: number,
      status: string,
      currency: string,
      createTime: string
    };
    success: boolean;
    timestamp: number;
  }

const BalancePage = () => {
  const router = useRouter();
  const [balance, setBalance] = useState(0.00);
  const [frozenBalance, setFrozenBalance] = useState(0.00);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [totalBalance, setTotalBalance] = useState(0.00);
  // 合并获取钱包信息和交易记录
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 首先调用获取钱包信息API
        const walletResponse = await fetch('/api/walletmanagement/getwalletinfo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!walletResponse.ok) {
          throw new Error(`获取钱包信息失败: ${walletResponse.status}`);
        }
        const walletData: WalletInfoResponse = await walletResponse.json();       
        if (walletData.code === 200 && walletData.success && walletData.data) {
          // 设置余额、冻结金额和总余额
          setBalance(walletData.data.availableBalance || 0);
          setFrozenBalance(walletData.data.frozenBalance || 0);
          setTotalBalance(walletData.data.totalBalance || 0);
        } else {
          throw new Error(walletData.message || '获取钱包信息失败');
        }
        
        // 然后调用获取交易记录API
        const transactionResponse = await fetch('/api/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: '',
            transactionType: '',
            status: '',
            startDate: '',
            endDate: '',
            page: 1,
            size: 50 // 请求更多数据以便前端进行筛选
          })
        });
        
        if (transactionResponse.ok) {
          const transactionData: TransactionResponse = await transactionResponse.json();
          
          if (transactionData.code === 200 && transactionData.success && transactionData.data) {
            // 确保交易记录按创建时间排序（最新的在前）
            const sortedTransactions = [...transactionData.data.list].sort((a, b) => 
              new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            );
            // 只保留最新的20条记录
            const latestTransactions = sortedTransactions.slice(0, 20);
            setTransactions(latestTransactions);
          } else {
            console.warn('获取交易记录失败:', transactionData.message);
          }
        } else {
          console.warn('获取交易记录失败:', transactionResponse.status);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  const handleViewTransaction = (transaction: TransactionRecord) => {
    // 使用状态管理或localStorage传递数据
    localStorage.setItem('transactionData', JSON.stringify(transaction));
    router.push(`/publisher/balance/transactionDetails/${transaction.orderNo}` as any);
  };

  // 从createTime中提取日期和时间
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
            <div className="mb-10 grid grid-cols-3 gap-2">
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>总余额:</div>
                <div>{totalBalance}</div>
              </div>
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>可用余额:</div>
                <div>{balance.toFixed(2)}</div>
              </div>
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>冻结余额:</div>
                <div>{frozenBalance.toFixed(2)}</div>
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
                    const isIncome = t.amount > 0;
                    if (activeTab === 'recharge') return isIncome;
                    if (activeTab === 'withdraw') return !isIncome && t.amount < 0;
                    return true;
                  }).length} 条记录
                </div>
              </div>
              
              {transactions
                .filter(transaction => {
                  // 判断是否为收入记录（金额大于0）
                  const isIncome = transaction.amount > 0;
                  
                  // 根据当前activeTab进行过滤
                  if (activeTab === 'recharge') {
                    // 收入明细：只显示金额大于0的记录
                    return isIncome;
                  } else if (activeTab === 'withdraw') {
                    // 支出明细：只显示金额小于0的记录
                    return !isIncome && transaction.amount < 0;
                  }
                  // 全部明细：显示所有记录
                  return true;
                })
                // 移除slice(0, 10)限制，因为我们在API请求后已经限制了最多20条最新记录
                .map((transaction) => {
                  const iconInfo = getTransactionIcon();
                  const isIncome = transaction.amount > 0;
                  const { date, time } = extractDateTime(transaction.createTime);
                  
                  return (
                    <div 
                      key={transaction.orderNo}
                      onClick={() => handleViewTransaction(transaction)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50 flex items-center transition-colors duration-200 cursor-pointer"
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3 text-lg font-bold`}>
                        <span className={iconInfo.color}>{iconInfo.icon}</span>
                      </div>
                         
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 truncate max-w-[60%]">{transaction.description || transaction.typeDescription}</h3>
                          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : ''}{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs ">
                            {formatDate(date)} {time}
                          </div>
                          <div className="text-xs ">
                            余额: {transaction.afterBalance.toFixed(2)}
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