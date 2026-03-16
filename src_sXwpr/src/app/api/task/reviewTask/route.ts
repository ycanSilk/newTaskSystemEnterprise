// Task模块 - 审核任务API路由
// 这个文件定义了审核任务的API路由，用于处理前端的审核任务请求
import { NextResponse } from 'next/server';
import { handleReviewTask } from '../../../../api/handlers/task/reviewTaskHandler';

/**
 * 处理审核任务POST请求
 * @param request - 请求对象，包含审核任务的相关信息
 * @returns NextResponse - 包含审核结果的响应对象
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleReviewTask(request);
}

/**
 * 处理审核任务GET请求
 * GET方法不允许用于审核任务，返回405错误
 * @returns NextResponse - 包含错误信息的响应对象
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
 * 处理审核任务PUT请求
 * PUT方法不允许用于审核任务，返回405错误
 * @returns NextResponse - 包含错误信息的响应对象
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
 * 处理审核任务DELETE请求
 * DELETE方法不允许用于审核任务，返回405错误
 * @returns NextResponse - 包含错误信息的响应对象
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
