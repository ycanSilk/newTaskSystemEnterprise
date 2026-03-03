// 出租信息下单接口类型定义

// 买家信息接口
export interface BuyerInfo {
  usage: string; // 用途
  contact: string; // 联系方式
  notes: string; // 备注
}

// 请求参数接口
export interface CreateRentalOrderRequest {
  offer_id: number; // 出租信息ID
  days: number; // 租赁天数
  buyer_info: BuyerInfo; // 买家信息
}

// 响应数据接口
export interface CreateRentalOrderResponseData {
  order_id: string; // 订单ID
  offer_id: number; // 出租信息ID
  days: number; // 租赁天数
  total_amount: number; // 总金额
  status: number; // 订单状态
  status_text: string; // 订单状态文本
}

// API响应接口
export interface CreateRentalOrderResponse {
  code: number; // 状态码
  message: string; // 消息
  data: CreateRentalOrderResponseData; // 响应数据
  timestamp: number; // 时间戳
}

// 前端响应接口
export interface FrontendCreateRentalOrderResponse {
  success: boolean; // 是否成功
  message: string; // 消息
  data: CreateRentalOrderResponseData | null; // 响应数据
}
