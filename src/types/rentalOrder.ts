// 租赁订单详情类型
export interface RentalOrderDetail {
  id: string;
  status: string;          // 订单状态：已完成、待付款、租赁中、已取消
  statusText: string;      // 订单状态文本描述
  accountInfo: string;     // 账号信息描述
  imageUrl: string;        // 账号图片URL
  totalAmount: number;     // 总金额
  orderNumber: string;     // 订单编号
  paymentMethod: string;   // 支付方式
  paymentTime: string;     // 支付时间
  orderTime: string;       // 下单时间
  rentalDays: number;      // 租赁天数
  accountType: string;     // 账号类型（抖音、快手等）
  followers: number;       // 粉丝数量
  avgLikes: number;        // 平均点赞数
}