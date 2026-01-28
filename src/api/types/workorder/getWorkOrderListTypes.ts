// 获取工单列表API类型定义

// 工单信息接口
export interface WorkOrder {
  ticket_id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: string;
  status_text: string;
  order_id: number;
  order_amount: string;
  order_days: number;
  order_status: number;
  order_status_text: string;
  buyer_username: string;
  seller_username: string;
  is_creator: boolean;
  my_role: string;
  message_count: number;
  unread_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// 分页信息接口
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// API响应数据接口
export interface GetWorkOrderListResponseData {
  list: WorkOrder[];
  pagination: Pagination;
}

// 原始API响应接口
export interface RawGetWorkOrderListResponse {
  code: number;
  message: string;
  data: GetWorkOrderListResponseData;
  timestamp: number;
}

// 标准化API响应接口
export interface GetWorkOrderListResponse {
  success: boolean;
  code: number;
  message: string;
  data: GetWorkOrderListResponseData | null;
  timestamp: number;
}

// 请求参数接口
export interface GetWorkOrderListParams {
  page: number;
  page_size: number;
  role: string;
  status: number | string;
}