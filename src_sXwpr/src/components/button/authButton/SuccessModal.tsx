import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  redirectUrl?: string;
}

/**
 * 注册成功提示框组件
 * 用于显示操作成功信息并提供确认按钮进行页面跳转
 * 添加了3秒自动跳转功能
 */
export default function SuccessModal({ 
  isOpen, 
  onClose, 
  title = '', 
  message = '', 
  buttonText = '', 
  redirectUrl = '' 
}: SuccessModalProps) {
  const router = useRouter();

  const handleConfirm = useCallback(() => {
    onClose();
    if (redirectUrl) {
      router.push(redirectUrl as any);
    }
  }, [onClose, redirectUrl, router]);

  // 登录成功3秒后自动跳转
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && redirectUrl) {
      timer = setTimeout(() => {
        handleConfirm();
      }, 3000); // 3秒后自动跳转
    }
    
    // 清理函数，防止内存泄漏
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen, redirectUrl, handleConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={handleConfirm}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}