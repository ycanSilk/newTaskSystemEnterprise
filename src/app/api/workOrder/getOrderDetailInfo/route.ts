// 获取工单详情API路由中间件
// 处理来自前端的工单详情请求，调用对应的处理函数

import { NextResponse } from 'next/server';
import { handleGetOrderDetailInfo } from '@/api/handlers/workorder/getOrderDetailInfoHandlers';

/**
 * GET请求处理函数
 * 用于获取工单详情数据
 * @param request NextRequest对象，包含请求信息
 * @returns NextResponse 标准化的API响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 解析URL查询参数
    const url = new URL(request.url);
    // 从查询参数中获取工单编号
    const ticket = url.searchParams.get('ticket') || '';

    // 参数验证
    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          message: '工单编号不能为空',
          timestamp: Date.now(),
          data: null
        },
        { status: 400 }
      );
    }

    // 调用API处理函数，传入解析后的参数
    return handleGetOrderDetailInfo({
      ticket
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