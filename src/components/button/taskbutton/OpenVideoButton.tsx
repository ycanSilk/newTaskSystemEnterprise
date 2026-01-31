import React from 'react';
// 导入 Toast 组件用于显示提示
import { useToast } from '@/components/ui/Toast';

interface OpenVideoButtonProps {
  videoUrl: string;
  defaultUrl: string;
  className?: string;
  buttonText?: string;
}

const OpenVideoButton: React.FC<OpenVideoButtonProps> = ({
  videoUrl,
  defaultUrl,
  className = '',
  buttonText = ''
}) => {
  // 使用 Toast hook
  const { addToast } = useToast();
  
  // 传统复制方法（支持HTTP和HTTPS环境）
  const useTraditionalCopyMethod = (text: string) => {
    try {
      // 创建临时textarea元素
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 设置样式使其不可见
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      
      // 添加到文档
      document.body.appendChild(textArea);
      
      // 选择并复制文本
      textArea.focus();
      textArea.select();
      
      // 对于移动设备，尝试设置选择范围
      if (typeof textArea.setSelectionRange === 'function') {
        textArea.setSelectionRange(0, text.length);
      } else {
        // 对于不支持setSelectionRange的浏览器
        (textArea as any).createTextRange().select();
      }
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('视频URL已复制到剪贴板（传统方法）', text);
          // 显示复制成功提示
          addToast({ message: '复制成功', type: 'success' });
        } else {
          console.error('传统复制方法失败: execCommand返回false');
        }
      } catch (err) {
        console.error('传统复制方法失败:', err);
      } finally {
        // 清理临时元素
        setTimeout(() => {
          document.body.removeChild(textArea);
        }, 100);
      }
    } catch (error) {
      console.error('传统复制方法执行失败:', error);
    }
  };

  const handleOpenVideo = async () => {
    console.log('传入的url', videoUrl);
    
    // 先复制视频URL到剪贴板（兼容PC和手机端，支持HTTP和HTTPS）
    try {
      // 优先尝试现代剪贴板API（确保navigator.clipboard和writeText方法都存在）
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(videoUrl);
          console.log('视频URL已复制到剪贴板（现代API）', videoUrl);
          // 显示复制成功提示
          addToast({ message: '复制成功', type: 'success' });
        } catch (clipboardError) {
          console.log('现代剪贴板API失败，尝试传统方法:', clipboardError);
          // 现代API失败时回退到传统方法
          useTraditionalCopyMethod(videoUrl);
        }
      } else {
        // 不支持现代剪贴板API时使用传统方法
        useTraditionalCopyMethod(videoUrl);
      }
    } catch (error) {
      console.error('复制视频URL失败:', error);
    }
    
    // 然后打开新标签页跳转到指定URL
    const newWindow = window.open(defaultUrl);
    console.log('新标签页已打开，跳转地址:', defaultUrl);
  };

  return (
    <button
      className={`bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm inline-flex items-center ${className}`}
      onClick={handleOpenVideo}
    >
      {buttonText}
    </button>
  );
};

export default OpenVideoButton;