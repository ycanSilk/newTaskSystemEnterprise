// 审核求租信息应征申请 - 类型定义

// 请求数据类型
export interface ReviewAppliedRequestRentalInfoRequest {
  application_id: number;
  action: 'approve' | 'reject';
  days: number;
  reject_reason: string;
}

// 响应数据类型
export interface ReviewAppliedRequestRentalInfoResponseData {
  application_id: number;
  status: 0 | 1 | 2;
  status_text: string;
  order_id: string;
}

// API响应接口
export interface ReviewAppliedRequestRentalInfoResponse {
  code: number;
  message: string;
  data: ReviewAppliedRequestRentalInfoResponseData;
  timestamp: number;
}

// 标准化API响应接口
export interface StandardReviewAppliedRequestRentalInfoResponse {
  success: boolean;
  message: string;
  data: ReviewAppliedRequestRentalInfoResponseData | null;
  code?: number;
  timestamp?: number;
}
