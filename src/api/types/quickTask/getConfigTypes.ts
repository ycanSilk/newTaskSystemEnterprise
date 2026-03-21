// 快捷派单配置相关类型定义

// 配置信息接口
export interface ConfigInfo {
  name: string; // 固定名称
  douyin_id: string; // 抖音ID（@用户ID）
}

// 快捷派单配置数据接口
export interface QuickTaskConfigData {
  id: number; // 配置ID
  b_user_id: number; // 商家用户ID
  username: string; // 用户名
  config_info: ConfigInfo; // 配置信息
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
}

// API响应数据接口
export interface GetQuickTaskConfigResponseData {
  code: number; // 状态码
  message: string; // 消息
  data: QuickTaskConfigData; // 数据
  timestamp: number; // 时间戳
}

// 前端API响应接口
export interface GetQuickTaskConfigResponse {
  success: boolean; // 是否成功
  message: string; // 消息
  data: QuickTaskConfigData | null; // 数据
  code?: number; // 状态码
  timestamp?: number; // 时间戳
}
