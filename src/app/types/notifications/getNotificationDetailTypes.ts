// 获取通知详情API的类型定义

// 通知详情接口
export interface NotificationDetail {
  id: number;
  notification_id: number;
  title: string;
  content: string;
  is_read: number;
  read_at: string | null;
  created_at: string;
}

// 标准化API响应接口
export interface GetNotificationDetailResponse {
  success: boolean;
  message: string;
  data: NotificationDetail | null;
  code: number;
  timestamp: number;
}