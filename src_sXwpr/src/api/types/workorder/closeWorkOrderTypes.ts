// 关闭工单请求类型定义
export interface CloseWorkOrderRequest {
  ticket_id: number;
  close_reason: string;
}

// 关闭工单响应数据类型
export interface CloseWorkOrderResponseData {
  code: number;
  message: string;
  data: {
    ticket_id: number;
    ticket_no: string;
    status: number;
    status_text: string;
  };
  timestamp: number;
}

// API响应接口
export interface CloseWorkOrderResponse {
  success: boolean;
  message: string;
  data: {
    ticket_id: number;
    ticket_no: string;
    status: number;
    status_text: string;
  } | null;
}