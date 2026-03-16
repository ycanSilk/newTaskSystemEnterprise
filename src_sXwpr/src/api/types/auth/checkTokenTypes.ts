// Check Token API 类型定义

// 响应数据类型
interface CheckTokenResponseData {
  valid: boolean;
  user_id: number;
  username: string;
  email: string;
  organization_name: string;
  organization_leader: string;
  token_expired_at: string;
  expires_in: number;
}

// API响应数据接口
export interface CheckTokenApiResponse {
  code: number;
  message: string;
  data: CheckTokenResponseData;
  timestamp: number;
}

// 前端API响应接口
export interface CheckTokenResponse {
  success: boolean;
  message: string;
  data: CheckTokenResponseData | null;
  timestamp: number;
}
