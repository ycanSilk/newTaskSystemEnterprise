'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 导入登录页面类型定义
import { LoginFormData, LoginApiResponse } from '../../../types/auth/loginTypes';
// 导入useUser钩子，用于检查登录状态
import { useUser } from '@/hooks/useUser';
// 导入登录成功后保存用户信息的函数
import { saveUserOnLoginSuccess } from '@/store/userStore';
// 导入优化工具
import { useOptimization } from '@/components/optimization/OptimizationProvider';
// 导入设备信息管理工具
import { getDeviceInfo } from '@/utils/device';
// 导入协议模态框
import UserAgreementModal from '@/app/components/modals/UserAgreementModal';
import PrivacyPolicyModal from '@/app/components/modals/PrivacyPolicyModal';
import PlatformServiceNoticeModal from '@/app/components/modals/PlatformServiceNoticeModal';


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
  const [deviceInfo, setDeviceInfo] = useState<{ device_id: string; device_name: string } | null>(null);
  const [deviceLoading, setDeviceLoading] = useState(true);
  // 协议模态框状态
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPlatformServiceNotice, setShowPlatformServiceNotice] = useState(false);
  const router = useRouter();

  // 使用useUser钩子检查登录状态
  const { isAuthenticated, isLoading: isAuthLoading } = useUser();
  // 使用优化工具
  const { globalFetch, savePageState } = useOptimization();

  // 初始化设备信息
  useEffect(() => {
    async function initDeviceInfo() {
      try {
        const info = await getDeviceInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('获取设备信息失败:', error);
      } finally {
        setDeviceLoading(false);
      }
    }
    initDeviceInfo();
  }, []);



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

    // 1. 设备信息校验
    if (deviceLoading) {
      setErrorMessage('设备信息获取中，请稍候...');
      return;
    }
    if (!deviceInfo) {
      setErrorMessage('设备信息获取失败，请刷新页面重试');
      return;
    }

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
      refreshCaptcha(); // 验证码错误时刷新
      return;
    }

    // 5. 用户协议校验：必须勾选
    if (!formData.agreeToTerms) {
      setErrorMessage('请阅读并同意用户协议和隐私政策');
      return;
    }

    setIsLoading(true);

    try {
      // 使用全局fetch包装器，获得缓存和重试等优化功能
      const result: LoginApiResponse = await globalFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: formData.account.trim(),
          password: formData.password.trim(),
          device_id: deviceInfo.device_id,
          device_name: deviceInfo.device_name
        })
      }, {
        // 登录请求不使用缓存
        enableCache: false,
        // 启用自动重试
        enableRetry: true,
        // 重试3次
        retryCount: 3,
        // 重试延迟1秒
        retryDelay: 1000
      });

      if (result.code === 0) {
        saveUserOnLoginSuccess(result.data, result.data.token);

        // 使用replace代替push，避免浏览器历史记录中留下登录页
        // 确保只执行一次重定向
        router.replace('/publisher/dashboard');
      } else {
        // 登录失败，显示前端通用错误提示
        setErrorMessage('账号和密码错误');
        refreshCaptcha(); // 验证码错误时刷新
      }
    } catch (error) {
      // 解析错误信息，显示前端通用错误提示
      if (error instanceof Error) {
        // 网络错误处理
        if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
          setErrorMessage('网络连接失败，请检查网络设置后重试');
        } else if (error.message.includes('AbortError')) {
          setErrorMessage('请求超时，请稍后重试');
        } else {
          // 其他所有错误都显示通用登录失败提示
          setErrorMessage('账号和密码错误');
        }
      } else {
        // 未知错误
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
                  {/* 眼睛按钮 */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none ${showPassword ? 'bg-blue-100 text-blue-600 p-1 rounded-full' : 'text-gray-500 hover:text-gray-700'}`}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l3.125-3.125M8.25 3a10.05 10.05 0 00-7.5 11.227m13.5-4.073a10.05 10.05 0 01-7.5-11.227M8.25 3a11.94 11.94 0 015.547 2.912"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      )}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
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