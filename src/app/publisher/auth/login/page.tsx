'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginFormData, LoginApiResponse } from '../../../types/auth/loginTypes';
import { useUser } from '@/hooks/useUser';
import { saveUserOnLoginSuccess } from '@/store/userStore';

import UserAgreementModal from '@/app/components/modals/UserAgreementModal';
import PrivacyPolicyModal from '@/app/components/modals/PrivacyPolicyModal';
import PlatformServiceNoticeModal from '@/app/components/modals/PlatformServiceNoticeModal';
  const userFriendlyMessages: Record<number, string> = {
    4001: '注册失败',
    4002: '请输入账号',
    4003: '请输入密码',
    4004: '账号或密码错误',
    4005: '您的账号已被禁用，请联系管理员', 
    5001: '注册失败',
    5002: '注册失败',
    1001: '注册失败',
    1002: '注册失败'
  };


export default function PublisherLoginPage() {

  const [formData, setFormData] = useState<LoginFormData>({
    account: '',
    password: '',
    captcha: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  // 协议模态框状态
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPlatformServiceNotice, setShowPlatformServiceNotice] = useState(false);
  const router = useRouter();

  // 使用useUser钩子检查登录状态
  const { isAuthenticated, isLoading: isAuthLoading } = useUser();






  // 如果用户已登录，重定向到目标页面
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      console.log('isAuthenticated:', isAuthenticated);
      console.log('用户已登录，重定向到目标页面');
      // 检查当前路径是否已经是dashboard或其他非登录页面
      const currentPath = window.location.pathname;
      if (currentPath === '/publisher/auth/login' || currentPath === '/publisher/auth/register') {
        // 使用replace代替push，避免浏览器历史记录中留下登录页
        router.replace('/publisher/dashboard');
      }
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 生成随机验证码（与demo.html一致）
  function generateCaptcha(length = 4) {
    // 使用与demo.html相同的字符集，排除容易混淆的字符
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 刷新验证码
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaCode(newCaptcha);

    // 生成固定的字符变换参数和干扰点位置
    const charTransforms = [];
    for (let i = 0; i < newCaptcha.length; i++) {
      charTransforms.push({
        skewX: Math.random() * 15 - 7.5,
        rotate: Math.random() * 8 - 4
      });
    }

    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push({
        cx: Math.random() * 110 + 5,
        cy: Math.random() * 30 + 5,
        r: Math.random() * 1.5 + 1
      });
    }

    setCaptchaConfig({ charTransforms: [...charTransforms], dots: [...dots] });

    // 只重置captcha字段，不影响其他表单字段
    setFormData(prev => ({ ...prev, captcha: '' }));
    // 重置倒计时
    setCountdown(60);
  };

  // 定义验证码配置类型
  interface CharTransform {
    skewX: number;
    rotate: number;
  }

  interface Dot {
    cx: number;
    cy: number;
    r: number;
  }

  interface CaptchaConfig {
    charTransforms: CharTransform[];
    dots: Dot[];
  }

  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig>({
    charTransforms: [],
    dots: []
  });

  // 只在客户端生成验证码，避免SSR和客户端渲染不匹配
  useEffect(() => {
    const initialCaptcha = generateCaptcha();
    setCaptchaCode(initialCaptcha);

    // 生成初始的字符变换参数和干扰点位置
    const charTransforms = [];
    for (let i = 0; i < initialCaptcha.length; i++) {
      charTransforms.push({
        skewX: Math.random() * 15 - 7.5,
        rotate: Math.random() * 8 - 4
      });
    }

    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push({
        cx: Math.random() * 110 + 5,
        cy: Math.random() * 30 + 5,
        r: Math.random() * 1.5 + 1
      });
    }

    setCaptchaConfig({ charTransforms, dots });

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



    // 2. 用户名校验：必填、字符长度>=4
    if (!formData.account || formData.account.trim() === '') {
      setErrorMessage('请输入账号');
      return;
    }
    if (formData.account.trim().length < 4) {
      setErrorMessage('账号长度至少为4个字符');
      return;
    }

    // 3. 密码校验：必填、字符长度>=6
    if (!formData.password || formData.password.trim() === '') {
      setErrorMessage('请输入密码');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('密码长度至少为6个字符');
      return;
    }

    // 4. 图形验证码校验：4位字符
    if (!formData.captcha || formData.captcha.trim() === '') {
      setErrorMessage('请输入验证码');
      return;
    }
    if (formData.captcha.trim().length !== 4) {
      setErrorMessage('验证码长度必须为4位');
      return;
    }

    // 验证码一致性校验（忽略大小写）
    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('验证码错误');
      refreshCaptcha();
      return;
    }

    // 5. 用户协议校验：必须勾选
    if (!formData.agreeToTerms) {
      setErrorMessage('请阅读并同意用户协议和隐私政策');
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
        })
      });

      console.log(response);
      
      const httpStatus = response.status;

      if (!response.ok) {
        if (httpStatus === 400) {
          setErrorMessage('登陆失败');
        } else if (httpStatus === 401) {
          setErrorMessage('未授权，请重新登录');
        } else if (httpStatus === 403) {
          setErrorMessage('禁止访问');
        } else if (httpStatus === 404) {
          setErrorMessage('网络超时');
        } else if (httpStatus >= 502) {
          setErrorMessage('网络超时');
        } else {
          setErrorMessage('网络超时');
        }
        refreshCaptcha();
        return;
      }

      const result: LoginApiResponse = await response.json();

      if (result.code === 0) {
        saveUserOnLoginSuccess(result.data, result.data.token);
        router.replace('/publisher/dashboard');
      } else if (result.code === 4001) {
        setErrorMessage('注册失败');
      } else if (result.code === 4002) {
        setErrorMessage('请输入账号');
      } else if (result.code === 4003) {
        setErrorMessage('请输入密码');
      } else if (result.code === 4004) {
        setErrorMessage('账号或密码错误');
      } else if (result.code === 4005) {
        setErrorMessage('您的账号已被禁用，请联系管理员');
      } else if (result.code === 5001) {
        setErrorMessage('注册失败');
      } else if (result.code === 5002) {
        setErrorMessage('注册失败');
      } else if (result.code === 1001) {
        setErrorMessage('注册失败');
      } else if (result.code === 1002) {
        setErrorMessage('注册失败');
      } else if (result.code === 1000) {
        setErrorMessage('注册失败');
      } else {
        setErrorMessage(result.message || '登录失败，请稍后重试');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setErrorMessage('网络连接失败，请检查网络设置后重试');
      } else if (error instanceof Error && error.message.includes('AbortError')) {
        setErrorMessage('请求超时，请稍后重试');
      } else {
        setErrorMessage('登录失败，请稍后重试');
      }

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
            巍峨人力
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 登录卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">用户登录</h2>
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
                    setFormData({ ...formData, account: e.target.value });
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
                      setFormData({ ...formData, password: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none" strokeWidth="1.7" strokeLinecap="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" strokeWidth="1.7"/>
                        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none" strokeWidth="1.7" strokeLinecap="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" strokeWidth="1.7"/>
                      </svg>
                    )}
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
                      setFormData({ ...formData, captcha: e.target.value });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg cursor-pointer"
                    onClick={refreshCaptcha}
                    title="点击刷新"
                  >
                    <svg width="96" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="40" fill="#f0f0f0" />
                      {/* 为每个字符添加不同的歪斜效果，确保不超出图形框 */}
                      {captchaCode.split('').map((char, index) => {
                        const transform = captchaConfig.charTransforms[index] || { skewX: 0, rotate: 0 };
                        return (
                          <text
                            key={index}
                            x={25 + index * 20}
                            y="28"
                            fontFamily="Arial"
                            fontSize="24"
                            fill="#333"
                            transform={`skewX(${transform.skewX || 0}) rotate(${transform.rotate || 0})`}
                          >
                            {char}
                          </text>
                        );
                      })}
                      {/* 增加更多干扰线 */}
                      <line x1="5" y1="15" x2="115" y2="25" stroke="#999" strokeWidth="1" />
                      <line x1="20" y1="5" x2="100" y2="35" stroke="#999" strokeWidth="1" />
                      <line x1="0" y1="20" x2="120" y2="20" stroke="#999" strokeWidth="1" />
                      {/* 增加更多干扰点 */}
                      {captchaConfig.dots.map((dot, i) => (
                        <circle
                          key={i}
                          cx={dot.cx || 0}
                          cy={dot.cy || 0}
                          r={dot.r || 0}
                          fill="#999"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">点击验证码可刷新，验证码还剩 {countdown} 秒自动刷新</p>
              </div>

              {/* 协议同意 */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed">
                  我已阅读并同意
                  <button
                    type="button"
                    onClick={() => setShowUserAgreement(true)}
                    className="text-blue-600  hover:text-blue-800"
                  >
                    《用户协议》
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-blue-600  hover:text-blue-800"
                  >
                    《隐私政策》
                  </button>
                  和
                  <button
                    type="button"
                    onClick={() => setShowPlatformServiceNotice(true)}
                    className="text-blue-600  hover:text-blue-800"
                  >
                    《平台服务通知》
                  </button>
                </label>
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
            <p>©2026 巍峨人力</p>
          </div>
        </div>
      </div>

      {/* 协议模态框 */}
      <UserAgreementModal
        isOpen={showUserAgreement}
        onClose={() => setShowUserAgreement(false)}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
      <PlatformServiceNoticeModal
        isOpen={showPlatformServiceNotice}
        onClose={() => setShowPlatformServiceNotice(false)}
      />
    </div>
  );
}