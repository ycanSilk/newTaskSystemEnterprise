// 获取任务模板API路由

// 导入Next.js类型
import { NextRequest, NextResponse } from 'next/server';
// 导入获取任务模板处理函数
import { handleGetTaskTemplates } from '../../../../api/handlers/task/getTaskTemplatesHandler';

/**
 * 获取任务模板的API路由
 * @returns Next.js响应对象
 */
export async function GET(): Promise<NextResponse> {
  return handleGetTaskTemplates();
}

/**
 * 处理POST请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理PUT请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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
 * 处理DELETE请求
 * 返回405错误，表示方法不允许
 * @returns Next.js响应对象，包含错误信息
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