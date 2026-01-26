import { NextResponse } from 'next/server';
import { handleGetApplyedRequestRentalInfoList } from '../../../../../api/handlers/rental/requestRental/getApplyedRequestRentalInfoListHandlers';

/**
 * 处理获取已申请的求租信息列表的GET请求
 * @returns 标准化的API响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 解析查询参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    
    // 调用处理函数
    return handleGetApplyedRequestRentalInfoList(page, pageSize);
  } catch (error) {
    // 处理请求解析错误
    return NextResponse.json(
      {
        success: false,
        code: 400,
        message: '请求参数格式错误',
        timestamp: Date.now(),
        data: null
      },
      { status: 400 }
    );
  }
}

/**
 * 处理POST请求（不支持）
 * @returns 405错误响应
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
 * 处理PUT请求（不支持）
 * @returns 405错误响应
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
 * 处理DELETE请求（不支持）
 * @returns 405错误响应
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
