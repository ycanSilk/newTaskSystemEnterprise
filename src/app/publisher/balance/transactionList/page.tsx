'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

// 后端API返回的数据格式定义
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
}

interface TransactionRecordData {
  list: TransactionRecord[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface TransactionRecordResponse {
  code: number;
  message: string;
  data: TransactionRecordData;
  success: boolean;
  timestamp: number;
}

// 前端使用的交易记录类型
interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  date: string;
  time: string;
  description: string;
  orderId?: string;
  status: string;
  statusDescription: string;
  transactionNumber: string;
}

const TransactionListPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const isIncome = (transaction: Transaction) => transaction.amount > 0;
  // 从后端API获取交易记录
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionType: '', // 默认为空，获取所有类型
            status: '',
            page: 1,
            size: 100, // 获取足够多的数据，以便前端进行筛选
          }),
        });
        
        if (!response.ok) {
          throw new Error('获取交易记录失败');
        }
        
        const data: TransactionRecordResponse = await response.json();
        
        if (data.code === 200 && data.success) {
          // 将后端返回的数据转换为前端使用的格式
          const formattedTransactions = data.data.list.map(record => {
            const dateTime = new Date(record.createTime);
            const date = dateTime.toISOString().split('T')[0];
            const time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
            
            return {
              id: record.orderNo,
              type: record.transactionType,
              amount: record.amount,
              balanceAfter: record.afterBalance,
              date: date,
              time: time,
              description: record.description,
              orderId: record.orderNo,
              status: record.status,
              statusDescription: record.statusDescription,
              transactionNumber: record.orderNo,
            };
          });
          
          setTransactions(formattedTransactions);
        } else {
          throw new Error(data.message || '获取交易记录失败');
        }
      } catch (error) {
        console.error('获取交易记录失败:', error);
        setError(error instanceof Error ? error.message : '获取交易记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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

  // 获取交易类型对应的图标和颜色
  const getTransactionIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      recharge: {
        icon: <ArrowUpOutlined className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      withdraw: {
        icon: <ArrowDownOutlined className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      rental_payment: {
        icon: <CreditCardOutlined className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      rental_income: {
        icon: <WalletOutlined className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      platform_fee: {
        icon: <InfoCircleOutlined className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      refund: {
        icon: <UndoOutlined className="h-4 w-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    };
    return iconMap[type] || {
      icon: <InfoCircleOutlined className="h-4 w-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  // 获取交易类型对应的中文名称
  const getTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      withdraw: '提现',
      rental_payment: '租赁支付',
      rental_income: '租赁收入',
      platform_fee: '平台服务费',
      refund: '退款'
    };
    return typeMap[type] || type;
  };

  // 获取状态对应的中文名称和颜色
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      completed: { text: '已完成', color: 'text-green-600' },
      pending: { text: '待处理', color: 'text-orange-600' },
      failed: { text: '失败', color: 'text-red-600' },
      processing: { text: '处理中', color: 'text-blue-600' }
    };
    return statusMap[status] || { text: status, color: 'text-gray-600' };
  };

  // 处理查看交易详情
  const handleViewTransaction = (transactionId: string) => {
    router.push(`/publisher/balance/transactionDetails/${transactionId}`);
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
     
      {/* 交易记录 */}
      <div className="mt-3 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-sm">全部明细</TabsTrigger>
              <TabsTrigger value="recharge" className="text-sm">收入明细</TabsTrigger>
              <TabsTrigger value="withdraw" className="text-sm">支出明细</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 交易记录列表 */}
        <div>
          {loading ? (
            // 加载状态
            <div className="space-y-4 px-4 py-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center py-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                </div>
              ))}
            </div>
          ) : error ? (
            // 错误状态
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">获取交易记录失败</h3>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">
                重试
              </Button>
            </div>
          ) : (
            // 筛选当前标签页对应的交易记录
            <div>
              {activeTab === 'all' && transactions.length === 0 ? (
                // 空状态 - 全部明细
                <div className="py-12 px-4 text-center">
                  <div className="text-5xl mb-3">📝</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">暂无交易记录</h3>
                  <p className="text-gray-500 text-sm mb-4">您还没有任何交易记录</p>
                </div>
              ) : activeTab === 'recharge' && transactions.filter(t => t.amount > 0).length === 0 ? (
                // 空状态 - 充值记录
                <div className="py-12 px-4 text-center">
                  <div className="text-5xl mb-3">💰</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">暂无充值记录</h3>
                  <p className="text-gray-500 text-sm mb-4">您还没有充值过</p>
                </div>
              ) : activeTab === 'withdraw' && transactions.filter(t => t.amount < 0).length === 0 ? (
                // 空状态 - 支出记录
                <div className="py-12 px-4 text-center">
                  <div className="text-5xl mb-3">💳</div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">暂无支出记录</h3>
                  <p className="text-gray-500 text-sm mb-4">您还没有支出记录</p>
                </div>
              ) : (
                // 交易记录列表
                <div>
                  {activeTab === 'all' && (
                    transactions.map((transaction) => {
                      
                      return (
                        <div 
                          key={transaction.id}
                          className="px-4 py-3 border-b border-gray-300 hover:bg-blue-100 flex items-center "
                          onClick={() => handleViewTransaction(transaction.id)}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isIncome(transaction) ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            ￥
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                              <span className={`font-medium px-2 py-0.5 rounded ${isIncome(transaction) ? 'text-green-500' : 'text-red-500'}`}>
                                {isIncome(transaction) ? '+' : ''}{transaction.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                {formatDate(transaction.date)} {transaction.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {activeTab === 'recharge' && (
                    transactions.filter(transaction => transaction.amount > 0).map((transaction) => {
                      return (
                        <div 
                          key={transaction.id}
                          className="px-4 py-3 border-b border-gray-300 hover:bg-blue-100 flex items-center "
                          onClick={() => handleViewTransaction(transaction.id)}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isIncome(transaction) ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            ￥
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                              <span className="font-medium px-2 py-0.5 rounded  text-green-500">
                                +{transaction.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                {formatDate(transaction.date)} {transaction.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {activeTab === 'withdraw' && (
                    transactions.filter(transaction => transaction.amount < 0).map((transaction) => {
                      return (
                        <div 
                          key={transaction.id}
                          className="px-4 py-3 border-b border-gray-300 hover:bg-blue-100 flex items-center "
                          onClick={() => handleViewTransaction(transaction.id)}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${isIncome(transaction) ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                            ￥
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                              <span className="font-medium px-2 py-0.5 rounded text-red-500">
                                {transaction.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                {formatDate(transaction.date)} {transaction.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
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
