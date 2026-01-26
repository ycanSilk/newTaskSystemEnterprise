// src/api/types/workorder/creatWorkOrderTypes.ts

/**
 * 创建工单请求类型
 */
export interface CreateWorkOrderRequest {
  order_id: number;
  title: string;
  description: string;
}

/**
 * 创建工单响应数据类型
 */
export interface CreateWorkOrderResponseData {
  ticket_id: string;
  ticket_no: string;
  message: string;
}

/**
 * 创建工单API响应类型
 */
export interface CreateWorkOrderResponse {
  code: number;
  message: string;
  data: CreateWorkOrderResponseData;
  timestamp: number;
}
