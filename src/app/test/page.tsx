// src/app/test/page.tsx
'use client';

import React from 'react';
import { ImageUpload } from '@/components/imagesUpload';

/**
 * 图片上传测试页面
 * @returns 图片上传测试页面
 */
export default function ImageUploadTestPage() {
  // 处理图片变化，直接输出API返回的结果
  const handleImagesChange = (images: File[], urls: string[]) => {
    // 只输出API调用结果
    console.log('API调用结果:', urls);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">图片上传测试</h1>
        
        {/* 图片上传组件 */}
        <div className="mb-6">
          <ImageUpload
            maxCount={1}
            onImagesChange={handleImagesChange}
            savePath="public/upload/images"
            title="选择要上传的图片"
          />
        </div>
      </div>
    </div>
  );
}
