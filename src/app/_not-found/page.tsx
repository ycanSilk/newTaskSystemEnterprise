'use client';

import React from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

const NotFoundPage = () => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">页面不存在</p>
      <Button type="primary" onClick={handleBackToHome}>
        返回首页
      </Button>
    </div>
  );
};

export default NotFoundPage;