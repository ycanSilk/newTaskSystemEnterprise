'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CreditCardOutlined } from '@ant-design/icons';

interface BankCard {
  id: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  isDefault?: boolean;
}

export default function BankCardDetail() {
  const router = useRouter();
  const params = useParams();
  const [bankCard, setBankCard] = useState<BankCard | null>(null);
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  
  // 模拟获取银行卡数据
  useEffect(() => {
    // 在实际项目中，这里应该是一个API调用，获取银行卡详情
    const fetchBankCard = async () => {
      if (!params || typeof params.id !== 'string') {
        return;
      }
      // 模拟数据
      const mockCard: BankCard = {
        id: params.id,
        bankName: '招商银行',
        cardType: '储蓄卡',
        cardNumber: '6226 8888 8888 0280',
        isDefault: params.id === '1' // 假设ID为1的卡是bg-white卡
      };
      setBankCard(mockCard);
    };
    
    fetchBankCard();
  }, [params]);

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  // 切换显示完整卡号
  const toggleFullCardNumber = () => {
    setShowFullCardNumber(!showFullCardNumber);
  };

  // 解除绑定银行卡
  const handleUnbindCard = async () => {
    const confirmUnbind = window.confirm('确定要解除绑定这张银行卡吗？');
    
    if (confirmUnbind && bankCard) {
      try {
        // 在实际项目中，这里应该是一个API调用，删除银行卡绑定
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 删除成功后返回银行卡列表页
        alert('银行卡解除绑定成功');
        router.push('/publisher/bank-cards');
      } catch (error) {
        alert('银行卡解除绑定失败，请稍后再试');
        console.error('解除绑定银行卡失败:', error);
      }
    }
  };

  // 处理功能点击
  const handleFeatureClick = (feature: string) => {
    // 在实际项目中，这里应该根据不同功能跳转到相应页面
    alert(`跳转到${feature}页面`);
  };

  // 设置默认银行卡
  const handleSetDefaultCard = async () => {
    if (!bankCard) return;
    
    const confirmSetDefault = window.confirm(`确定要将${bankCard.bankName}${bankCard.cardType}设为默认银行卡吗？`);
    
    if (confirmSetDefault) {
      try {
        // 在实际项目中，这里应该是一个API调用，设置默认银行卡
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 设置成功后返回银行卡列表页
        alert('默认银行卡设置成功');
        router.push('/publisher/bank-cards');
      } catch (error) {
        alert('设置默认银行卡失败，请稍后再试');
        console.error('设置默认银行卡失败:', error);
      }
    }
  };

  if (!bankCard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>加载中...</div>
      </div>
    );
  }

  // 格式化卡号显示
  const formatCardNumber = (cardNumber: string) => {
    if (showFullCardNumber) {
      return cardNumber;
    }
    // 显示部分卡号，隐藏中间部分
    const lastFourDigits = cardNumber.slice(-4);
    return `**** **** **** ${lastFourDigits}`;
  };

  return (
    <div className="min-h-screen bg-white px-4">
      {/* 顶部导航 */}
      <div className="flex text-xl text-center items-center justify-center px-4 py-3 bg-white border-b border-gray-200">
        银行卡
      </div>

      {/* 银行卡卡片 */}
      <div className="mx-4 mt-4 rounded-lg bg-red-600 p-6 mb-10 text-white" style={{ height: 'calc(100% + 20%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="">
              <CreditCardOutlined className="h-7 w-7 text-white text-xl" />
            </div>
            <span className="ml-2 text-lg font-semibold">{bankCard.bankName} {bankCard.cardType}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">{formatCardNumber(bankCard.cardNumber)}</p>
          <button 
            className="rounded-lg bg-white/20 px-4 py-2 text-sm hover:bg-white/30"
            onClick={toggleFullCardNumber}
          >
            {showFullCardNumber ? '隐藏卡号' : '完整卡号'}
          </button>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="mt-4 divide-y divide-gray-200 mb-10">
        {/* 设置默认银行卡选项 - 如果不是默认卡才显示 */}
        {!bankCard.isDefault && (
          <div 
            className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
            onClick={handleSetDefaultCard}
          >
            <span className="text-blue-600 font-medium">设为默认银行卡</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* 如果是默认卡，显示默认标识 */}
        {bankCard.isDefault && (
          <div className="flex items-center justify-between px-4 py-4 rounded-lg hover:bg-gray-200">
            <span className="font-medium">默认银行卡</span>
            <span className=" text-xs px-2 py-1 rounded-full">已设置</span>
          </div>
        )}
        
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('还款')}
        >
          <span>还款</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('交易明细')}
        >
          <span>交易明细</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('支付限额查询')}
        >
          <span>支付限额查询</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 解除绑定选项 */}
      <div className="mt-4 px-4">
        <button 
          className="w-full rounded-lg border border-red-500 bg-white py-3 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          onClick={handleUnbindCard}
        >
          解除绑定银行卡
        </button>
      </div>

      {/* 底部链接 */}
      <div className="mt-8 flex justify-center px-4 text-sm text-gray-500">
        <div className="flex flex-col items-center">
          <div className="flex space-x-4">
            <a href="#" className="text-blue-500 hover:underline">联系客服</a>
          </div>
        </div>
      </div>
    </div>
  );
}