// 请求拦截器
// 用于处理请求前的配置，包括添加认证信息、请求头处理等
// 所有API请求在发送之前都会经过这个拦截器处理

// 导入axios的请求配置类型
import { AxiosRequestConfig } from 'axios';
// 导入Next.js的cookies工具，用于获取Cookie中的token
import { cookies } from 'next/headers';
// 导入API配置，使用里面的默认请求头和token配置
import { apiConfig } from '../config';

/**
 * 请求拦截器函数
 * @param config - axios请求配置，包含请求的所有信息（URL、方法、头信息等）
 * @returns 处理后的请求配置，添加了认证信息和其他必要的头信息
 */
export const requestInterceptor = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  // 确保config对象存在，如果不存在就创建一个空对象
  if (!config) {
    config = {};
  }
  
  // 确保headers对象存在，如果不存在就创建一个空对象
  // headers是请求头，包含了请求的元信息，比如Content-Type、Authorization等
  if (!config.headers) {
    config.headers = {};
  }
  
  // 合并默认请求头
  // 把我们在config.ts中定义的默认请求头（比如Content-Type）和当前请求的头信息合并
  // 这样确保每个请求都有默认的头信息，同时也能覆盖默认值
  config.headers = {
    ...apiConfig.headers,  // 展开默认请求头
    ...config.headers,     // 展开当前请求的头信息，优先级更高
  };
  
  // 从Cookie获取Token（认证信息）
  try {
    // 获取Cookie存储对象
    const cookieStore = await cookies();
    let token: string | undefined;
    
    // 遍历支持的Token键名列表，尝试获取Token
    // 这是为了兼容旧版本，如果有多个可能的token名字，会依次检查
    for (const key of apiConfig.auth.tokenKeys) {
      // 尝试从Cookie中获取token值
      token = cookieStore.get(key)?.value;
      // 如果获取到了token，就跳出循环
      if (token) {
        break;
      }
    }
    
    // 如果获取到Token，添加到请求头
    // Authorization是HTTP标准的认证头，Bearer是一种认证类型
    // X-Token是自定义头，用于兼容旧的API
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-Token'] = token;
    }
  } catch (error) {
    // 如果获取token失败，记录错误日志，但不中断请求
    // 这样即使token获取失败，请求也能继续发送（可能用于不需要认证的接口）
    console.error('Error getting token from cookie:', error);
  }
  
  // 添加请求ID，用于日志追踪
  // 如果请求头中没有X-Request-Id，就生成一个
  // 这个ID可以用来在日志中关联请求和响应，方便调试
  if (!config.headers['X-Request-Id']) {
    config.headers['X-Request-Id'] = generateRequestId();
  }
  
  // 添加请求时间戳
  // 记录请求发送的时间，方便调试和性能分析
  config.headers['X-Request-Time'] = Date.now().toString();
  
  // 记录请求日志（仅开发环境）
  // 在开发环境下，打印请求的详细信息，方便调试
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', {
      method: config.method,  // 请求方法（GET、POST等）
      url: config.url,        // 请求URL
      headers: config.headers,  // 请求头信息
      data: config.data,      // 请求体数据（POST请求时使用）
      params: config.params,  // URL参数（GET请求时使用）
    });
  }
  
  // 返回处理后的请求配置，axios会使用这个配置发送请求
  return config;
};

/**
 * 生成请求ID
 * @returns 唯一的请求ID，格式为：时间戳-随机字符串
 */
const generateRequestId = (): string => {
  // Date.now()获取当前时间戳，确保每次生成的ID都不同
  // Math.random().toString(36)生成一个随机字符串，然后取第2到10位
  // 这样组合起来的ID既包含时间信息，又有随机字符，保证唯一性
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// 导出默认请求拦截器
export default requestInterceptor;
