// 创建出租报价请求数据类型
export interface CreateOffersRentalInfoRequest {
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: 0 | 1;
  content_json: {
    account_info: string;
    name_and_photo: '0' | '1';
    publish_comment: '0' | '1';
    publish_video: '0' | '1';
    deblocking: '0' | '1';
    scan_code_login: '0' | '1';
    phone_message: '0' | '1';
    requested_all: '0' | '1';
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