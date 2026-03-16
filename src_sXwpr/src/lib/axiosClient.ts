'use client';

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API配置常量
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/',
  TIMEOUT: 10000,
  RETRY_TIMES: 3,
} as const;

// API响应类型
interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 自定义错误类型
class ApiError extends Error {
  code: number;
  data: any;
  timestamp: number;

  constructor(message: string, code: number, data: any, timestamp: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
    this.timestamp = timestamp;
  }
}

// 创建axios实例
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosClient.interceptors.request.use(
  (config): InternalAxiosRequestConfig => {
    // 生成X-Request-Id
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // 生成X-Request-Time
    const requestTime = Date.now().toString();
    
    // 使用axios提供的set方法来设置headers，避免类型错误
    config.headers.set('X-Request-Id', requestId);
    config.headers.set('X-Request-Time', requestTime);

    // 从localStorage获取token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || null;
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return config;
  },
  (error): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => {
    const data = response.data;
    
    // 检查响应是否成功
    if (!data.success) {
      throw new ApiError(data.message, data.code, data.data, data.timestamp);
    }

    return response;
  },
  (error: AxiosError): Promise<ApiError> => {
    let errorMessage = '网络请求失败';
    let errorCode = 500;
    let errorData = null;
    let timestamp = Date.now();

    if (error.response) {
      // 服务器返回了错误响应
      const responseData = error.response.data as any;
      errorMessage = responseData.message || errorMessage;
      errorCode = responseData.code || error.response.status;
      errorData = responseData.data;
      timestamp = responseData.timestamp || timestamp;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '服务器无响应，请稍后重试';
    } else {
      // 请求配置出错
      errorMessage = error.message || errorMessage;
    }

    return Promise.reject(new ApiError(errorMessage, errorCode, errorData, timestamp));
  }
);

// 封装GET请求
export const get = async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosClient.get<ApiResponse<T>>(url, {
      ...config,
      params,
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// 封装POST请求
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// 封装PUT请求
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// 封装DELETE请求
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// 封装PATCH请求
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await axiosClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// 导出axios实例
export default axiosClient;

export type { ApiResponse, ApiError };