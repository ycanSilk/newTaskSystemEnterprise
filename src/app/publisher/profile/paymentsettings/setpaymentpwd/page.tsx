'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// 导入设置支付密码的请求类型
import { SetWalletPwdRequest } from '../../../../../app/types/paymentWallet/setPaymentPwdTypes';
// 导入Toast hook，用于显示操作结果
import { useToast } from '@/components/ui/Toast';


const SetPaymentPasswordPage: React.FC = () => {
  const router = useRouter();
  // 使用useToast hook获取toast功能
  const { addToast } = useToast();
  
  // 简单直接的状态管理
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 输入处理函数 - 只保留必要功能
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPassword(value);
    if (errors.password) setErrors({ ...errors, password: '' });
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!password) {
      newErrors.password = '请输入支付密码';
    } else if (password.length !== 6) {
      newErrors.password = '支付密码长度必须为6个字符';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 简化的表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || loading) return;
    
    setLoading(true);
    
    try {
      // 创建符合API要求的数据结构
      const data: SetWalletPwdRequest = { password };
      
      // 调用新的API端点，使用fetch API
      const response = await fetch('/api/paymentWallet/setPaymentPwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 包含cookie
        body: JSON.stringify(data)
      });
      
      // 解析响应数据
      const result = await response.json();
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(result.message || '支付密码设置失败，请重试');
      }
      
      // 使用addToast提示成功
      addToast({ title: '设置成功', message: '支付密码设置成功！', type: 'success' });
      // 延迟返回上一页，确保toast提示显示
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('请求错误:', error);
      
      // 使用addToast提示错误
      addToast({ 
        title: '设置失败', 
        message: error.message || '支付密码设置失败，请重试',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            {/* 支付密码输入框 */}
            <div className="mb-8">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                支付密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
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