// 响应数据类型
interface ContentJson {
  images: string[];
  deblocking: string;
  account_info: string;
  publish_comment: string;
  phone_message: string;
  publish_video: string;
  requested_all: string;
  name_and_photo: string;
  scan_code_login: string;
}

interface RentalInfoDetail {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  publisher_email: string;
  title: string;
  price_per_day: number;
  price_per_day_yuan: string;
  min_days: number;
  max_days: number;
  allow_renew: number;
  allow_renew_text: string;
  content_json: ContentJson;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

// API响应数据接口
export interface GetOffersRentalInfoDetailResponseData {
  code: number;
  message: string;
  data: RentalInfoDetail;
  timestamp: number;
}

// API响应接口
export interface GetOffersRentalInfoDetailResponse {
  success: boolean;
  message: string;
  data: RentalInfoDetail | null;
  code: number;
  timestamp: number;
}
