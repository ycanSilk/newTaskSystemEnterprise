'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardOutlined } from '@ant-design/icons';
import { SimpleToast } from '../../../components/ui/SimpleToast';
// 定义银行卡数据接口
interface BankCard {
  id: string;
  bankName: string;
  cardNumber: string;
  cardType: string;
  icon: string;
  bgColor: string;
  hasActivity?: boolean;
  canCheckBalance?: boolean;
  isDefault?: boolean;
}

export default function BankCardsPage() {
  const router = useRouter();
  
  // 模拟银行卡数据 - 更新为与图片匹配的数据
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  
  // 控制设置默认卡的模式是否激活
  const [isSettingDefaultMode, setIsSettingDefaultMode] = useState(false);
  // 存储用户选择的银行卡ID
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // 控制成功提示框的显示
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initialCards: BankCard[] = [
      {
        id: '1',
        bankName: '邮储银行',
        cardNumber: '6226 **** **** **** 0541',
        cardType: '储蓄卡',
        icon: '🏦',
        bgColor: 'bg-green-800',
        hasActivity: true,
        isDefault: true // 设置为默认银行卡
      },
      {
        id: '2',
        bankName: '招商银行',
        cardNumber: '6225 **** **** **** 0280',
        cardType: '信用卡',
        icon: '💼',
        bgColor: 'bg-red-800'
      },
      {
        id: '3',
        bankName: '中国银行',
        cardNumber: '6216 **** **** **** 8934',
        cardType: '储蓄卡',
        icon: '🏛️',
        bgColor: 'bg-red-800',
        hasActivity: true,
        canCheckBalance: true
      },
      {
        id: '4',
        bankName: '广发银行',
        cardNumber: '6225 **** **** **** 4673',
        cardType: '储蓄卡',
        icon: '🏢',
        bgColor: 'bg-red-800'
      },
      {
        id: '5',
        bankName: '招商银行',
        cardNumber: '6225 **** **** **** 1593',
        cardType: '储蓄卡',
        icon: '💼',
        bgColor: 'bg-red-800'
      }
    ];
  
    setBankCards(initialCards);
  }, []);
  
  // 跳转到银行卡详情页
  const viewCardDetails = (cardId: string) => {
    router.push(`/publisher/bank-cards/bank-cardlist/${cardId}`);
  };

  // 跳转到添加银行卡页面
  const navigateToBindCard = () => {
    router.push('/publisher/bind-bank-card');
  };

  // 打开设置默认卡模式
  const startSettingDefaultMode = () => {
    // 获取当前默认卡ID作为初始选择
    const currentDefault = bankCards.find(card => card.isDefault);
    setSelectedCardId(currentDefault?.id || null);
    setIsSettingDefaultMode(true);
  };
  
  // 关闭设置默认卡模式
  const cancelSettingDefaultMode = () => {
    setIsSettingDefaultMode(false);
    setSelectedCardId(null);
  };
  
  // 选择银行卡
  const selectCard = (cardId: string) => {
    setSelectedCardId(cardId);
  };
  
  // 确认设置默认银行卡
  const confirmSetDefaultCard = () => {
    if (!selectedCardId) return;
    
    setBankCards(prevCards => 
      prevCards.map(card => ({
        ...card,
        isDefault: card.id === selectedCardId
      }))
    );
    
    // 在实际项目中，这里应该调用API更新默认银行卡设置
    console.log(`设置银行卡 ${selectedCardId} 为默认银行卡`);
    
    // 显示成功提示框
    setShowSuccessToast(true);
    
    // 退出设置模式
    setIsSettingDefaultMode(false);
    setSelectedCardId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center h-16 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600"
            aria-label="返回"
          >
            <div className="">
              <CreditCardOutlined className="h-7 w-7 text-white text-xl" />
            </div>
          </button>
          <h1 className="flex-1 text-center text-lg font-medium text-gray-800">银行卡</h1>
          <button
            className="p-2 -mr-2 text-gray-600"
            aria-label="更多选项"
          >
            <div className="">
              <CreditCardOutlined className="h-7 w-7 text-white text-xl" />
            </div>
          </button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="px-10 py-3">
        {/* 银行卡列表 */}
        <div className="space-y-4">
          {bankCards.map((card) => (
            <div key={card.id} className="w-full rounded-xl overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg">
              {/* 银行卡卡片 */}
              <button
                onClick={() => isSettingDefaultMode ? selectCard(card.id) : viewCardDetails(card.id)}
                className={`w-full ${card.bgColor} p-5 text-white relative overflow-hidden text-left transition-all ${isSettingDefaultMode ? 'cursor-pointer' : 'hover:shadow-md'}`}
                aria-label={`查看${card.bankName}${card.cardType}详情`}
              >
                {/* 银行Logo和名称 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex">
                    <CreditCardOutlined className="h-7 w-7 text-white text-xl mr-2" />
                    <div>
                      <h3 className="text-xl font-medium text-left">{card.bankName}</h3>
                      <p className="text-xs text-left">{card.cardType}</p>
                    </div>
                  </div>
                  {/* 默认银行卡标识 */}
                  {card.isDefault && (
                    <span className="bg-white/50 text-white text-xs px-3 py-1 rounded-lg absolute top-4 right-5">默认</span>
                  )}
                </div>
                
                {/* 卡号 */}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium tracking-wider">{card.cardNumber}</p>
                </div>
                
                {/* 单选框 - 仅在设置默认卡模式下显示 */}
                {isSettingDefaultMode && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCardId === card.id ? 'border-blue-500 bg-blue-500' : 'border-white'}`}>
                      {selectedCardId === card.id && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* 设置默认银行卡按钮区域 */}
        {!isSettingDefaultMode ? (
          <div className="mt-6">
            <button
              onClick={startSettingDefaultMode}
              className="w-full py-4 bg-white rounded-xl shadow-sm flex items-center justify-center space-x-2 font-medium transition-colors hover:bg-blue-500 hover:text-white"
            >
              <span>设置默认银行卡</span>
            </button>
          </div>
        ) : (
          // 设置模式下显示保存和取消按钮
          <div className="mt-6 space-y-4">
            <button
              onClick={confirmSetDefaultCard}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium transition-colors"
              disabled={!selectedCardId}
            >
              保存
            </button>
            <button
              onClick={cancelSettingDefaultMode}
              className="w-full py-4 bg-white border border-gray-300 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
          </div>
        )}

        {/* 添加银行卡按钮 */}
        {!isSettingDefaultMode && (
          <div className="mt-6">
              <button
                onClick={navigateToBindCard}
                className="w-full py-4 bg-white rounded-xl shadow-sm flex items-center justify-center space-x-2  font-medium transition-colors hover:bg-blue-500 hover:text-white"
              >
                <span className="text-lg">+</span>
                <span>添加银行卡</span>
              </button>
          </div> 
        )}
      </div>
        
         {/* 成功提示框 */}
        {showSuccessToast && (
          <SimpleToast
            message="默认银行卡设置成功"
            type="success"
            onClose={() => setShowSuccessToast(false)}
            duration={3000}
          />
        )}
    </div>
    
  
  );
}