'use client';
import React, { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const SetPaymentPasswordPage: React.FC = () => {
  const router = useRouter();
  
  // 简单直接的状态管理
  const [securityPassword, setSecurityPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 输入处理函数 - 只保留必要功能
  const handleSecurityPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSecurityPassword(value);
    if (errors.securityPassword) setErrors({ ...errors, securityPassword: '' });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setConfirmPassword(value);
    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!securityPassword) newErrors.securityPassword = '请输入支付密码';
    else if (securityPassword.length !== 6) newErrors.securityPassword = '支付密码长度必须为6个字符';
    
    if (!confirmPassword) newErrors.confirmPassword = '请确认支付密码';
    else if (confirmPassword !== securityPassword) newErrors.confirmPassword = '两次输入的密码不一致';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 简化的表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || loading) return;
    
    setLoading(true);
    
    try {
      // 直接使用表单数据对象
      const data = { securityPassword, confirmPassword };
      
      // 直接调用API
      const response = await fetch('/api/walletmanagement/setpaymentpwd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('支付密码设置成功！');
        router.back();
      } else {
        alert(result.message || '设置失败，请重试');
      }
    } catch (error) {
      console.error('请求错误:', error);
      alert('网络请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            {/* 安全密码输入框 */}
            <div className="mb-6">
              <label htmlFor="securityPassword" className="block text-sm font-medium text-gray-700 mb-1">
                支付密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="securityPassword"
                  name="securityPassword"
                  value={securityPassword}
                  onChange={handleSecurityPasswordChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.securityPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="请设置6位数字支付密码"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.securityPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.securityPassword}</p>
              )}
            </div>

            {/* 确认密码输入框 */}
            <div className="mb-8">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="请再次输入支付密码"
                  autoComplete="off"
                />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 安全提示 */}
            <div className="bg-red-50 p-3 rounded-md mb-6">
              <p className="text-xs text-red-700">
                支付密码用于保护您的资金安全，请妥善保管，不要向他人透露
              </p>
            </div>

            {/* 提交按钮 - 优化状态管理和交互 */}
            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? '设置中...' : '确认设置'}
              </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SetPaymentPasswordPage;