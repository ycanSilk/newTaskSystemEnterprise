// components/imagesUpload/ImageUpload.tsx
import React, { useEffect, useRef } from 'react';
import { useEphemeralImageManager } from '@/hooks/useEphemeralImageManager';

// 组件属性类型定义
export interface ImageUploadProps {
  initialImages?: File[];           // 初始图片列表
  maxCount?: number;                // 最大上传数量
  onImagesChange?: (images: File[], urls: string[]) => void;  // 图片变化回调，包含上传后的URL
  savePath?: string;                // 保存图片路径
  title?: string;                   // 组件标题
  columns?: number;                 // 每行显示数量
  gridWidth?: string;               // 图片网格宽度，支持具体尺寸或百分比，默认100%
  itemSize?: string;                // 单个上传项尺寸，格式为"widthxheight"，默认"100x100"
}

/**
 * 图片上传组件
 * @param props 组件属性
 * @returns 图片上传组件
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImages = [],
  maxCount = 6,
  onImagesChange,
  savePath = '',
  title = '图片上传',
  columns = 3,
  gridWidth = '100%', // 默认网格宽度为100%
  itemSize = '100x100' // 默认单个上传项尺寸为100x100
}) => {
  // 解析itemSize字符串，获取宽高值
  // 默认值为100x100
  const [itemWidth, itemHeight] = (() => {
    const match = itemSize.match(/^(\d+)x(\d+)$/);
    if (match) {
      return [`${match[1]}px`, `${match[2]}px`];
    }
    // 如果格式无效，使用默认值
    return ['100px', '100px'];
  })();
  // 使用ref保存最新的onImagesChange回调函数，避免因函数变化导致的无限循环
  const onImagesChangeRef = useRef(onImagesChange);
  
  // 使用图片管理Hook
  const {
    images,
    imagePreviews,
    uploadedUrls,
    handleImageUpload,
    removeImage,
    resetImages,
    isUploading,
    uploadProgress,
    uploadStatus,
    selectedPreviewIndex,
    setSelectedPreviewIndex
  } = useEphemeralImageManager(initialImages, savePath);
  
  // 使用ref保存之前的images和uploadedUrls，用于比较是否真正变化
  // 初始化为空数组，避免使用未声明的变量
  const prevImagesRef = useRef<File[]>([]);
  const prevUploadedUrlsRef = useRef<string[]>([]);

  // 更新ref中的回调函数，确保始终使用最新版本
  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  // 通知父组件图片变化 - 只在images或uploadedUrls真正变化时调用
  // 避免初始渲染和重复渲染时的不必要调用，彻底解决无限循环
  useEffect(() => {
    // 比较当前值与之前值，只有真正变化时才调用回调
    const imagesChanged = images.length !== prevImagesRef.current.length ||
                         images.some((img, index) => img !== prevImagesRef.current[index]);
    
    const urlsChanged = uploadedUrls.length !== prevUploadedUrlsRef.current.length ||
                        uploadedUrls.some((url, index) => url !== prevUploadedUrlsRef.current[index]);
    
    if ((imagesChanged || urlsChanged) && (images.length > 0 || uploadedUrls.some(url => url))) {
      // 通过ref访问最新的回调函数
      onImagesChangeRef.current?.(images, uploadedUrls);
      
      // 更新ref中的值，用于下次比较
      prevImagesRef.current = images;
      prevUploadedUrlsRef.current = uploadedUrls;
    }
  }, [images, uploadedUrls]);

  // 打开图片预览
  const handleOpenPreview = (index: number) => {
    setSelectedPreviewIndex(index);
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setSelectedPreviewIndex(null);
  };

  return (
    <div className="image-upload-container p-0 ">
      {/* 组件标题 */}
      {title && (
        <h3 className="text-sm font-semibold mb-2 text-gray-800">
          {title}
        </h3>
      )}
      
      {/* 上传状态 */}
      {uploadStatus && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-md">
          {uploadStatus}
        </div>
      )}
      
      {/* 图片上传网格 */}
      <div 
        className={`image-upload-grid grid grid-cols-${columns} gap-4 justify-center items-center mb-4`}
        style={{ width: gridWidth }}
      >
        {Array.from({ length: maxCount }).map((_, index) => (
          <div 
            key={index} 
            className={`image-upload-item relative border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300 ${images[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            style={{ width: itemWidth, height: itemHeight }}
          >
            {/* 已上传图片显示 */}
            {images[index] ? (
              <>
                {/* 图片预览 - 点击可放大查看 */}
                <img 
                  src={imagePreviews[index]} 
                  alt={`上传图片 ${index + 1}`} 
                  className="uploaded-image w-full h-full object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenPreview(index)}
                />
                
                {/* 移除按钮 */}
                <button 
                  onClick={() => removeImage(index)}
                  className="remove-button absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                  aria-label="移除图片"
                >
                  ×
                </button>
              </>
            ) : (
              /* 空槽位上传按钮 */
              <label className="upload-label w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <span className="upload-icon text-4xl font-light text-gray-400 mb-2">+</span>
                <span className="upload-text text-sm text-gray-500">点击上传图片</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden-input absolute opacity-0 w-0 h-0"
                />
              </label>
            )}
            
            {/* 上传进度条 */}
            {isUploading && uploadProgress > 0 && uploadProgress < 100 && index === images.length - 1 && (
              <div className="progress-bar absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                <div 
                  className="progress-fill h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 图片放大预览模态框 */}
      {selectedPreviewIndex !== null && imagePreviews[selectedPreviewIndex] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {/* 关闭按钮 */}
            <button
              className="absolute top-[-40px] right-0 text-white text-2xl cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClosePreview}
              aria-label="关闭预览"
            >
              ×
            </button>
            
            {/* 预览图片 */}
            <img
              src={imagePreviews[selectedPreviewIndex]}
              alt="放大预览"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;