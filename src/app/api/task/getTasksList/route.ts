// 获取任务列表API路由
// 该文件是Next.js API路由，用于处理获取任务列表的HTTP请求
// 遵循RESTful设计规范，只处理GET请求，其他方法返回405

import { NextResponse } from 'next/server';
import { handleGetTasksList } from '../../../../api/handlers/task/getTasksListHandler';

/**
 * GET方法处理函数 - 获取任务列表
 * @param request - Next.js请求对象
 * @returns NextResponse - API响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  // 调用处理函数，不包含业务逻辑
  return handleGetTasksList(request);
}

/**
 * POST方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function POST(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * PUT方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function PUT(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * DELETE方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function DELETE(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * PATCH方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function PATCH(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * HEAD方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function HEAD(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
 * OPTIONS方法处理函数 - 不允许
 * @returns NextResponse - 405错误响应
 */
export async function OPTIONS(): Promise<NextResponse> {
  // 返回405方法不允许响应，使用标准化格式
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
