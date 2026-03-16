// 发送消息请求类型定义
interface SendMessageRequest {
  ticket_id: number;
  message_type: number;
  content: string;
  attachments: string[];
}

// 发送消息响应数据类型
export interface SendMessageResponseData {
  code: number;
  message: string;
  data: {
    message_id: string;
    ticket_id: number;
    created_at: string;
  };
  timestamp: number;
}

// API响应接口
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message_id: string;
    ticket_id: number;
    created_at: string;
  } | null;
}

// 导出请求类型
export type { SendMessageRequest };
