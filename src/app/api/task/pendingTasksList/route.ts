// Task模块 - 获取待审核任务列表API路由
// 这个文件是获取待审核任务列表API的中间件，用于处理客户端的获取待审核任务列表请求
import { NextRequest, NextResponse } from 'next/server';
// 导入处理函数
import { handlePendingTasksList } from '../../../../api/handlers/task/pendingTasksListHandler';

/**
 * 处理获取待审核任务列表请求
 * 调用handlePendingTasksList函数，处理用户的获取待审核任务列表请求
 * @param req - Next.js请求对象
 * @returns Next.js响应对象，包含获取待审核任务列表结果
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return handlePendingTasksList();
  console.log(handlePendingTasksList())
  console.log(NextResponse)
}

/**
 * 处理POST请求 - 方法不允许
 * 获取待审核任务列表API只支持GET方法，POST方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * 处理PUT请求 - 方法不允许
 * 获取待审核任务列表API只支持GET方法，PUT方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}

/**
 * 处理DELETE请求 - 方法不允许
 * 获取待审核任务列表API只支持GET方法，DELETE方法返回405错误
 * @returns Next.js响应对象，包含方法不允许的错误信息
 */
export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      code: 405,
      message: '方法不允许，请使用GET请求',
      timestamp: Date.now(),
      data: null
    },
    { status: 405 }
  );
}
