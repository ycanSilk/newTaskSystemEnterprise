// 短信验证码发送相关类型定义

// 请求参数类型
export interface GetSmsSendCodeRequest {
  phone_number: string;
}

// 响应数据类型
export interface GetSmsSendCodeResponseData {
  phone_number: string;
  code: number;
}

// API响应类型
export interface GetSmsSendCodeResponse {
  code: number;
  message: string;
  data: GetSmsSendCodeResponseData;
  timestamp: number;
}
