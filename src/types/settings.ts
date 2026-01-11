// 系统设置类型
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  taskReviewTime: number; // 小时
  withdrawMinAmount: number;
  withdrawFee: number;
  platformCommission: number; // 百分比
  inviteCommission: number; // 百分比
  autoReview: boolean;
  maintenanceMode: boolean;
}

// 用户角色类型
export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  maxWithdrawDaily: number;
  reviewRequired: boolean;
  color: string;
}

// 任务分类类型
export interface TaskCategory {
  id: number;
  name: string;
  icon: string;
  enabled: boolean;
  minPrice: number;
  maxPrice: number;
}

// 系统通知类型
export interface SystemNotification {
  id: number;
  title: string;
  content: string;
  type: 'maintenance' | 'feature' | 'info';
  enabled: boolean;
  startTime: string;
  endTime: string;
}

// 表单输入变化类型
export type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;