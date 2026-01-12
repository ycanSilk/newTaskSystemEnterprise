// src/app/test/page.tsx
'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/imagesUpload/ImageUpload';
import { useRouter } from 'next/navigation';

/**
 * 图片上传测试页面
 * @returns 图片上传测试页面
 */
export default function ImageUploadTestPage() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('public/upload/images');
  const router = useRouter();

  // 处理图片变化
  const handleImagesChange = (images: File[]) => {
    setUploadedImages(images.filter(img => img !== undefined));
  };

  // 处理保存路径变化
  const handleSavePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavePath(e.target.value);
  };

  // 提交图片上传
  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      setUploadStatus('请先选择要上传的图片');
      return;
    }

    setUploadStatus('正在上传图片...');

    try {
      // 遍历上传所有图片
      const uploadPromises = uploadedImages.map(async (image, index) => {
        // 创建FormData用于文件上传
        const formData = new FormData();
        formData.append('file', image);
        formData.append('savePath', savePath);

        // 发送POST请求到上传API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`上传第${index + 1}张图片失败`);
        }

        return await response.json();
      });

      // 等待所有图片上传完成
      const results = await Promise.all(uploadPromises);
      
      // 检查上传结果
      const failedUploads = results.filter(result => !result.success).length;
      if (failedUploads === 0) {
        setUploadStatus(`成功上传${uploadedImages.length}张图片`);
      } else {
        setUploadStatus(`成功上传${uploadedImages.length - failedUploads}张图片，失败${failedUploads}张`);
      }

      // 输出上传结果到控制台
      console.log('上传结果:', results);
    } catch (error) {
      setUploadStatus('图片上传失败');
      console.error('上传失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">图片上传测试</h1>
        
        {/* 保存路径设置 */}
        <div className="mb-6">
          <label htmlFor="savePath" className="block text-gray-700 mb-2">保存路径:</label>
          <input
            type="text"
            id="savePath"
            value={savePath}
            onChange={handleSavePathChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入保存图片的路径"
          />
        </div>
        
        {/* 图片上传组件 */}
        <div className="mb-6">
          <ImageUpload
            maxCount={5}
            onImagesChange={handleImagesChange}
            savePath={savePath}
            title="选择要上传的图片"
          />
        </div>
        
        {/* 上传状态 */}
        {uploadStatus && (
          <div className="mb-6 p-4 rounded-md bg-blue-50 text-blue-700">
            {uploadStatus}
          </div>
        )}
        
        {/* 提交按钮 */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={uploadedImages.length === 0}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            上传图片
          </button>
        </div>
      </div>
    </div>
  );
}
