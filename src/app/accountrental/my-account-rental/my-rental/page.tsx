'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { SearchOutlined } from '@ant-design/icons';

const MyRentalPage = () => {
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
          <h1 className="text-lg font-semibold">我租赁的</h1>
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
            placeholder="搜索已租赁的账号或ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 内容卡片 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-center text-gray-500 py-12">
            <p>暂无租赁记录</p>
            <Button
              onClick={() => router.push('/accountrental/market')}
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              去市场浏览
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRentalPage;