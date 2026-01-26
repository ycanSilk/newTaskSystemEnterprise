// 标记通知为已读API的类型定义

// 请求体接口
export interface MarkReadRequestBody {
  id: number | null; // 用户通知记录ID（user_notifications.id）必须要写
  ids?: number[]; // 批量标记（可选，与id二选一）
}

// 响应数据接口
export interface MarkReadResponseData {
  affected_count: number;
}

// 原始API响应数据接口
export interface MarkReadApiResponseData {
  code: number;
  message: string;
  data: MarkReadResponseData;
  timestamp: number;
}

// 标准化API响应接口
export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: MarkReadResponseData | null;
  code: number;
  timestamp: number;
}