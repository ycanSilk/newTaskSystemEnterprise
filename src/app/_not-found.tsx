'use client';

import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">页面不存在</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Button
          onClick={() => router.push('/')}
          className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}