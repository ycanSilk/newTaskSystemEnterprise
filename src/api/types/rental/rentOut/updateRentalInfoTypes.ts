// 更新出租信息请求和响应类型定义

// 内容JSON结构
export interface UpdateRentalInfoContentJson {
  account_info: string;
  basic_information: string;
  post_douyin: string;
  deblocking: string;
  identity_verification: string;
  scan_code: string;
  phone_message: string;
  other_require: string;
  images: string[];
  phone_number: string;
  email: string;
}

// 更新出租信息请求参数
export interface UpdateRentalInfoRequest {
  id: number;
  title: string;
  price_per_day: string;
  min_days: string;
  max_days: string;
  allow_renew: string;
  content_json: UpdateRentalInfoContentJson;
}

// 更新出租信息响应数据
export interface UpdateRentalInfoResponseData {
  offer_id: string;
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: number;
  status: number;
}

// API响应结构
export interface UpdateRentalInfoResponse {
  code: number;
  message: string;
  data: UpdateRentalInfoResponseData;
  timestamp: number;
}

// 标准化API响应
export interface UpdateRentalInfoApiResponse {
  success: boolean;
  message: string;
  data: UpdateRentalInfoResponseData | null;
  code?: number;
  timestamp?: number;
}
