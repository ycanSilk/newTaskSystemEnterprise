export * from './accountBalance';
export * from './financialRecords';
export * from './invite';
export * from './order';
export * from './settings';
export * from './rentalOrder';

// 用户角色
export type UserRole = 'admin' | 'publisher' | 'commenter';

// 任务需求类型已经在后面重新定义，保留更具体的版本

// 用户信息
export interface User {
  id: string;
  username: string;
  password?: string;  // 仅用于认证，不在前端显示
  email?: string;
  phone?: string;
  role: UserRole;
  nickname?: string;
  avatar?: string;
  balance: number;
  level?: string;  // 改为可选的string类型
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  invitationCode?: string; // 邀请码
  permissions?: string[];  // 管理员权限
  stats?: {  // 统计数据
    totalTasks?: number;
    activeTasks?: number;
    completedTasks?: number;
    totalSpent?: number;
    todayTasks?: number;
    totalEarnings?: number;
    level?: string;  // stats中也可能包含level
  };
}

// 任务相关
export interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  commentUrl?: string;
  price: number;
  total: number;
  remaining: number;
  requirements: TaskRequirement[];
  category: string;
  difficulty: 1 | 2 | 3;
  status: 'active' | 'completed'; // 根据规范，主任务只有进行中和已完成两种状态
  publisherId: string;
  deadline: string;
  isHot?: boolean;
  countdown?: number;
  createdAt: string;
  updatedAt: string;
}

// Tabs组件类型定义
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface TaskRequirement {
  type: 'comment' | 'like' | 'follow' | 'share';
  count?: number;
  atUser?: string;
  template?: string;
}

// 任务执行
export interface TaskExecution {
  id: string;
  taskId: string;
  commenterId: string;
  status: 'grabbed' | 'submitted' | 'approved' | 'rejected';
  screenshots: string[];
  submitTime?: string;
  reviewTime?: string;
  rejectReason?: string;
  earnings: number;
}

// 邀请系统
export interface InviteInfo {
  id: string;
  inviterUserId: string;
  inviteeUserId: string;
  inviteCode: string;
  commissionRate: number;
  totalCommission: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface InviteStats {
  totalFriends: number;
  activeFriends: number;
  totalCommission: number;
  todayCommission: number;
  monthlyCommission: number;
  pendingCommission: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 支付相关
export interface PaymentMethod {
  id: string;
  type: 'alipay' | 'wechat' | 'usdt' | 'bank';
  name: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  type: 'recharge' | 'withdraw' | 'consume' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method?: PaymentMethod;
  createdAt: string;
  completedAt?: string;
}

// 通知消息
export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'system' | 'task' | 'payment' | 'invite';
  status: 'unread' | 'read';
  createdAt: string;
}

// 组件Props类型
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';  // 添加type属性
}

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface TaskCardProps {
  task: Task;
  onGrab?: (taskId: string) => void;
  onView?: (taskId: string) => void;
  showGrabButton?: boolean;
  className?: string;
}

export interface MobileLayoutProps {
  children: React.ReactNode;
  showEarnings?: boolean;  // 添加showEarnings属性
  navigationItems?: NavigationItem[];  // 添加navigationItems属性
  showHeader?: boolean;
  showNavigation?: boolean;
  title?: string;
}

import React from 'react';

// 导航项类型
export interface NavigationItem {
  icon: string | React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

// 表单类型
export interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  verifyCode: string;
  inviteCode?: string;
  agreement: boolean;
}

// 筛选和排序
export interface TaskFilters {
  category?: string;
  difficulty?: number;
  priceRange?: [number, number];
  status?: string;
  sortBy?: 'price' | 'createTime' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}