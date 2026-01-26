// 求租信息详情类型定义

// 求租要求JSON数据接口
export interface RequirementsJson {
  email: string;
  qq_number: string;
  deblocking: number;
  phone_number: string;
  phone_message: number;
  requested_all: number;
  scan_code_login: number;
  basic_information: number;
  other_requirements: number;
  account_requirements: string;
}

// 求租信息详情数据接口
export interface RequestRentalInfoDetail {
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
}

// API响应数据接口
export interface GetRequestRentalInfoDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: RequestRentalInfoDetail;
  timestamp: number;
}
