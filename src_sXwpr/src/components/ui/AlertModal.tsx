'use client';

import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  onButtonClick?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  buttonText = '我知道了',
  onClose,
  onButtonClick,
}) => {
  if (!isOpen) return null;

  // 禁用点击背景自动关闭，只允许通过按钮关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 空实现，不执行任何操作
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-sm mx-auto transform transition-all duration-300">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-3 text-base">{message}</p>
          <button
            onClick={handleButtonClick}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-blue-600 active:bg-blue-700 transition-all duration-300 w-full shadow-md hover:shadow-lg"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;