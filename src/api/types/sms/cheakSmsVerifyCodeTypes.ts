// 短信验证码验证相关类型定义

// 请求参数类型
export interface CheakSmsVerifyCodeRequest {
  phoneNumber: string;
  verifyCode: string;
}

// 响应数据类型
export interface CheakSmsVerifyCodeResponseData {
  phone_number: string;
}

// API响应类型
export interface CheakSmsVerifyCodeResponse {
  code: number;
  message: string;
  data: CheakSmsVerifyCodeResponseData;
  timestamp: number;
}
