// 出租信息状态类型
export type RentalOfferStatus = 0 | 1 | 2;

// 上下架出租信息请求体
export interface ToggleOffersRentalInfoStatusRequest {
  offer_id: number; // 出租信息id
  status: RentalOfferStatus; // 出租信息状态。0：下架、1：上架，2：已封禁
}

// 上下架出租信息响应数据
export interface ToggleOffersRentalInfoStatusResponseData {
  offer_id: number;
  status: RentalOfferStatus;
  status_text: string;
}

// API响应数据接口
export interface ToggleOffersRentalInfoStatusApiResponse {
  code: number;
  message: string;
  data: ToggleOffersRentalInfoStatusResponseData;
  timestamp: number;
}

// 标准化API响应接口
export interface ToggleOffersRentalInfoStatusResponse {
  success: boolean;
  code: number;
  message: string;
  data: ToggleOffersRentalInfoStatusResponseData;
  timestamp: number;
}