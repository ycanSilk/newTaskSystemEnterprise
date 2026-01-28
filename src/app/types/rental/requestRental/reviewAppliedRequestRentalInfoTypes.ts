// 审核求租信息应征申请 - 类型定义

// 审核请求参数类型
export interface ReviewApplicationRequest {
  application_id: number;
  action: 'approve' | 'reject';
  days: number;
  reject_reason: string;
}

// 审核响应数据类型
export interface ReviewApplicationResponseData {
  application_id: number;
  status: 1 | 2;
  status_text: string;
  order_id: string;
}

// 审核响应类型
export interface ReviewApplicationResponse {
  success: boolean;
  code: number;
  message: string;
  data: ReviewApplicationResponseData | null;
  timestamp: number;
}
