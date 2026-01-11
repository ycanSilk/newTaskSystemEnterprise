'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// 导入四个对应状态的页面组件
import OverViewTabPage from './OverView/page';
import ActiveTabPage from './InProgress/page';
import AwaitingReviewTabPage from './AwaitingReview/page';
import CompletedTabPage from './Completed/page';
// 导入检查支付密码的API响应类型
import { CheckWalletPwdApiResponse } from '../../types/paymentWallet/checkWalletPwdTypes';
// 导入URL重定向提示框组件
import URLRedirection from '../../../components/promptBox/URLRedirection';
// 导入useUser钩子，用于获取用户登录状态
import { useUser } from '@/hooks/useUser';
// 导入加载组件，用于状态加载中显示
import { Loading } from '@/components/ui';

// 删除了不必要的数据类型定义

export default function PublisherDashboardPage() {
  // 获取搜索参数，用于从URL中读取tab值
  const searchParams = useSearchParams();
  // 获取路由对象，用于页面跳转
  const router = useRouter();
  // 从URL参数中获取tab值，如果没有则默认显示概览页
  const tabFromUrl = searchParams?.get('tab') || 'OverView';
  // 设置当前激活的tab状态
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // 使用useUser钩子获取用户登录状态
  const { isAuthenticated, isLoading } = useUser();

  // 确保页面加载时默认显示tab=OverView参数
  useEffect(() => {
    if (!searchParams?.has('tab')) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', 'OverView');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);
  
  // 添加URL重定向提示框状态
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 使用URL参数格式更新当前页面的选项卡状态
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // 检查用户是否设置了支付密码
  const checkWalletPassword = async () => {
    try {
      // 调用检查支付密码API，使用正确的端点
      const response = await fetch('/api/paymentWallet/checkWalletPwd', {
        method: 'GET',
        credentials: 'include'
      });
      
      // 解析API响应
      const result: CheckWalletPwdApiResponse = await response.json();
      
      console.log('dashboard checkWalletPassword: 检查结果:', result);
      
      // 如果请求成功且用户未设置支付密码
      if (result.success && result.data && !result.data.has_password) {
        // 显示自定义提示弹窗
        setShowRedirectModal(true);
        console.log('dashboard checkWalletPassword: 用户未设置支付密码，显示提示弹窗');
      } else {
        console.log('dashboard checkWalletPassword: 用户已设置支付密码，不显示提示弹窗');
        // 如果已经显示了弹窗，关闭它
        if (showRedirectModal) {
          setShowRedirectModal(false);
        }
      }
    } catch (error) {
      console.error('dashboard checkWalletPassword: 检查支付密码失败:', error);
    }
  };

  // 在组件挂载时检查支付密码
  useEffect(() => {
    console.log('dashboard useEffect: 开始检查支付密码');
    checkWalletPassword();
  }, []);

  // 监听页面可见性变化，当页面重新可见时检查支付密码
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('dashboard handleVisibilityChange: 页面重新可见，检查支付密码');
        checkWalletPassword();
      }
    };

    // 监听visibilitychange事件
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // 清理事件监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 删除了不必要的API请求代码

  return (
    <>
      {/* 1. 加载状态处理：当isLoading为true时，显示加载动画 */}
      {isLoading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loading size="lg" />
            <p className="mt-4 text-gray-600">正在验证身份...</p>
          </div>
        </div>
      )}
      
      {/* 2. 已登录状态：显示完整的仪表板页面 */}
      {!isLoading && isAuthenticated && (
        <div className="pb-20">
          {/* 只保留这4个切换按钮的布局和框架 */}
          <div className="mx-4 mt-4 grid grid-cols-4 gap-1">
            <button
              onClick={() => handleTabChange('OverView')}
              className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'OverView' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
            >
              概览
            </button>
            <button
              onClick={() => handleTabChange('InProgress')}
              className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'InProgress' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
            >
              进行中
            </button>
            <button
              onClick={() => handleTabChange('AwaitingReview')}
              className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'AwaitingReview' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
            >
              待审核
            </button>
            <button
              onClick={() => handleTabChange('Completed')}
              className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'Completed' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
            >
              已完成
            </button>
          </div>

          {/* 直接嵌入4个对应状态的页面组件 */}
          {activeTab === 'OverView' && <OverViewTabPage />}
          {activeTab === 'InProgress' && <ActiveTabPage />}
          {activeTab === 'AwaitingReview' && <AwaitingReviewTabPage />}
          {activeTab === 'Completed' && <CompletedTabPage />}
        </div>
      )}
      
      {/* 3. 未登录状态：显示全屏遮罩和登录提示弹窗 */}
      {!isLoading && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          {/* 全屏遮罩层，阻止用户操作页面其他内容 */}
          <div className="absolute inset-0" />
          
          {/* 登录提示弹窗 */}
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 z-10">
            {/* 弹窗标题 */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">请先登录</h3>
            
            {/* 弹窗提示信息 */}
            <p className="text-gray-600 mb-8 text-center">
              您尚未登录，无法访问该页面。请先登录账号。
            </p>
            
            {/* 立即登录按钮 */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/publisher/auth/login')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                立即登录
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* URL重定向提示框组件（只有已登录状态下才会显示） */}
      {isAuthenticated && (
        <URLRedirection
          isOpen={showRedirectModal}
          message="您尚未设置支付密码，请先设置支付密码"
          buttonText="前往设置"
          redirectUrl="/publisher/profile/paymentsettings/setpaymentpwd"
          onClose={() => setShowRedirectModal(false)}
        />
      )}
    </>
  );
}