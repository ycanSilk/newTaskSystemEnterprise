// 响应数据类型
export interface RentalAccountInfo {
  id: number;
  userId: string;
  accountType: number;
  accountLevel: string;
  platform: number;
  description: string;
  pricePerDay: number;
  depositAmount: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  status: string;
  totalOrders: number;
  completedOrders: number;
  successRate: number;
  createTime: string;
  images?: string[];
  is_my: boolean;
  title: string;
  created_at: string;
  min_days: number;
  max_days: number;
  allow_renew_text: string;
  status_text: string;
  price_per_day_yuan: number;
}

// API响应数据接口
export interface GetOffersRentalMarketListResponseData {
  list: RentalAccountInfo[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// API响应接口
export interface GetOffersRentalMarketListResponse {
  code: number;
  message: string;
  data: GetOffersRentalMarketListResponseData;
  success: boolean;
  timestamp: number;
  status?: number;
}
