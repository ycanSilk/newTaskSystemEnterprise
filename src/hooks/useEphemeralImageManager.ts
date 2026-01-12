// hooks/useEphemeralImageManager.ts
import { useState, useCallback, useEffect } from 'react';

type ImageHandler = (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;

// Hook返回类型定义
export interface UseEphemeralImageManagerReturn {
  images: File[]; // 当前上传的图片文件列表
  imagePreviews: string[]; // 图片预览URL列表
  handleImageUpload: ImageHandler; // 图片上传处理函数
  removeImage: (index: number) => void; // 移除指定索引的图片
  resetImages: () => void; // 重置所有图片
  isUploading: boolean; // 是否正在上传
  uploadProgress: number; // 上传进度(0-100)
}

/**
 * 压缩图片函数
 * @param file 原始图片文件
 * @param maxSize 最大文件大小（字节）
 * @returns 压缩后的图片文件
 */
const compressImage = async (file: File, maxSize: number = 100 * 1024): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 计算压缩比例
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // 调整图片尺寸
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 初始压缩质量
        let quality = 0.9;
        let compressedDataUrl: string;

        const compressStep = () => {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          // 计算数据URL对应的字节大小
          const byteString = atob(compressedDataUrl.split(',')[1]);
          const byteArray = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
          }
          const compressedSize = byteArray.length;

          // 如果压缩后的大小仍超过限制，继续降低质量
          if (compressedSize > maxSize && quality > 0.1) {
            quality -= 0.1;
            compressStep();
          } else {
            // 转换为File对象
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(compressedFile);
          }
        };

        compressStep();
      };
      img.onerror = () => {
        reject(new Error('Image load failed'));
      };
    };
    reader.onerror = () => {
      reject(new Error('File read failed'));
    };
  });
};

/**
 * 图片上传管理Hook
 * @param initialImages 初始图片列表
 * @param savePath 保存图片路径
 * @returns 图片管理相关状态和方法
 */
export function useEphemeralImageManager(
  initialImages: File[] = [],
  savePath: string = ''
): UseEphemeralImageManagerReturn {
  const [images, setImages] = useState<File[]>(initialImages);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 生成图片预览URL
  const generatePreviews = useCallback((newImages: File[]) => {
    return newImages.map(file => URL.createObjectURL(file));
  }, []);

  // 初始化预览
  useEffect(() => {
    if (initialImages.length > 0) {
      setImagePreviews(generatePreviews(initialImages));
    }
  }, [initialImages, generatePreviews]);

  // 处理图片上传
  const handleImageUpload: ImageHandler = useCallback(async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('请上传 JPG 或 PNG 格式的图片');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 立即生成并显示缩略图，不等待压缩完成
      const tempPreview = URL.createObjectURL(file);
      const newImages = [...images];
      const newPreviews = [...imagePreviews];
      newImages[index] = file;
      newPreviews[index] = tempPreview;
      setImages(newImages);
      setImagePreviews(newPreviews);

      // 模拟上传进度，加快进度条
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 20;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setIsUploading(false);
              // 更新图片列表和预览
              setUploadProgress(100);
              console.log(`图片将保存到路径: ${savePath}`);
              console.log(`图片大小: ${Math.round(file.size / 1024)} KB`);
            }, 200);
          }
          return newProgress;
        });
      }, 100);
    } catch (error) {
      setIsUploading(false);
      alert('图片处理失败');
      console.error('图片处理失败:', error);
    }
  }, [images, imagePreviews, savePath]);

  // 移除图片
  const removeImage = useCallback((index: number) => {
    // 释放预览URL占用的内存
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  }, [images, imagePreviews]);

  // 重置所有图片
  const resetImages = useCallback(() => {
    // 释放预览URL占用的内存
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
  }, [imagePreviews]);

  // 组件卸载时清理预览URL
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return {
    images,
    imagePreviews,
    handleImageUpload,
    removeImage,
    resetImages,
    isUploading,
    uploadProgress
  };
}