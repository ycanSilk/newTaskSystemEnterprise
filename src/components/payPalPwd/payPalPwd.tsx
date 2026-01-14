'use client';

import React, { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

interface PaymentPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading: boolean;
}

/**
 * 支付密码模态框组件
 * 可复用的支付密码输入组件，用于需要支付确认的场景
 * @param {PaymentPasswordModalProps} props - 组件属性
 * @returns {JSX.Element} 支付密码模态框组件
 */
const PaymentPasswordModal: React.FC<PaymentPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading 
}) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /**
   * 处理密码提交
   * 验证密码格式，调用外部提交回调
   */
  const handleSubmit = () => {
    if (!password) {
      setPasswordError('请输入支付密码');
      return;
    }
    if (password.length !== 6) {
      setPasswordError('支付密码必须为6位数字');
      return;
    }
    if (!/^\d+$/.test(password)) {
      setPasswordError('支付密码必须为数字');
      return;
    }
    setPasswordError('');
    onSubmit(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 z-50">
        <h3 className="text-lg font-bold text-gray-800 mb-4">输入支付密码</h3>
        <p className="text-sm text-gray-600 mb-4">请输入您的6位数字支付密码以确认操作</p>
        
        <div className="mb-4">
          <input
            type="password"
            placeholder="请输入6位支付密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              passwordError ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={6}
            autoFocus
          />
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingOutlined className="animate-spin mr-2" />
                提交中...
              </div>
            ) : (
              '确认'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPasswordModal;
