// 完整的账号租赁信息接口定义
export interface AccountRentalInfo {
  id: string;             // 唯一标识符
  platform: string;       // 平台
  platformIcon?: React.ReactNode; // 平台图标
  accountTitle: string;   // 账号标题
  followersRange: string; // 粉丝范围
  engagementRate: string; // 互动率
  contentCategory: string; // 内容类别
  region: string;         // 地区
  accountAge: string;     // 账号年龄
  accountScore: number;   // 账号评分
  orderPrice: number;     // 订单价格
  price: number;          // 实际价格
  rentalDuration: number; // 租赁时长(天)
  minimumRentalHours: number; // 最小租赁小时数
  deliveryTime: number;   // 交付时间
  maxConcurrentUsers: number; // 最大并发用户数
  responseTime: number;   // 响应时间
  includedFeatures: string[]; // 包含功能
  description: string;    // 描述
  rentalDescription?: string; // 租赁描述(向后兼容)
  advantages: string[];   // 优势
  restrictions: string[]; // 限制
  isVerified: boolean;    // 是否认证
  rating: number;         // 评分
  rentalCount: number;    // 出租次数
  availableCount: number; // 可用数量
  publishTime: string;    // 发布时间
  status: string;         // 状态
  images: string[];       // 图片URL数组
  publisherName: string;  // 发布者名称
  // 向后兼容的字段
  orderNumber?: string;   // 订单号
  orderStatus?: string;   // 订单状态
  rentalDays?: number;    // 出租天数(向后兼容)
}