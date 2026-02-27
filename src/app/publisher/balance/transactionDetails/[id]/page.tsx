'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from 'antd';

// 导入交易记录类型定义
import { Transaction } from '@/app/types/paymentWallet/getWalletBalanceTypes';

const TransactionDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // 从URL查询参数中获取交易记录数据
  useEffect(() => {
    const fetchTransactionDetail = () => {
      try {
        setLoading(true);
        
        // 从URL查询参数中获取交易记录数据
        const transactionDataStr = searchParams.get('data');
        console.log('transactionDataStr from URL:', transactionDataStr);
        
        if (transactionDataStr) {
          // 解析JSON字符串
          const transactionData: Transaction = JSON.parse(decodeURIComponent(transactionDataStr));
          console.log('transactionData:', transactionData);
          setTransaction(transactionData);
        } else {
          setTransaction(null);
        }
      } catch (error) {
        console.error('解析交易详情失败:', error);
        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionDetail();
  }, [searchParams]);
  
  // 格式化日期时间
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  // 格式化提现方式显示
  const formatWithdrawMethod = (method: string): string => {
    switch (method.toLowerCase()) {
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信';
      default:
        return method;
    }
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <h3 className="text-lg font-medium text-gray-800">加载中...</h3>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">❌</div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">交易不存在</h3>
          <p className=" text-sm mb-4">未找到对应的交易记录</p>
          <Button onClick={handleBack} className="mt-2">返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* 主要内容 */}
      <div className="px-4 py-4">
        <Card className="shadow-sm border-0 rounded-xl">
          <div className="py-6 px-2">
            {/* 交易类型图标和名称 */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-amber-200 flex items-center justify-center mb-3">
                <span className="text-4xl text-amber-500">¥</span>
              </div>
              <h2 className="">
                <span className={`text-3xl font-bold ${parseFloat(transaction.amount.replace(',', '')) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(transaction.amount.replace(',', '')) > 0 ? '+' : ''}{parseFloat(transaction.amount.replace(',', '')).toFixed(2)}
              </span>
              </h2>
            </div>

  

            {/* 交易信息列表 */}
            <div className="space-y-4">
              {/* 交易时间 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易时间</span>
                <span className="">{transaction.created_at}</span>
              </div>

              {/* 交易类型 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易类型</span>
                <span className="">{transaction.type_text || '-'}</span>
              </div>

              {/* 交易金额 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易金额</span>
                <span className="">{transaction.amount}</span>
              </div>

              {/* 交易前余额 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易前余额</span>
                <span className="">{transaction.before_balance || '-'}</span>
              </div>

              {/* 交易后余额 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易后余额</span>
                <span className="">{transaction.after_balance || '-'}</span>
              </div>

              {/* 关联ID */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">订单号</span>
                <span className="">{transaction.related_id || '-'}</span>
              </div>

              {/* 备注 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">备注</span>
                <span className="">{transaction.remark || '-'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetailPage;