// Auth模块 - 退出登录API路由
// 这个文件是退出登录API的中间件，用于处理客户端的退出登录请求
import { NextRequest, NextResponse } from 'next/server';
// 导入处理函数
import { handleLogout } from '../../../../api/handlers/auth/logoutHandler';

/**
 * 处理退出登录请求
 * 调用handleLogout函数，处理用户的退出登录请求
 * @param req - Next.js请求对象
 * @returns Next.js响应对象，包含退出登录结果
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleLogout();
}

/**
 * 处理GET请求 - 方法不允许
 * 退出登录API只支持POST方法，GET方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用POST请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * 处理PUT请求 - 方法不允许
 * 退出登录API只支持POST方法，PUT方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用POST请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * 处理DELETE请求 - 方法不允许
 * 退出登录API只支持POST方法，DELETE方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用POST请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}
