'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui';
import { SearchOutlined } from '@ant-design/icons';

const PublishedRentPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('published');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
          <h1 className="text-lg font-semibold">我发布的出租</h1>
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
            placeholder="搜索账号名称或ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 选项卡 */}
        <Tabs defaultValue="published" onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="published">已发布信息</TabsTrigger>
            <TabsTrigger value="renting">出租中订单</TabsTrigger>
            <TabsTrigger value="settled">已结算订单</TabsTrigger>
            <TabsTrigger value="removed">已下架订单</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-2">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-center text-gray-500 py-12">
                <p>暂无已发布的出租信息</p>
                <Button
                  onClick={() => router.push('/accountrental/account-rental-publish/publish-for-rent')}
                  className="mt-4 bg-blue-500 hover:bg-blue-600"
                >
                  去发布
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="renting" className="mt-2">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-center text-gray-500 py-12">
                <p>暂无出租中的订单</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settled" className="mt-2">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-center text-gray-500 py-12">
                <p>暂无已结算的订单</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="removed" className="mt-2">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-center text-gray-500 py-12">
                <p>暂无已下架的订单</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublishedRentPage;