// 快捷派单配置更新相关类型定义

// 配置信息接口
export interface ConfigInfo {
  name: string; // 固定名称
  douyin_id: string; // 抖音ID（@用户ID）
}

// 更新配置请求接口
export interface UpdateQuickTaskConfigRequest {
  config_info: ConfigInfo; // 配置信息
}

// API响应数据接口
export interface UpdateQuickTaskConfigResponseData {
  code: number; // 状态码
  message: string; // 消息
  data: {
    config_info: ConfigInfo; // 配置信息
  };
  timestamp: number; // 时间戳
}

// 前端API响应接口
export interface UpdateQuickTaskConfigResponse {
  success: boolean; // 是否成功
  message: string; // 消息
  data: {
    config_info: ConfigInfo; // 配置信息
  } | null; // 数据
  code?: number; // 状态码
  timestamp?: number; // 时间戳
}
