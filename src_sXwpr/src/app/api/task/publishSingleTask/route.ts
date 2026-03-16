// 发布单个任务API路由
// 该文件是Next.js API路由，用于处理发布单个任务的HTTP请求
// 遵循RESTful设计规范，只处理POST请求，其他方法返回405

import { NextResponse } from 'next/server';
import { handlePublishSingleTask } from '../../../../api/handlers/task/publishSingleTaskHandler';

/**
 * POST方法处理函数 - 发布单个任务
 * @param request - Next.js请求对象
 * @returns NextResponse - API响应
 */
export async function POST(request: Request): Promise<NextResponse> {
  // 调用处理函数，不包含业务逻辑
  return handlePublishSingleTask(request);
}

/**
 * GET方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function GET(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * PUT方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function PUT(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * DELETE方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function DELETE(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * PATCH方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function PATCH(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * HEAD方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function HEAD(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * OPTIONS方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function OPTIONS(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
