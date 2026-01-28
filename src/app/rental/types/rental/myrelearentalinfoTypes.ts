// 出租信息状态类型 - 数字类型
export type RentalOfferStatus = 0 | 1 | 2;

// 状态文本映射 - 数字状态码到文本的映射
export const statusTextMap: Record<RentalOfferStatus, string> = {
  0: '已下架',
  1: '上架中',
  2: '已封禁'
};

// 状态值到选项卡key的映射
export const statusToTabKeyMap: Record<RentalOfferStatus, string> = {
  0: 'INACTIVE',
  1: 'ACTIVE',
  2: 'INACTIVE' // 封禁状态显示在已下架选项卡
};

// 分页信息接口
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 出租信息接口
export interface RentalOffer {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  title: string;
  price_per_day: number;
  price_per_day_yuan: string;
  min_days: number;
  max_days: number;
  allow_renew: number;
  allow_renew_text: string;
  status: RentalOfferStatus;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_my: boolean;
}

// API响应数据接口
export interface GetOffersRentalMarketListResponseData {
  list: RentalOffer[];
  pagination: Pagination;
}

// API响应接口
export interface GetOffersRentalMarketListResponse {
  code: number;
  message: string;
  data: GetOffersRentalMarketListResponseData;
  timestamp: number;
}

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

// 上下架出租信息响应接口
export interface ToggleOffersRentalInfoStatusResponse {
  code: number;
  message: string;
  data: ToggleOffersRentalInfoStatusResponseData;
  timestamp: number;
}