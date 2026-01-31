import React from 'react';

interface CopyCommentButtonProps {
  comment: string;
  className?: string;
  buttonText?: string;
}

const CopyCommentButton: React.FC<CopyCommentButtonProps> = ({
  comment,
  className = '',
  buttonText = ''
}) => {
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
          console.log('评论已复制到剪贴板（传统方法）', text);
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

  const handleCopyComment = async () => {
    const commentText = comment || '';
    // 复制评论到剪贴板（兼容PC和手机端，支持HTTP和HTTPS）
    try {
      // 优先尝试现代剪贴板API（确保navigator.clipboard和writeText方法都存在）
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(commentText);
          console.log('评论已复制到剪贴板（现代API）', commentText);
        } catch (clipboardError) {
          console.log('现代剪贴板API失败，尝试传统方法:', clipboardError);
          // 现代API失败时回退到传统方法
          useTraditionalCopyMethod(commentText);
        }
      } else {
        // 不支持现代剪贴板API时使用传统方法
        useTraditionalCopyMethod(commentText);
      }
    } catch (error) {
      console.error('复制评论失败:', error);
    }
  };

  return (
    <button
      className={`text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-500 transition-colors ${className}`}
      onClick={handleCopyComment}
    >
      {buttonText}
    </button>
  );
};

export default CopyCommentButton;