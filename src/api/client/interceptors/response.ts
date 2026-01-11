// 响应拦截器
// 用于处理响应后的统一处理，包括标准化响应格式、错误处理等
// 所有API响应在返回给调用者之前都会经过这个拦截器处理

// 导入axios的响应类型
import { AxiosResponse } from 'axios';
// 导入错误处理相关的工具函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../errorHandler';

/**
 * 响应拦截器函数（处理成功响应）
 * @param response - axios响应对象，包含响应的所有信息（状态码、数据等）
 * @returns 处理后的响应对象，标准化了响应格式
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // 记录响应日志（仅开发环境）
  // 在开发环境下，打印响应的详细信息，方便调试
  if (process.env.NODE_ENV === 'development') {
    console.log('API Response:', {
      url: response.config.url,  // 请求的URL
      status: response.status,   // 响应状态码
      data: response.data,       // 响应数据
    });
  }
  
  // 标准化响应格式
  // 确保所有响应都有统一的格式，方便前端处理
  if (response.data) {
    // 如果响应数据没有success字段，根据HTTP状态码添加默认值
    // success表示请求是否成功，true表示成功，false表示失败
    if (response.data.success === undefined) {
      // 状态码在200-299之间表示请求成功
      response.data.success = response.status >= 200 && response.status < 300;
    }
    
    // 如果响应数据没有code字段，添加HTTP状态码
    // code表示响应的状态码，比如200、404、500等
    if (response.data.code === undefined) {
      response.data.code = response.status;
    }
    
    // 如果响应数据没有timestamp字段，添加当前时间戳
    // timestamp表示响应返回的时间，方便调试和日志分析
    if (response.data.timestamp === undefined) {
      response.data.timestamp = Date.now();
    }
    
    // 如果响应数据没有message字段，添加默认消息
    // message表示响应的提示信息，比如"请求成功"、"请求失败"等
    if (response.data.message === undefined) {
      response.data.message = response.data.success ? '请求成功' : '请求失败';
    }
  }
  
  // 返回处理后的响应对象，axios会将这个对象返回给调用者
  return response;
};

/**
 * 响应错误拦截器函数（处理失败响应）
 * @param error - axios错误对象，包含错误的详细信息
 * @returns Promise.reject() 包装的标准化错误对象，让调用者可以通过catch捕获
 */
export const responseErrorInterceptor = async (error: any): Promise<never> => {
  // 记录错误日志
  // 打印错误的详细信息，方便调试和问题定位
  console.error('API Error:', {
    url: error.config?.url,       // 请求的URL（如果有）
    method: error.config?.method, // 请求方法（如果有）
    status: error.response?.status, // 响应状态码（如果有）
    error: error.message,         // 错误信息
    data: error.response?.data,   // 响应数据（如果有）
  });
  
  // 统一错误处理
  // 调用handleApiError函数，将原始错误对象转换为标准化的ApiError对象
  const apiError = handleApiError(error);
  
  // 创建标准化的错误响应
  // 调用createErrorResponse函数，将ApiError对象转换为前端需要的响应格式
  const errorResponse = createErrorResponse(apiError);
  
  // 返回Promise.reject，让调用者可以通过catch捕获错误
  // Promise.reject表示异步操作失败，返回的是一个被拒绝的Promise
  return Promise.reject(errorResponse);
};

// 导出默认响应拦截器
// 这里将成功和错误拦截器包装成一个对象，方便在axios实例中使用
export default {
  success: responseInterceptor,   // 处理成功响应的拦截器
  error: responseErrorInterceptor, // 处理失败响应的拦截器
};
