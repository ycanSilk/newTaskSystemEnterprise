// 获取通知列表API的类型定义

// 通知项接口
export interface NotificationItem {
  id: number;
  notification_id: number;
  title: string;
  preview: string;
  is_read: number;
  read_at: string | null;
  created_at: string;
}

// 分页信息接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// API响应数据结构接口
export interface NotificationsData {
  total: number;
  unread_count: number;
  list: NotificationItem[];
  pagination: Pagination;
}

// 标准化API响应接口
export interface GetNotificationsListResponse {
  success: boolean;
  message: string;
  data: NotificationsData | null;
  code: number;
  timestamp: number;
}