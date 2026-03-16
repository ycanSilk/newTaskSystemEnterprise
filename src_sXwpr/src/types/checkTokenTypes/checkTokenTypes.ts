// Token校验响应类型定义

// Token校验响应数据
export interface CheckTokenResponseData {
  valid: boolean;
  user_id: number;
  username: string;
  email: string;
  organization_name: string;
  organization_leader: string;
  token_expired_at: string;
  expires_in: number;
}

// Token校验API响应
export interface CheckTokenResponse {
  code: number;
  message: string;
  data: CheckTokenResponseData;
  timestamp: number;
}
