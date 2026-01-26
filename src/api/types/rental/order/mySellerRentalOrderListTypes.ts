// 我出售的租赁订单列表 - 类型定义

// 买家信息接口
export interface BuyerInfoJson {
  email: string;
  qq_number: string;
  deblocking: string;
  phone_number: string;
  phone_message: string;
  requested_all: string;
  basic_information: string;
  login_requirements: string;
  other_requirements: string;
  account_requirements: string;
}

// 卖家信息接口
export interface SellerInfoJson {
  description: string;
  screenshots: string[];
}

// 订单详情接口
export interface OrderJson {
  end_time: number;
  max_days: number;
  min_days: number;
  start_time: number;
  demand_title: string;
  price_per_day: number;
  application_id: number;
}

// 单个租赁订单接口
export interface RentalOrderItem {
  id: number;
  source_type: number;
  source_id: number;
  buyer_user_id: number;
  buyer_user_type: string;
  buyer_wallet_id: number;
  buyer_info_json: BuyerInfoJson;
  seller_user_id: number;
  seller_user_type: string;
  seller_wallet_id: number;
  seller_info_json: SellerInfoJson;
  total_amount: number;
  platform_amount: number;
  seller_amount: number;
  days: number;
  allow_renew: number;
  order_json: OrderJson;
  status: number;
  created_at: string;
  updated_at: string;
  buyer_username: string;
  seller_username: string;
  status_text: string;
  source_type_text: string;
  buyer_user_type_text: string;
  seller_user_type_text: string;
  total_amount_yuan: string;
  platform_amount_yuan: string;
  seller_amount_yuan: string;
  start_time: number;
  end_time: number;
  start_time_text: string;
  end_time_text: string;
  renew_history: any[];
  renew_count: number;
}

// 分页信息接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 订单列表数据接口
export interface MySellerRentalOrderListData {
  list: RentalOrderItem[];
  pagination: Pagination;
}

// API响应数据接口
export interface MySellerRentalOrderListResponseData {
  code: number;
  message: string;
  data: MySellerRentalOrderListData;
  timestamp: number;
}

// API响应接口
export interface MySellerRentalOrderListResponse {
  success: boolean;
  message: string;
  data: MySellerRentalOrderListData | null;
}
