// 用户相关类型定义
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  role: string;
}