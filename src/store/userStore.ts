// 用户信息状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// 导入用户信息类型定义
import { User } from '@/types';

// 定义Store的状态和方法
interface UserState {
  // 状态 (State)
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isLoginSuccess: boolean; // 登录成功标记

  // 方法 (Actions)
  // 用于设置用户信息（登录成功后调用）
  setUser: (user: User) => void;
  // 用于清除用户信息（登出时用）
  clearUser: () => void;
  // 用于设置登录成功状态
  setLoginSuccess: (success: boolean) => void;
}

// 创建并导出Zustand store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // 初始状态
      currentUser: null,
      isLoading: false,
      error: null,
      isLoginSuccess: false,

      // 方法的实现
      setUser: (user) => {
        console.log('设置用户信息:', user);
        // 保存到内存中，同时通过persist中间件持久化到localStorage
        set({ currentUser: user, isLoading: false, error: null, isLoginSuccess: true });
      },

      clearUser: () => {
        console.log('清除用户信息');
        set({ currentUser: null, error: null, isLoginSuccess: false });
      },

      setLoginSuccess: (success) => {
        console.log('设置登录成功状态:', success);
        set({ isLoginSuccess: success });
      },
    }),
    {
      name: 'publisher-user-storage', // localStorage中的键名
      partialize: (state) => ({
        currentUser: state.currentUser, // 只持久化currentUser
        isLoginSuccess: state.isLoginSuccess, // 持久化登录成功状态
      }),
    }
  )
);

// 导出登录成功后保存用户信息的辅助函数
export const saveUserOnLoginSuccess = (userData: any) => {
  const { setUser } = useUserStore.getState();
  
  // 从登录响应中提取用户信息
  const user: User = {
    id: userData.user_id?.toString() || '',
    username: userData.username || '',
    email: userData.email || '',
    phone: userData.phone || '',
    user_id: userData.user_id || 0,
    organization_name: userData.organization_name || '',
    organization_leader: userData.organization_leader || '',
    role: 'publisher' as const,
    balance: 0,
    status: 'active' as const,
    createdAt: new Date().toISOString()
  };
  
  setUser(user);
  console.log('登录成功后保存用户信息到内存:', user);
};
