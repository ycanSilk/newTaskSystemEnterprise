// 申请JSON数据结构
interface ApplicationJson {
  screenshots: string[];
  description: string;
}

// 请求参数类型
export interface ApplyRequestRentalInfoRequest {
  demand_id: number;
  allow_renew: 0 | 1;
  application_json: ApplicationJson;
}

// 响应数据类型
interface ApplyRequestRentalInfoData {
  application_id: string;
  demand_id: number;
  status: 0;
  status_text: string;
}

// API响应数据接口
export interface ApplyRequestRentalInfoResponseData {
  code: number;
  message: string;
  data: ApplyRequestRentalInfoData;
  timestamp: number;
}

// API响应接口
export interface ApplyRequestRentalInfoResponse {
  success: boolean;
  message: string;
  data: ApplyRequestRentalInfoData | null;
}
