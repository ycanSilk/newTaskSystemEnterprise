// 获取通知列表API的类型定义

// 通知项接口
interface NotificationItem {
  id: number;
  notification_id: number;
  title: string;
  preview: string;
  is_read: number;
  read_at: string | null;
  created_at: string;
}

// 分页信息接口
interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// API响应数据结构接口
interface NotificationsData {
  total: number;
  unread_count: number;
  list: NotificationItem[];
  pagination: Pagination;
}

// 原始API响应数据接口
export interface GetNotificationsListResponseData {
  code: number;
  message: string;
  data: NotificationsData;
  timestamp: number;
}

// 标准化API响应接口
export interface GetNotificationsListResponse {
  success: boolean;
  message: string;
  data: NotificationsData | null;
  code: number;
  timestamp: number;
}