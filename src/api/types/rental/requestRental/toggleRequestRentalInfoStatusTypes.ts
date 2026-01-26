// 求租信息状态类型
export type RentalRequestStatus = 0 | 1 | 2;

// 上下架求租信息请求类型
export interface ToggleRequestRentalInfoStatusRequest {
  demand_id: number;
  status: RentalRequestStatus;
}

// 上下架求租信息响应数据类型
export interface ToggleRequestRentalInfoStatusResponseData {
  demand_id: number;
  status: RentalRequestStatus;
  status_text: string;
  budget_amount: number;
  days_needed: number;
  total_amount: number;
  budget_frozen: number;
  budget_returned: number;
}

// 上下架求租信息API响应类型
export interface ToggleRequestRentalInfoStatusResponse {
  code: number;
  message: string;
  data: ToggleRequestRentalInfoStatusResponseData;
  timestamp: number;
}
