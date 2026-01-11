'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, Alert, message } from 'antd';

const { Password } = Input;



// 密码验证函数 - 仅非空和长度校验
const validatePassword = (password: string): {
  isValid: boolean;
  message: string;
} => {
  // 非空校验
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: '密码不能为空',
    };
  }

  // 长度校验 - 至少6位
  if (password.length < 6) {
    return {
      isValid: false,
      message: '密码长度至少6位',
    };
  }

  return {
    isValid: true,
    message: '密码有效',
  };
};

export default function ResetPasswordPage() {
  const router = useRouter();
  // 状态管理
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // 移除密码强度状态
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 清除对应的错误信息
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // 如果是新密码，直接检查与确认密码是否一致
    if (name === 'newPassword') {
      // 如果确认密码已填写，检查两次密码是否一致
      if (formData.confirmPassword) {
        validateConfirmPassword(value, formData.confirmPassword);
      }
    }
    
    // 如果是确认密码，检查与新密码是否一致
    if (name === 'confirmPassword') {
      validateConfirmPassword(formData.newPassword, value);
    }
  };

  // 验证两次密码是否一致
  const validateConfirmPassword = (newPwd: string, confirmPwd: string) => {
    if (confirmPwd && newPwd !== confirmPwd) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '两次输入的新密码不一致',
      }));
      return false;
    } else {
      setErrors(prev => ({
        ...prev,
        confirmPassword: '',
      }));
      return true;
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    
    let isValid = true;
    
    // 验证当前密码
    if (!formData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
      isValid = false;
    }
    
    // 验证新密码
    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
      isValid = false;
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.message;
        isValid = false;
      }
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的新密码不一致';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单提交日志
    console.log('密码修改表单开始提交');
    
    // 验证表单
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }
    
    console.log('表单验证通过，开始处理提交');
    setIsSubmitting(true);
    
    try {
      // API调用信息
      console.log('调用密码修改API');
      
      const response = await fetch('/api/users/changepwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
        credentials: 'include' // 自动携带HttpOnly Cookie
      });
      
      // 响应状态
      console.log('API响应状态码:', response.status);
      
      // 解析响应数据
      const data = await response.json();
      console.log('完整JSON响应:', JSON.stringify(data));
      
      // 处理响应结果
      if (data.success) {
        console.log('密码修改成功');
        setSuccess(true);
        message.success(data.message || '密码修改成功！');
        
        // 3秒后跳转到个人中心页面
        setTimeout(() => {
          router.push('/publisher/auth/login');
        }, 3000);
      } else {
        console.log('密码修改失败');
        // 直接显示后端返回的错误信息
        message.error(data.message || '修改密码失败');
      }
    } catch (error) {
      console.error('API请求异常:', error);
      // 处理网络错误或其他异常
      message.error(error instanceof Error ? error.message : '网络请求失败，请稍后重试');
    } finally {
      console.log('密码修改表单提交完成');
      setIsSubmitting(false);
    }
  };

  // 切换密码可见性
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // 移除密码强度指示器组件

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">修改密码</h1>
          </div>
          
          {success ? (
            <Alert
              title="密码修改成功"
              description="您的密码已成功修改，即将跳转回个人中心..."
              type="success"
              showIcon
              className="mb-4"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 当前密码 */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <Password
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="请输入当前密码"
                  prefix={<LockOutlined className="text-gray-400" />}
                  className={`w-full ${errors.currentPassword ? 'border-red-500' : ''}`}
                  visibilityToggle={{ visible: showPasswords.currentPassword, onVisibleChange: () => togglePasswordVisibility('currentPassword') }}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <ExclamationCircleOutlined className="mr-1" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              
              {/* 新密码 */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <Password
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="请输入新密码（至少6位）"
                  prefix={<LockOutlined className="text-gray-400" />}
                  className={`w-full ${errors.newPassword ? 'border-red-500' : ''}`}
                  visibilityToggle={{ visible: showPasswords.newPassword, onVisibleChange: () => togglePasswordVisibility('newPassword') }}
                />

                <p className="text-gray-500 text-xs mt-1">密码长度至少6位</p>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <ExclamationCircleOutlined className="mr-1" />
                    {errors.newPassword}
                  </p>
                )}
              </div>
              
              {/* 确认新密码 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入新密码"
                  prefix={<LockOutlined className="text-gray-400" />}
                  className={`w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  visibilityToggle={{ visible: showPasswords.confirmPassword, onVisibleChange: () => togglePasswordVisibility('confirmPassword') }}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <ExclamationCircleOutlined className="mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
              {/* 提交按钮 */}
              <div className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full py-2 h-10"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  修改密码
                </Button>
              </div>
              
              {/* 返回按钮 */}
              <div>
                <Button
                  onClick={() => router.push('/publisher/profile/settings')}
                  className="w-full"
                >
                  返回个人中心
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}