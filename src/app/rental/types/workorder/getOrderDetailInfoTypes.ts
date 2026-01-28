// 工单详情页面类型定义

// 订单信息接口
export interface OrderInfo {
  order_id: number;
  source_type: number;
  source_type_text: string;
  buyer_user_id: number;
  buyer_username: string;
  seller_user_id: number;
  seller_username: string;
  total_amount: number;
  total_amount_yuan: string;
  days: number;
  order_status: number;
  order_status_text: string;
}

// 消息信息接口
export interface Message {
  id: number;
  sender_type: number;
  sender_type_text: string;
  sender_id: number | null;
  message_type: number;
  message_type_text: string;
  content: string;
  attachments: string[] | null;
  is_read: number;
  created_at: string;
}

// 工单详情接口
export interface WorkOrderDetail {
  ticket_id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: number;
  status_text: string;
  creator_user_id: number;
  creator_user_type: number;
  is_creator: boolean;
  handler_id: number | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  order_info: OrderInfo;
  recent_messages: Message[];
  role: 'buyer' | 'seller' | 'admin';
  can_close: boolean;
  can_send_message: boolean;
}

// API响应接口
export interface WorkOrderDetailResponse {
  code: number;
  message: string;
  data: WorkOrderDetail;
  timestamp: number;
}
