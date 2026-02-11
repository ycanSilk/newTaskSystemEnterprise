/**
 * 压缩图片函数
 * @param file 原始图片文件
 * @param maxSize 最大文件大小（字节）
 * @returns 压缩后的图片文件
 */
export const compressImage = async (file: File, maxSize: number = 80 * 1024): Promise<File> => {
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
          compressedDataUrl = canvas.toDataURL('image/webp', quality);
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
            const blob = new Blob([byteArray], { type: 'image/webp' });
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' });
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

export default compressImage;