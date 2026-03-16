// 跨浏览器剪贴板功能
// 使用现代Clipboard API并提供传统方法作为fallback
// 确保在不同浏览器中都能正常工作

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 现代浏览器：使用Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 传统方法：使用document.execCommand('copy')
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 避免滚动到元素
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (error) {
        console.error('Failed to copy text:', error);
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

/**
 * 从剪贴板读取文本
 * @returns 读取的文本，如果失败则返回空字符串
 */
export const readFromClipboard = async (): Promise<string> => {
  try {
    // 现代浏览器：使用Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText();
      return text;
    } else {
      // 传统方法：使用document.execCommand('paste')
      const textArea = document.createElement('textarea');
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      
      try {
        const successful = document.execCommand('paste');
        const text = textArea.value;
        document.body.removeChild(textArea);
        return successful ? text : '';
      } catch (error) {
        console.error('Failed to read text from clipboard:', error);
        document.body.removeChild(textArea);
        return '';
      }
    }
  } catch (error) {
    console.error('Failed to read text from clipboard:', error);
    return '';
  }
};

/**
 * 检查浏览器是否支持剪贴板API
 * @returns 是否支持剪贴板API
 */
export const isClipboardApiSupported = (): boolean => {
  return typeof navigator.clipboard !== 'undefined';
};

/**
 * 检查浏览器是否支持document.execCommand('copy')
 * @returns 是否支持document.execCommand('copy')
 */
export const isExecCommandSupported = (): boolean => {
  return typeof document !== 'undefined' && typeof document.execCommand !== 'undefined';
};

/**
 * 安全地复制文本到剪贴板，自动选择最佳方法
 * @param text 要复制的文本
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export const safeCopyToClipboard = async (
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    const success = await copyToClipboard(text);
    if (success) {
      onSuccess?.();
    } else {
      throw new Error('Failed to copy text to clipboard');
    }
  } catch (error) {
    onError?.(error as Error);
    console.error('Error copying to clipboard:', error);
  }
};