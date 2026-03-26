import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface GlobalWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  buttonText?: string;
  redirectUrl?: string;
  showIcon?: boolean;
  iconType?: 'success' | 'error' | 'warning' | 'info';
}

/**
 * 全局通用提示框组件
 * 用于显示各种操作的提示信息并提供确认按钮进行页面跳转
 */
export default function GlobalWarningModal({ 
  isOpen, 
  onClose, 
  message = '', 
  buttonText = '', 
  redirectUrl = '',
  showIcon = true,
  iconType = 'info'
}: GlobalWarningModalProps) {
  const router = useRouter();

  const handleConfirm = useCallback(() => {
    onClose();
    if (redirectUrl) {
      router.push(redirectUrl as any);
    }
  }, [onClose, redirectUrl, router]);

  if (!isOpen) return null;

  // 根据iconType获取对应的样式和图标
  const getIconConfig = () => {
    switch (iconType) {
      case 'success':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-500',
          path: 'M5 13l4 4L19 7'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-500',
          path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.933-1.964-.933-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-500',
          path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.933-1.964-.933-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        };
      default: // info
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-500',
          path: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          {showIcon && (
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${iconConfig.bgColor} ${iconConfig.textColor} mb-4`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconConfig.path} />
              </svg>
            </div>
          )}
          {message && <p className="text-gray-600 mb-6">{message}</p>}
          <button
            onClick={handleConfirm}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {buttonText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
}