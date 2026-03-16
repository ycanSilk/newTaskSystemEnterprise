// 我购买的租赁订单列表 - 类型定义

// 买家信息接口
interface BuyerInfoJson {
  //购买账号的买家下单时输入的信息
  notes: string;          //特殊要求/备注
  usage: string;          // 买账号后的用途说明，例如：用于直播带货C端用户ctongyong测试租赁下单接口
  contact: string;        //联系方式：QQ/手机号/邮箱
}

// 卖家信息接口
interface SellerInfoJson {
   images: string[];     // 图片列表
  //账号要求
  deblocking: string;    // 解除封禁
  account_info: string;  // 出租信息详细描速
  identity_verification: string;  // 身份验证，需要实名认证
  post_douyin:string;             // 发布抖音视频和评论
  basic_information: string;      // 基本信息，需要完善个人信息
  order_requirements: string;    // 其他账号要求
  //登录要求
  phone_message: string;  // 手机号+短信验证登录
  requested_all: string;  // 按承租方要求登录
  scan_code: string;      // 扫码登录
  

  // 联系方式
  email: string;          // 邮箱
  qq_number: string;      // qq号
  phone_number: string;   // 手机号
}

// 订单JSON信息接口
interface OrderJson {
  end_time: number;
  max_days: number;
  min_days: number;
  start_time: number;
  offer_title: string;
  price_per_day: number;
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