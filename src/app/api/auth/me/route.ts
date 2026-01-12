// 验证用户登录状态的API端点
// 这个端点会检查请求中的cookie，如果存在有效的token，就返回用户信息，否则返回未登录状态

import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/api/client/config';

// 标记为动态路由，因为它使用了request.cookies，无法静态渲染
export const dynamic = 'force-dynamic';

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
    
    // 验证请求头中的Authorization token
    const authHeader = req.headers.get('Authorization');
    const headerToken = authHeader?.replace('Bearer ', '');
    // 使用请求头中的token或cookie中的token
    const validToken = headerToken || token;
    
    // 返回完整的User对象，包含所有必填字段
    // 实际项目中应该调用后端API验证token并获取真实用户信息
    // 根据需求，返回包含指定字段的用户信息
    return NextResponse.json({
      success: true,
      message: '用户已登录',
      data: {
        user_id: 2, // 用户ID（数字类型）
        username: 'ceshi', // 用户名
        email: '2235676091@qq.com', // 邮箱
        phone: null, // 手机号（可为null）
        organization_name: '测试团队', // 组织名称
        organization_leader: 'test', // 组织负责人
        role: 'publisher', // 角色信息
        token: validToken, // 包含原始token，用于后续请求验证
        // 保留原有的id字段以兼容现有代码
        id: '2',
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('验证用户登录状态失败:', error);
    return NextResponse.json({
      success: false,
      message: '验证用户登录状态失败',
      data: null
    }, { status: 500 });
  }
}
