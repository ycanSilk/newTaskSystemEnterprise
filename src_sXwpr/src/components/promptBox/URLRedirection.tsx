'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// 定义组件props类型
interface URLRedirectionProps {
  /**
   * 是否显示弹窗
   */
  isOpen: boolean;
  
  /**
   * 提示语句
   */
  message: string;
  
  /**
   * 确认按钮文字
   */
  buttonText?: string;
  
  /**
   * 关闭按钮文字
   */
  cancelButtonText?: string;
  
  /**
   * 跳转URL
   */
  redirectUrl: string;
  
  /**
   * 关闭弹窗的回调函数
   */
  onClose: () => void;
}

/**
 * URL重定向提示框组件
 * 用于显示提示信息，并在用户确认后跳转到指定URL
 */
export default function URLRedirection({ 
  isOpen, 
  message, 
  buttonText = '确认', 
  cancelButtonText = '取消', 
  redirectUrl, 
  onClose 
}: URLRedirectionProps) {
  const router = useRouter();
  
  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null;
  
  /**
   * 处理确认按钮点击事件
   * 调用onClose回调，然后跳转到指定URL
   */
  const handleConfirm = () => {
    // 先调用关闭回调
    onClose();
    // 跳转到指定URL
    window.location.href = redirectUrl;
  };
  
  return (
    // 半透明背景，点击背景可以关闭弹窗
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
      onClick={onClose}
    >
      {/* 弹窗内容，点击弹窗内部不关闭弹窗 */}
      <div 
        className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 提示信息 */}
        <div className="mb-6 text-center">
          <div className="text-gray-700 text-lg font-medium mb-2">提示</div>
          <div className="text-gray-600">{message}</div>
        </div>
        
        {/* 按钮区域 */}
        <div className="flex justify-center space-x-4">
          {/* 关闭按钮 */}
          <button
            type="button"
            className="py-2 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
          {/* 确认按钮 */}
          <button
            type="button"
            className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            onClick={handleConfirm}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
