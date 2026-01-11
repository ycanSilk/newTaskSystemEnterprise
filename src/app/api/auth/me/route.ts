// 验证用户登录状态的API端点
// 这个端点会检查请求中的cookie，如果存在有效的token，就返回用户信息，否则返回未登录状态

import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/api/client/config';

/**
 * 验证用户登录状态的GET请求处理函数
 * @param req - Next.js请求对象
 * @returns Next.js响应对象，包含用户信息或未登录状态
 */
export async function GET(req: NextRequest) {
  try {
    // 从请求的cookie中获取token
    const token = req.cookies.get(apiConfig.auth.tokenCookieName)?.value;
    console.log('GET /api/auth/me 收到的token:', token);
    // 如果没有token，返回未登录状态
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '用户未登录',
        data: null
      }, { status: 401 });
    }
    
    // 这里可以添加更多验证逻辑，比如验证token的有效性
    // 例如，调用后端API验证token，或者解析JWT token获取用户信息
    
    // 返回完整的User对象，包含所有必填字段
    // 实际项目中应该调用后端API验证token并获取真实用户信息
    return NextResponse.json({
      success: true,
      message: '用户已登录',
      data: {
        id: '1', // 模拟用户ID
        username: 'publisher', // 模拟用户名
        role: 'publisher', // 角色信息
        balance: 0, // 模拟余额
        status: 'active', // 模拟状态
        createdAt: new Date().toISOString(), // 模拟创建时间
        // 其他可选字段可以省略或设置默认值
        token: token, // 包含原始token，用于后续请求验证
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '验证用户登录状态失败',
      data: null
    }, { status: 500 });
  }
}
