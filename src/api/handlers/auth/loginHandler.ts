// Auth模块 - 登录请求处理逻辑
// 这个文件包含了处理登录请求的核心逻辑和设置安全Cookie的辅助函数

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入登录端点常量，用于构建登录请求URL
import { LOGIN_ENDPOINT } from '../../endpoints/auth/login';
// 导入登录请求和响应的类型定义
import { LoginRequest, LoginResponse } from '../../types/auth/loginTypes';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';
// 导入API配置，获取token Cookie名称
import { apiConfig } from '../../client/config';

/**
 * 处理登录请求
 * @param req - Next.js请求对象，包含客户端发送的登录数据
 * @returns Next.js响应对象，包含登录结果或错误信息
 */
export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体，获取客户端发送的登录数据
    // 将请求体转换为LoginRequest类型，确保数据格式正确
    const requestData: LoginRequest = await req.json();
    
    // 调用API客户端发送POST请求到登录端点
    // 使用LOGIN_ENDPOINT常量作为URL，requestData作为请求体
    // 类型参数LoginResponse表示期望的响应数据类型
    const response = await apiClient.post<LoginResponse>(LOGIN_ENDPOINT, requestData);
    
    // 从响应数据中获取token
    const token = response.data.data?.token || '';
    
    // 创建标准化的响应对象
    // 当后端返回code: 0时，success为true，否则为false
    const standardResponse = {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data,
      timestamp: response.data.timestamp,
      success: response.data.code === 0
    };
    
    // 创建响应对象
    const successResponse = NextResponse.json(standardResponse, { status: response.status });
    
    // 如果token存在，将其保存到安全的HttpOnly Cookie中
    if (token) {
      // 设置Cookie，使用API配置中的token Cookie名称
      // 过期时间设置为7天（7 * 24 * 60 * 60秒）
      setSecureHttpOnlyCookie(req, successResponse, apiConfig.auth.tokenCookieName, token, 7 * 24 * 60 * 60);
      console.log('Token set in cookie:', token);
      console.log('Cookie name:', apiConfig.auth.tokenCookieName);
      console.log('token保存情况:', token);
    }
    
    // 返回响应给客户端
    return successResponse;
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    // 使用handleApiError函数将原始错误转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    // 使用createErrorResponse函数创建标准化的错误响应
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}

/**
 * 配置并设置安全的HttpOnly Cookie
 * @param req - Next.js请求对象，用于获取请求信息
 * @param response - Next.js响应对象，用于设置Cookie
 * @param name - Cookie名称
 * @param value - Cookie值，通常是登录后获取的token
 * @param maxAge - 过期时间（秒），表示Cookie多久后失效
 */
export function setSecureHttpOnlyCookie(
  req: NextRequest,
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number
): void {
  // 计算Cookie的过期时间
  // 当前时间加上过期秒数，转换为Date对象
  const expiryDate = new Date(Date.now() + maxAge * 1000);
  
  // 判断是否为HTTPS请求
  // x-forwarded-proto是反向代理设置的协议头
  // 同时检查请求URL是否以https://开头
  // 开发环境允许使用HTTP，所以添加了环境判断
  const isHttps = req.headers.get('x-forwarded-proto') === 'https' || 
                 req.url.startsWith('https://') ||
                 // 允许在开发环境下使用HTTP
                 process.env.NODE_ENV === 'development';
  
  // 设置安全的HttpOnly Cookie，防止前端JavaScript读取，提高安全性
  response.cookies.set(name, value, {
    httpOnly: true,  // 仅HTTP访问，防止JavaScript读取Cookie，提高安全性
    secure: isHttps,  // 仅HTTPS传输，防止明文传输Cookie
    sameSite: 'lax',  // 限制跨站点请求时Cookie的发送，防止CSRF攻击
    path: '/',  // Cookie的生效路径，/表示所有路径都生效
    expires: expiryDate,  // Cookie的过期时间
    maxAge: maxAge  // Cookie的最大存活时间（秒）
  });
}
