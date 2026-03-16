// 错误处理模块
// 这个文件包含了API客户端中使用的错误处理相关的类型和函数

// 导入axios错误类型，用于处理axios请求过程中产生的错误
import type { AxiosError } from 'axios';
// 导入通用API响应类型，用于创建标准化的错误响应
import type { ApiResponse } from '../types/common';

/**
 * API错误类型枚举
 * 定义了所有可能的API错误类型，方便统一处理和分类
 */
export enum ApiErrorType {
  /**
   * 网络错误
   * 例如：请求超时、网络连接失败、跨域错误等
   */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /**
   * 认证错误
   * 例如：未登录、token过期、权限不足等
   */
  AUTH_ERROR = 'AUTH_ERROR',
  
  /**
   * 参数错误
   * 例如：缺少必要参数、参数格式错误、参数类型错误等
   */
  PARAM_ERROR = 'PARAM_ERROR',
  
  /**
   * 服务器错误
   * 例如：服务器内部错误、数据库错误、服务不可用等
   */
  SERVER_ERROR = 'SERVER_ERROR',
  
  /**
   * 未知错误
   * 所有无法归类的错误都会被标记为未知错误
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * API错误接口
 * 用于定义标准化的API错误格式，包含错误类型、错误码、错误信息等
 */
export interface ApiError {
  /**
   * 错误类型
   * 从ApiErrorType枚举中取值
   */
  type: ApiErrorType;
  
  /**
   * 错误码
   * 表示具体的错误原因，例如：401表示未授权，404表示资源不存在等
   */
  code: number;
  
  /**
   * 错误信息
   * 对错误的文字描述，方便开发者理解错误原因
   */
  message: string;
  
  /**
   * 原始错误
   * 可选，保存原始的AxiosError对象，方便调试和获取更多错误信息
   */
  originalError?: AxiosError;
  
  /**
   * 状态码
   * HTTP状态码，例如：200表示成功，400表示请求错误，500表示服务器错误等
   */
  status: number;
}

/**
 * 处理API错误
 * 将原始的AxiosError转换为标准化的ApiError对象
 * @param error - 原始的AxiosError对象
 * @returns 标准化的ApiError对象
 */
export function handleApiError(error: any): ApiError {
  // 如果是AxiosError，说明是请求过程中产生的错误
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    // 获取HTTP状态码
    const status = axiosError.response?.status || 500;
    
    // 根据不同的错误类型和状态码，生成对应的ApiError对象
    if (axiosError.response) {
      // 服务器返回了错误响应（状态码不是2xx）
      const responseData = axiosError.response.data as any;
      
      switch (status) {
        case 400:
          // 参数错误
          return {
            type: ApiErrorType.PARAM_ERROR,
            code: responseData.code || 400,
            message: responseData.message || '请求参数错误',
            originalError: axiosError,
            status
          };
        case 401:
        case 403:
          // 认证错误
          return {
            type: ApiErrorType.AUTH_ERROR,
            code: responseData.code || status,
            message: responseData.message || '认证失败，请重新登录',
            originalError: axiosError,
            status
          };
        case 404:
          // 资源不存在
          return {
            type: ApiErrorType.PARAM_ERROR,
            code: responseData.code || 404,
            message: responseData.message || '请求的资源不存在',
            originalError: axiosError,
            status
          };
        case 500:
        case 502:
        case 503:
        case 504:
          // 服务器错误
          return {
            type: ApiErrorType.SERVER_ERROR,
            code: responseData.code || status,
            message: responseData.message || '服务器错误，请稍后重试',
            originalError: axiosError,
            status
          };
        default:
          // 其他错误
          return {
            type: ApiErrorType.UNKNOWN_ERROR,
            code: responseData.code || status,
            message: responseData.message || '请求失败，请稍后重试',
            originalError: axiosError,
            status
          };
      }
    } else if (axiosError.request) {
      // 请求已经发送，但没有收到响应
      return {
        type: ApiErrorType.NETWORK_ERROR,
        code: 500,
        message: '网络错误，请检查网络连接',
        originalError: axiosError,
        status: 500
      };
    } else {
      // 请求配置错误
      return {
        type: ApiErrorType.PARAM_ERROR,
        code: 400,
        message: axiosError.message || '请求配置错误',
        originalError: axiosError,
        status: 400
      };
    }
  }
  
  // 如果不是AxiosError，说明是其他类型的错误
  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    code: 500,
    message: error.message || '未知错误，请稍后重试',
    status: 500
  };
}

/**
 * 创建标准化的错误响应
 * 根据ApiError对象，创建符合ApiResponse格式的错误响应
 * @param error - 标准化的ApiError对象
 * @returns 标准化的API错误响应
 */
export function createErrorResponse<T = any>(error: ApiError): ApiResponse<T> {
  return {
    // 错误响应的success字段为false
    success: false,
    // 使用错误码作为响应码
    code: error.code,
    // 使用错误信息作为响应消息
    message: error.message,
    // 错误响应的数据字段为空
    data: null as unknown as T,
    // 设置响应时间戳为当前时间
    timestamp: Date.now(),
    // 设置错误类型
    errorType: error.type
  };
}
