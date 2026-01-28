// 申请信息列表类型定义

// 申请的JSON数据接口
export interface ApplicationJson {
  description: string;
  screenshots: string[];
}

// 单个申请信息接口
export interface ApplicationItem {
  id: number;
  demand_id: number;
  demand_title: string;
  applicant_user_id: number;
  applicant_user_type: number;
  applicant_username: string | null;
  allow_renew: number;
  application_json: ApplicationJson;
  status: number;
  status_text: string;
  review_remark: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// 申请列表数据接口
export interface GetApplyedRequestRentalInfoListData {
  total: number;
  page: number;
  page_size: number;
  list: ApplicationItem[];
}

// API响应数据接口
export interface GetApplyedRequestRentalInfoListResponseData {
  code: number;
  message: string;
  data: GetApplyedRequestRentalInfoListData;
  timestamp: number;
}

// API响应接口
export interface GetApplyedRequestRentalInfoListResponse {
  success: boolean;
  message: string;
  data: GetApplyedRequestRentalInfoListData | null;
}