// 获取工单列表API路由中间件
// 处理来自前端的工单列表请求，调用对应的处理函数

import { NextResponse } from 'next/server';
import { handleGetWorkOrderList } from '../../../../api/handlers/workorder/getWorkOrderListHandlers';

/**
 * GET请求处理函数
 * 用于获取工单列表数据
 * @param request NextRequest对象，包含请求信息
 * @returns NextResponse 标准化的API响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 解析URL查询参数
    const url = new URL(request.url);
    // 从查询参数中获取分页、角色和状态信息
    // 如果没有提供，使用默认值
    const page = parseInt(url.searchParams.get('page') || '1');
    const page_size = parseInt(url.searchParams.get('page_size') || '10');
    const role = url.searchParams.get('role') || 'all';
    const statusParam = url.searchParams.get('status') || 'all';
    // 处理status参数，'all'表示所有状态，否则转换为数字
    const status = statusParam === 'all' ? 'all' : parseInt(statusParam);

    // 调用API处理函数，传入解析后的参数
    return handleGetWorkOrderList({
      page,
      page_size,
      role,
      status
    });
  } catch (error) {
    // 处理请求参数解析错误
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * POST请求处理函数
 * 本API不支持POST方法，返回405错误
 * @returns NextResponse 405错误响应
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
 * PUT请求处理函数
 * 本API不支持PUT方法，返回405错误
 * @returns NextResponse 405错误响应
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
 * DELETE请求处理函数
 * 本API不支持DELETE方法，返回405错误
 * @returns NextResponse 405错误响应
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
