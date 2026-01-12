// 用户信息状态管理
import { create } from 'zustand';
// 导入用户信息类型定义
import { GetUserInfoResponseData } from '@/app/types/users/getUserInfoTypes';

// 定义Store的状态和方法
interface UserState {
  // 状态 (State)
  currentUser: GetUserInfoResponseData | null;
  isLoading: boolean;
  error: string | null;

  // 方法 (Actions)
  // 用于设置用户信息
  setUser: (user: GetUserInfoResponseData) => void;
  // 用于清除用户信息（登出时用）
  clearUser: () => void;
  // 用于获取用户信息，如果内存中没有，则从API获取
  fetchUser: () => Promise<void>;
}

// 创建并导出Zustand store
export const useUserStore = create<UserState>((set, get) => ({
  // 初始状态
  currentUser: null,
  isLoading: false,
  error: null,

  // 方法的实现
  setUser: (user) => set({ currentUser: user, isLoading: false, error: null }),

  clearUser: () => set({ currentUser: null, error: null }),

  fetchUser: async () => {
    // 如果已经有用户信息了，就不再请求
    if (get().currentUser) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 调用API获取用户信息
      const response = await fetch('/api/users/getUserInfo', {
        method: 'GET',
        credentials: 'include', // 包含cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`获取用户信息失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 0 && result.data) {
        // 设置用户信息到store
        set({ 
          currentUser: result.data, 
          isLoading: false, 
          error: null 
        });
      } else {
        throw new Error(result.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息出错:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : '获取用户信息失败' 
      });
    }
  },
}));
