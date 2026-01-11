'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuccessModal from '../../../../components/button/authButton/SuccessModal';
// 导入注册页面类型定义
import { RegisterFormData, RegisterApiRequest, RegisterApiResponse } from '../../../types/auth/registerTypes';

export default function PublisherRegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    organization_name: '',
    organization_leader: '',
    captcha: '',
    agreeToTerms: false
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // 只在客户端生成验证码，避免SSR和客户端渲染不匹配
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCaptchaCode(generateCaptcha());
    }
  }, []);
  
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // 基础验证
    // 用户名验证
    if (!formData.username.trim()) {
      setErrorMessage('用户名不能为空');
      return;
    }
    
    // 用户名长度验证（至少4个字符）
    if (formData.username.trim().length < 4) {
      setErrorMessage('用户名长度必须大于或等于4个字符');
      return;
    }

    // 用户名长度验证（不超过16个字符）
    if (formData.username.trim().length > 16) {
      setErrorMessage('用户名长度不能超过16个字符');
      return;
    }
    
    // 用户名格式验证（字母数字组合）
    const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
    if (!usernameRegex.test(formData.username.trim())) {
      setErrorMessage('用户名只能包含字母和数字');
      return;
    }

    // 密码验证
    if (!formData.password.trim()) {
      setErrorMessage('密码不能为空');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('密码长度不能少于6位');
      return;
    }

    // 确认密码验证
    if (!formData.confirmPassword.trim()) {
      setErrorMessage('请确认密码');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }

    // 企业名称验证（必填）
    if (!formData.organization_name.trim()) {
      setErrorMessage('企业名称不能为空');
      return;
    }

    if (formData.organization_name.trim().length < 2 || formData.organization_name.trim().length > 100) {
      setErrorMessage('企业名称长度应在2-100个字符之间');
      return;
    }

    // 企业负责人验证（必填）
    if (!formData.organization_leader.trim()) {
      setErrorMessage('企业负责人不能为空');
      return;
    }

    if (formData.organization_leader.trim().length < 2 || formData.organization_leader.trim().length > 50) {
      setErrorMessage('企业负责人姓名长度应在2-50个字符之间');
      return;
    }

    // 企业负责人格式验证（中文、英文，不能包含空格）
    const organization_leaderRegex = /^[\u4e00-\u9fa5a-zA-Z]+$/;
    if (!organization_leaderRegex.test(formData.organization_leader.trim())) {
      setErrorMessage('企业负责人姓名只能包含中文和英文，不能有空格');
      return;
    }

    // 如果填写了手机号，则验证手机号格式
    if (formData.phone.trim()) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        setErrorMessage('请输入正确的手机号码');
        return;
      }
    }

    // 如果填写了邮箱，则验证邮箱格式
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage('请输入正确的邮箱地址');
        return;
      }
    }

    if (!formData.agreeToTerms) {
      setErrorMessage('请阅读并同意用户协议和隐私政策');
      return;
    }

    // 验证码验证
    if (!formData.captcha.trim()) {
      setErrorMessage('请输入验证码');
      return;
    }

    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('验证码错误');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    
    try {
      // 准备发送到后端的注册请求数据
      const requestData: RegisterApiRequest = {
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        email: formData.email,
        organization_name: formData.organization_name,
        organization_leader: formData.organization_leader
      };
      
      // 调用发布者注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: RegisterApiResponse = await response.json();
      
      if (result.success) {
        // 注册成功
        setSuccessMessage(result.message || '注册成功！您的账号已创建，现在可以登录了。');
        // 显示确认提示框
        setShowConfirmModal(true);
      } else {
        setErrorMessage(result.message || '注册失败，请稍后重试');
        // 刷新验证码
        refreshCaptcha();
      }
    } catch (error) {
      setErrorMessage('注册过程中发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-8 md:pt-12 pb-12 md:pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white text-2xl md:text-4xl font-bold mb-2 md:mb-3">
            微任务系统平台
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-6 md:-mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 注册卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">注册</h2>
            {/* 注册表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 账号信息 */}
              <div className="bg-blue-50 rounded-lg p-3 md:p-4">

                {/* 用户名 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="4-16位字母数字组合"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 密码 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="至少6位字符"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 确认密码 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 手机号 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    手机号
                  </label>
                  <input
                    type="tel"
                    placeholder="请输入11位手机号（选填）"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 邮箱 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="请输入邮箱地址（选填）"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 验证码 */}
                <div>

                  {/* 验证码 */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium  mb-1">
                      验证码 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="请输入验证码"
                        value={formData.captcha}
                        onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div 
                        className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                        onClick={refreshCaptcha}
                      >
                        {captchaCode}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">点击验证码可刷新</p>
                  </div>
                </div>
              </div>

              {/* 企业信息 */}
              <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-bold text-blue-800 mb-3">企业信息</h3>
                
                {/* 企业名称 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    企业名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入企业名称"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* 企业负责人 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium  mb-1">
                    企业负责人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="请输入企业负责人姓名"
                    value={formData.organization_leader}
                    onChange={(e) => setFormData({...formData, organization_leader: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 协议同意 */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed">
                  我已阅读并同意 <span className="text-blue-600 underline">《用户协议》</span> 和 <span className="text-blue-600 underline">《隐私政策》</span>
                </label>
              </div>

              {/* 错误信息 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">❌</span>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 成功信息 */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-green-700">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* 注册按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? '注册中...' : '立即注册'}
              </button>
            </form>

            {/* 底部链接 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                已有账号？{' '}
                <button 
                  onClick={() => router.push('/publisher/auth/login')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>



          {/* 底部信息 */}
          <div className="text-center  mb-8">
            <p>©2025 微任务系统 版本V1.0</p>

          </div>
        </div>
      </div>
      
      {/* 注册成功确认提示框 */}
      <SuccessModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="注册成功"
        message={successMessage || '您的账号已成功注册，现在可以登录了！'}
        buttonText="确认并登录"
        redirectUrl="/publisher/auth/login"
      />
    </div>
  );
}