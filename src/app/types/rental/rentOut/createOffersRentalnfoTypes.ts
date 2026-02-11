// 创建出租报价请求数据类型
export interface CreateOffersRentalInfoRequest {
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: 0 | 1;
  content_json: {
    account_info: string;
    basic_information: string;
    post_douyin: string;
    deblocking: string
    identity_verification: string
    scan_code: string
    phone_message: string
    other_require: string
    images: string[];
    phone_number: string;
    qq_number: string;
    email: string;
  };
}

// 创建出租报价响应数据类型
export interface CreateOffersRentalInfoResponseData {
  offer_id: string;
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: 0 | 1;
  status: number;
}

// 创建出租报价API响应类型
export interface CreateOffersRentalInfoApiResponse {
  success: boolean;
  message: string;
  data: CreateOffersRentalInfoResponseData | null;
  code: number;
  timestamp: number;
}