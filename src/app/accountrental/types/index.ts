// 短视频账号租赁信息接口
export interface AccountRentalInfo {
  id: string;
  platform: string;
  platformIcon: string;
  accountTitle: string;
  followersRange: string;
  engagementRate: string;
  contentCategory: string;
  price: number;
  rentalDuration: number;
  minimumRentalHours: number;
  accountScore: number;
  region: string;
  accountAge: string;
  deliveryTime: number;
  maxConcurrentUsers: number;
  responseTime: number;
  availableCount: number;
  publishTime: string;
}