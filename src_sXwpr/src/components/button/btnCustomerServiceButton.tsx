'use client';
import { useState, useRef } from 'react';

interface CustomerServiceButtonProps {
  // 可以根据需要添加更多props，使组件更灵活
  className?: string;
  buttonText?: string;
  modalTitle?: string;
  CustomerServiceId?: string;
  chatUrl?: string;
  size?: number;
}

export const BtnCustomerServiceButton: React.FC<CustomerServiceButtonProps> = ({
  className = '',
  buttonText = '联系客服',
  CustomerServiceId = 'kefu',
  chatUrl = 'https://kefu.kktaskpaas.com/chatIndex?kefu_id=kefu',
  size = 32
}) => {
  // 打开客服聊天页面
  const openChatWindow = () => {
    // 构建完整的聊天URL
    const fullChatUrl = `https://kefu.kktaskpaas.com/chatIndex?kefu_id=${CustomerServiceId}`;
    // 在新窗口中打开客服聊天页面
    window.open(fullChatUrl, '_blank', 'width=800,height=600,top=100,left=100');
  };

  return (
    <>
      {/* 客服按钮 */}
      <button 
        onClick={openChatWindow} 
        className={` ${className}`}
        aria-label="联系客服"
      >
          {buttonText}
      </button>
    </>
  );
};