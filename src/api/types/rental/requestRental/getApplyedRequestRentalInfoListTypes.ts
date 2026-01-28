// 申请列表项类型
interface ApplicationItem {
  id: number;
  demand_id: number;
  demand_title: string;
  applicant_user_id: number;
  applicant_user_type: number;
  applicant_username: string | null;
  allow_renew: number;
  application_json: {
    description: string;
    screenshots: string[];
  };
  status: number;
  status_text: string;
  review_remark: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// API响应中的data字段类型
interface ApplicationListData {
  total: number;
  page: number;
  page_size: number;
  list: ApplicationItem[];
}

// API原始响应数据接口
export interface GetApplyedRequestRentalInfoListResponseData {
  code: number;
  message: string;
  data: ApplicationListData;
  timestamp: number;
}

// 标准化后的API响应接口
export interface GetApplyedRequestRentalInfoListResponse {
  success: boolean;
  message: string;
  data: ApplicationListData | null;
}
