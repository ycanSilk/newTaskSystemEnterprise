// API客户端主入口
// 整合所有核心组件，导出统一的API客户端实例
// 这个文件是API客户端的统一出口，其他文件只需要从这里导入需要的功能即可

// 导入配置好的axios实例，这是API客户端的核心，用于发送所有API请求
import axiosInstance from './axiosInstance';
// 导入API配置，包含基础URL、超时时间、默认请求头等
import { apiConfig } from './config';
// 导入错误处理相关的函数
import { handleApiError, createErrorResponse } from './errorHandler';
// 导入错误处理相关的类型定义
import type { ApiError, ApiErrorType } from './errorHandler';
// 导入请求拦截器，用于处理请求前的配置
import { requestInterceptor } from './interceptors/request';
// 导入响应拦截器，用于处理响应后的统一处理
import { responseInterceptor, responseErrorInterceptor } from './interceptors/response';

// 导出API客户端实例作为默认导出
// 其他文件可以直接导入使用这个实例发送API请求
// 例如：import apiClient from '@/api/client'; apiClient.get('/users');
export default axiosInstance;

// 导出配置，方便其他文件访问API配置
// 例如：import { apiConfig } from '@/api/client'; console.log(apiConfig.baseUrl);
export { apiConfig };

// 导出错误处理相关函数
// handleApiError: 用于将原始错误转换为标准化的ApiError对象
// createErrorResponse: 用于创建标准化的错误响应格式
export { handleApiError, createErrorResponse };

// 导出错误处理相关的类型定义
// 用于TypeScript类型检查和智能提示
export type { ApiError, ApiErrorType };

// 导出拦截器
// 这些拦截器可以用于自定义axios实例的配置
// 例如：const customInstance = axios.create(); customInstance.interceptors.request.use(requestInterceptor);
export { requestInterceptor, responseInterceptor, responseErrorInterceptor };

// 导出axios实例创建函数
// 可以用于创建自定义的axios实例，包含相同的配置和拦截器
// 例如：import { createAxiosInstance } from '@/api/client'; const customClient = createAxiosInstance();
export { createAxiosInstance } from './axiosInstance';

// 重新导出axios类型，方便其他文件使用
// 这样其他文件就不需要单独导入axios类型了
// 例如：import type { AxiosRequestConfig } from '@/api/client';
export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
