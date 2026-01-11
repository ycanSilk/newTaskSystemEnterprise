import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { User } from '@/types';

// Tailwind CSS类名合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化货币
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

// 格式化时间
export function formatTime(timestamp: string | number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 大于1天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化相对时间
export function formatRelativeTime(timestamp: string | number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  // 其他日期
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
}

// 任务状态颜色
export function getTaskStatusColor(status: string): string {
  const colors = {
    active: 'text-green-600 bg-green-100',
    completed: 'text-blue-600 bg-blue-100',
  };
  return colors[status as keyof typeof colors] || 'text-green-600 bg-green-100'; // 默认为进行中状态
}

// 任务状态文本
export function getTaskStatusText(status: string): string {
  const texts = {
    active: '进行中',
    completed: '已完成',
  };
  return texts[status as keyof typeof texts] || '进行中'; // 默认为进行中状态
}

// 难度星级
export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(Math.max(1, Math.min(3, difficulty)));
}

// 保存用户信息到Cookie
export function saveUserInfoToCookie(userInfo: User): void {
  try {
    if (typeof document === 'undefined') return;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7天过期
    
    let cookieStr = `commenter_user_info=${encodeURIComponent(JSON.stringify(userInfo))}; expires=${expiryDate.toUTCString()}; path=/`;
    
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      cookieStr += '; secure';
    }
    
    cookieStr += '; SameSite=lax';
    
    document.cookie = cookieStr;
  } catch (error) {
    console.error('保存用户信息到Cookie失败:', error);
  }
}

// 从Cookie获取用户信息
export function getUserInfoFromCookie(): User | null {
  try {
    if (typeof document === 'undefined') return null;
    
    const cookieMatch = document.cookie.match(/commenter_user_info=([^;]+)/);
    if (cookieMatch && cookieMatch[1]) {
      return JSON.parse(decodeURIComponent(cookieMatch[1])) as User;
    }
  } catch (error) {
    console.error('从Cookie获取用户信息失败:', error);
  }
  return null;
}

// 从Cookie移除用户信息
export function removeUserInfoFromCookie(): void {
  try {
    if (typeof document === 'undefined') return;
    
    document.cookie = 'commenter_user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch (error) {
    console.error('从Cookie移除用户信息失败:', error);
  }
}

// 生成邀请码
export function generateInviteCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId.slice(-4)}${timestamp}${random}`.toUpperCase();
}

// 手机号脱敏
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 复制到剪贴板

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

// 触觉反馈
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 50,
      medium: 100,
      heavy: 200,
    };
    navigator.vibrate(patterns[type]);
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 检查是否为移动设备
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// 检查是否为iOS设备
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// 生成UUID
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 价格范围格式化
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

// 进度百分比计算
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

// URL参数处理
export function getURLParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

// 设置页面标题
export function setPageTitle(title: string): void {
  if (typeof document !== 'undefined') {
    document.title = `${title} - 抖音派单系统`;
  }
}