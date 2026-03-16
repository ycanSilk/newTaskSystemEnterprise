"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();
  
  // 认证信息
  const verificationData = [
    { id: 'realName', label: '实名认证', status: '已认证', icon: '🪪' },
    { id: 'business', label: '企业认证', status: '已认证', icon: '🏢' },
    { id: 'phone', label: '手机认证', status: '已认证', icon: '📱' },
    { id: 'email', label: '邮箱认证', status: '未认证', icon: '📧' }
  ];

  const handleBack = () => {
    router.back();
  };

  // 处理认证操作
  const handleVerification = (id: string) => {
    // 这里可以实现不同认证类型的处理逻辑
    console.log(`处理${id}认证`);
    // 实际项目中应该跳转到对应的认证流程页面
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="px-5 py-4 flex items-center">
          <button 
            onClick={handleBack}
            className="text-gray-600 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-800">认证中心</h1>
        </div>
      </div>

      {/* 认证提示 */}
      <div className="mt-4 px-5">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-xl mt-0.5">📋</span>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">认证说明</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• 完成实名认证可提高账户可信度</p>
                <p>• 企业认证后可获得更多专属功能</p>
                <p>• 认证信息仅用于身份验证，将严格保密</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 认证列表 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-medium text-gray-700">我的认证</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {verificationData.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="text-gray-800">{item.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm px-3 py-1 rounded-full ${item.status === '已认证' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.status}
                  </span>
                  {item.status === '未认证' && (
                    <button 
                      onClick={() => handleVerification(item.id)}
                      className="text-sm text-green-500 px-3 py-1 border border-green-500 rounded-full"
                    >
                      去认证
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 认证权益 */}
      <div className="mt-5 px-5 mb-8">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">认证权益</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <span className="text-xl mb-2">🏆</span>
              <div className="text-xs text-center text-gray-700">提高账号可信度</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-xl mb-2">🎁</span>
              <div className="text-xs text-center text-gray-700">专属任务特权</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-xl mb-2">⚡</span>
              <div className="text-xs text-center text-gray-700">审核速度加快</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-xl mb-2">💎</span>
              <div className="text-xs text-center text-gray-700">高级数据分析</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}