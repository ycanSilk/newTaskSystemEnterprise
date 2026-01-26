'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 导入登录页面类型定义
import { LoginFormData, LoginApiResponse } from '../../../types/auth/loginTypes';
// 导入useUser钩子，用于检查登录状态
import { useUser } from '@/hooks/useUser';

export default function PublisherLoginPage() {
  
  const [formData, setFormData] = useState<LoginFormData>({
    account: '',
    password: '',
    captcha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // 使用useUser钩子检查登录状态
  const { isAuthenticated, isLoading: isAuthLoading } = useUser();
  
  // 如果用户已登录，重定向到仪表盘页面
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      console.log('isAuthenticated:', isAuthenticated);
      console.log('用户已登录，重定向到仪表盘页面');
      router.push('/publisher/dashboard');
    }
  }, [isAuthLoading, isAuthenticated, router]);
  
  // 生成随机验证码
  function generateCaptcha(length = 4) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 刷新验证码
  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setFormData(prev => ({ ...prev, captcha: '' }));
    // 重置倒计时
    setCountdown(60);
  };

  // 只在客户端生成验证码，避免SSR和客户端渲染不匹配
  useEffect(() => {
    setCaptchaCode(generateCaptcha());

    // 设置1秒倒计时定时器
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshCaptcha();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(countdownTimer);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // 账号校验
    if (!formData.account || formData.account.trim() === '') {
      setErrorMessage('请输入账号');
      return;
    }
    
    // 密码校验
    if (!formData.password || formData.password.trim() === '') {
      setErrorMessage('请输入密码');
      return;
    }
    
    // 验证码非空校验
    if (!formData.captcha || formData.captcha.trim() === '') {
      setErrorMessage('请输入验证码');
      return;
    }
    
    // 验证码一致性校验（忽略大小写）
    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('验证码错误');
      refreshCaptcha(); // 验证码错误时刷新
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: formData.account.trim(),
          password: formData.password.trim()
        }),
        credentials: 'include' // 确保携带cookie
      });

      
      // 解析响应数据
      const result: LoginApiResponse = await response.json();
      
      if (result.success) {
        // 登录成功，跳转到仪表盘
        router.push('/publisher/dashboard');
      } else {
        // 登录失败，显示错误信息
        setErrorMessage(result.message || '登录失败，请检查输入信息');
        refreshCaptcha(); // 刷新验证码
      }
    } catch (error) {
      setErrorMessage('网络连接失败，请检查网络设置后重试');
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white font-bold text-4xl mb-3">
            任务发布系统
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 登录卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录</h2>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 账号输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  账号
                </label>
                <input
                  type="text"
                  placeholder="请输入账号"
                  value={formData.account}
                  onChange={(e) => {
                    setFormData({...formData, account: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="username"
                />
              </div>

              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 transition-colors"
                      viewBox="0 0 20 20" 
                      fill={showPassword ? "currentColor" : "currentColor"}
                      style={{ color: showPassword ? "#3b82f6" : "#6b7280" }}
                    >
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* 验证码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.captcha}
                    onChange={(e) => {
                      setFormData({...formData, captcha: e.target.value});
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div 
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                    onClick={refreshCaptcha}
                  >
                    {captchaCode}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">点击验证码可刷新，验证码还剩 {countdown} 秒自动刷新</p>
              </div>

              {/* 错误信息 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
           
            </form>

            {/* 注册提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{' '}
                <button 
                  onClick={() => {
                    router.push('/publisher/auth/register');
                  }}
                  className="text-blue-500 hover:underline"
                >
                  立即注册
                </button>
                <button 
                  onClick={() => {
                    router.push('/publisher/auth/resetpwd');
                  }}
                  className="text-blue-500 hover:underline ml-3"
                >
                  忘记密码
                </button>
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center mb-8">
            <p>©2025 微任务系统平台 V1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
