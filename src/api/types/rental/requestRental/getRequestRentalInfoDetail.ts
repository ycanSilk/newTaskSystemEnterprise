// 求租信息详情类型定义

// 求租要求JSON数据接口
export interface RequirementsJson {
  email: string;
  qq_number: string;
  deblocking: string;
  phone_number: string;
  phone_message: string;
  requested_all: string;
  scan_code_login: string;
  basic_information: string;
  other_requirements: string;
  account_requirements: string;
  account_password: string;
  post_douyin: string;
  post_ad: string;
}

// 求租信息详情数据接口
export interface RequestRentalInfoDetailData {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  publisher_email: string;
  title: string;
  budget_amount: number;
  budget_amount_yuan: string;
  days_needed: number;
  deadline: number;
  deadline_datetime: string;
  requirements_json: RequirementsJson;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  application_count: number;
}

// API响应数据接口
export interface GetRequestRentalInfoDetailResponseData {
  code: number;
  message: string;
  data: RequestRentalInfoDetailData;
  timestamp: number;
}

// API响应接口
export interface GetRequestRentalInfoDetailResponse {
  success: boolean;
  message: string;
  data: RequestRentalInfoDetailData | null;
}
