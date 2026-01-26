// 求租市场列表数据类型定义

// 求租信息项接口
export interface RequestRentalItem {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  title: string;
  budget_amount: number;
  budget_amount_yuan: string;
  days_needed: number;
  deadline: number;
  deadline_datetime: string;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_my: boolean;
}

// 分页信息接口
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// API响应数据接口
export interface GetRequestRentalMarketListResponseData {
  list: RequestRentalItem[];
  pagination: Pagination;
}

// API响应接口
export interface GetRequestRentalMarketListResponse {
  success: boolean;
  code: number;
  message: string;
  data: GetRequestRentalMarketListResponseData;
  timestamp: number;
}
