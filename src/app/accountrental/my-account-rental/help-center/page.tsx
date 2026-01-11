'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { SearchOutlined, PhoneOutlined, FileTextOutlined, QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const HelpCenterPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold">帮助中心</h1>
          <div className="w-8"></div> {/* 占位，保持标题居中 */}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-6">
        {/* 搜索栏 */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchOutlined className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索帮助内容"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 帮助分类 */}
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-700 mb-3">常见问题</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {[
                { icon: <FileTextOutlined />, title: '账号租赁流程', desc: '了解如何发布和租赁账号' },
                { icon: <QuestionCircleOutlined />, title: '安全保障', desc: '账号安全和交易保障措施' },
                { icon: <CheckCircleOutlined />, title: '费用说明', desc: '租赁费用和结算方式' },
                { icon: <PhoneOutlined />, title: '联系客服', desc: '获取更多帮助和支持' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 客服信息 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">需要更多帮助？</h3>
            <p className="text-gray-500">如有疑问，请联系客服</p>
          </div>
          <div className="flex justify-center">
            <Button className="bg-blue-500 hover:bg-blue-600 px-6">
              联系客服
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;