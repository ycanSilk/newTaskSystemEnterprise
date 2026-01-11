// axios实例配置
// 创建并配置axios实例，集成请求和响应拦截器
// 这个文件是API客户端的核心，所有API请求都会通过这里创建的axios实例发送

// 导入axios及其相关类型
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// 导入API配置，使用里面的基础URL、超时时间和默认请求头
import { apiConfig } from './config';
// 导入请求拦截器，处理请求前的配置
import { requestInterceptor } from './interceptors/request';
// 导入响应拦截器，处理响应后的统一处理
import { responseInterceptor, responseErrorInterceptor } from './interceptors/response';

/**
 * 创建axios实例
 * @returns 配置好的axios实例，包含了所有的拦截器和默认配置
 */
export const createAxiosInstance = (): AxiosInstance => {
  // 创建axios实例，传入基础配置
  const instance = axios.create({
    // 基础URL，所有API请求都会拼接到这个URL后面
    baseURL: apiConfig.baseUrl,
    
    // 请求超时时间，单位毫秒
    // 如果请求超过这个时间没有响应，就会自动取消
    timeout: apiConfig.timeout,
    
    // 默认请求头，会被添加到所有请求中
    headers: apiConfig.headers,
    
    // 其他配置
    // withCredentials: 是否发送Cookie，设置为false表示不发送
    // 因为我们使用的是Next.js API路由作为中间层，所以不需要直接发送Cookie
    withCredentials: false,
  });
  
  // 添加请求拦截器
  // 请求拦截器会在请求发送之前执行，可以用来添加认证信息、修改请求头等
  instance.interceptors.request.use(
    // 异步请求拦截器处理函数
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      // 调用我们之前定义的请求拦截器函数，处理请求配置
      // AxiosInstance的interceptors.request.use期望接收和返回InternalAxiosRequestConfig类型
      // 而requestInterceptor函数返回的是AxiosRequestConfig类型，两者兼容，但需要明确类型转换
      return await requestInterceptor(config) as InternalAxiosRequestConfig;
    },
    // 请求错误处理函数
    (error) => {
      // 如果在请求拦截器中发生错误，记录日志并返回错误
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
  
  // 添加响应拦截器
  // 响应拦截器会在收到响应之后执行，可以用来统一处理响应格式、错误处理等
  instance.interceptors.response.use(
    // 响应成功处理函数
    responseInterceptor,
    // 响应错误处理函数
    responseErrorInterceptor
  );
  
  // 返回配置好的axios实例
  return instance;
};

// 创建并导出axios实例
// 这是一个已经配置好的axios实例，可以直接用于发送API请求
export const axiosInstance = createAxiosInstance();

// 默认导出axios实例
export default axiosInstance;