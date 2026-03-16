// Auth模块 - 退出登录相关类型定义

/**
 * 退出登录请求参数类型
 */
export interface LogoutRequest {
  // 退出登录请求不需要请求体
}

/**
 * 退出登录响应数据类型
 */
export interface LogoutResponseData {
  /** 用户ID */
  user_id: number;
  /** 退出登录时间 */
  logout_at: string;
}

/**
 * 退出登录完整响应类型
 */
export interface LogoutResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: LogoutResponseData;
  /** 时间戳 */
  timestamp: number;
}

/**
 * API响应基础类型
 */
export interface ApiResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 响应数据 */
  data: any;
}
