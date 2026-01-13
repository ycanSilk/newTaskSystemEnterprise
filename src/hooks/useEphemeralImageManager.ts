// hooks/useEphemeralImageManager.ts
import { useState, useCallback, useEffect } from 'react';

type ImageHandler = (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;

// Hook返回类型定义
export interface UseEphemeralImageManagerReturn {
  images: File[]; // 当前上传的图片文件列表
  imagePreviews: string[]; // 图片预览URL列表
  uploadedUrls: string[]; // 上传到服务器后的图片URL列表
  handleImageUpload: ImageHandler; // 图片上传处理函数
  removeImage: (index: number) => void; // 移除指定索引的图片
  resetImages: () => void; // 重置所有图片
  isUploading: boolean; // 是否正在上传
  uploadProgress: number; // 上传进度(0-100)
  uploadStatus: string; // 上传状态信息
  selectedPreviewIndex: number | null; // 当前选中的预览图片索引
  setSelectedPreviewIndex: (index: number | null) => void; // 设置选中的预览图片索引
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
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null); // 添加预览图选择状态

  // 生成图片预览URL - 使用data: URL代替blob: URL
  const generatePreviews = useCallback((newImages: File[]) => {
    return Promise.all(newImages.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }));
  }, []);

  // 初始化预览 - 只在组件挂载时执行一次
  useEffect(() => {
    if (initialImages.length > 0) {
      generatePreviews(initialImages).then(previews => {
        setImagePreviews(previews);
      });
    }
  }, [generatePreviews, initialImages]);

  // 处理图片上传
  const handleImageUpload: ImageHandler = useCallback(async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadStatus('请上传 JPG 或 PNG 格式的图片');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('正在上传...');

    try {
      // 立即生成并显示缩略图，使用data: URL
      const tempPreview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      
      // 使用函数式更新，避免依赖外部状态
      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[index] = file;
        return newImages;
      });
      
      setImagePreviews(prevPreviews => {
        const newPreviews = [...prevPreviews];
        newPreviews[index] = tempPreview;
        return newPreviews;
      });
      
      setUploadedUrls(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index] = ''; // 清空之前可能的URL，准备上传新的
        return newUrls;
      });

      // 压缩图片到100KB以内
      const compressedFile = await compressImage(file, 100 * 1024);
      
      // 模拟上传进度，加快进度条
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 20;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 100);
      
      // 调用API上传图片 - 使用binary格式直接上传到服务器
      console.log('调用API上传图片，URL:', '/api/imagesUpload');
      
      const response = await fetch(`/api/imagesUpload?savePath=${encodeURIComponent(savePath)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: await compressedFile.arrayBuffer(),
        credentials: 'include' // 包含cookie，用于认证
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('API响应状态:', response.status);
      const responseData = await response.json();
      console.log('API响应数据:', responseData);
      
      if (responseData.code === 0) {
        // 上传成功，更新URL但保持预览图为data: URL，避免CSP问题
        const serverUrl = responseData.data.url;
        setUploadedUrls(prevUrls => {
          const updatedUrls = [...prevUrls];
          updatedUrls[index] = serverUrl;
          return updatedUrls;
        });
        setUploadStatus('上传成功');
        console.log('图片上传成功，URL:', serverUrl);
      } else {
        // 上传失败
        setUploadStatus(`上传失败: ${responseData.message}`);
        console.error('图片上传失败:', responseData);
      }
      
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      setUploadStatus('上传失败');
      console.error('图片处理或上传失败:', error);
    }
  }, [savePath]);

  // 移除图片
  const removeImage = useCallback((index: number) => {
    // 使用函数式更新，避免依赖外部状态
    setImagePreviews(prevPreviews => {
      const newPreviews = [...prevPreviews];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setUploadedUrls(prevUrls => {
      const newUrls = [...prevUrls];
      newUrls.splice(index, 1);
      return newUrls;
    });
  }, []);

  // 重置所有图片
  const resetImages = useCallback(() => {
    // 使用函数式更新，避免依赖外部状态
    setImagePreviews([]);
    setImages([]);
    setUploadedUrls([]);
    setUploadStatus('');
  }, []);

  // 移除不需要的清理逻辑，因为data: URL不需要释放内存
  useEffect(() => {
    return () => {
      // 不需要清理data: URL
    };
  }, [imagePreviews]);

  return {
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
  };
}