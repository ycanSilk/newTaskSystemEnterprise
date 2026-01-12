// 用户信息API路由

// 标记为动态路由，因为使用了request.cookies
// 这样Next.js就不会尝试静态渲染这个路由

export const dynamic = 'force-dynamic';

// 导入Next.js类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API配置
import { apiConfig } from '@/api/client/config';
// 导入用户信息处理函数
import { getUserInfoHandler } from '@/api/handlers/users/getUserInfoHandler';

/**
 * 获取用户信息的API路由
 * @param req - Next.js请求对象
 * @returns Next.js响应对象
 */
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/users/getUserInfo 请求收到');
    
    // 直接从cookie获取x-token
    const token = req.cookies.get(apiConfig.auth.tokenCookieName)?.value;
    console.log(`从cookie获取到token: ${token}`);
    
    // 调用API处理函数获取用户信息，直接返回处理结果
    return await getUserInfoHandler(token || '');
  } catch (error) {
    console.error('GET /api/users/getUserInfo 错误:', error);
    
    // 返回错误响应
    return new NextResponse(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : '获取用户信息失败',
      data: null
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
