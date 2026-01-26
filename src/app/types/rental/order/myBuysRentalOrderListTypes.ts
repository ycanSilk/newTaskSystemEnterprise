// 我购买的租赁订单列表 - 类型定义

// 买家信息接口
interface BuyerInfoJson {
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
interface SellerInfoJson {
  description: string;
  screenshots: string[];
}

// 订单JSON信息接口
interface OrderJson {
  end_time: number;
  max_days: number;
  min_days: number;
  start_time: number;
  demand_title: string;
  price_per_day: number;
  application_id: number;
}

// 分页信息接口
interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 租赁订单项接口
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
  can_renew: boolean;
  renew_history: any[];
  renew_count: number;
  remaining_days: number;
  remaining_hours: number;
}

// API响应数据接口
interface MyBuysRentalOrderListResponseData {
  list: RentalOrderItem[];
  pagination: Pagination;
}

// API响应接口
export interface MyBuysRentalOrderListResponse {
  code: number;
  message: string;
  data: MyBuysRentalOrderListResponseData;
  timestamp: number;
}