import { NextResponse } from 'next/server';
import { handleGetStatisticSummary } from '../../../../api/handlers/statistics/getStatisticSummaryHandlers';

/**
 * GET /api/statistics/getStatisticSummary
 * 获取周期统计
 */
export async function GET(request: Request): Promise<NextResponse> {
  // 解析查询参数
  const url = new URL(request.url);
  const params = {
    period: url.searchParams.get('period') || undefined,
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined
  };

  // 调用处理函数
  return handleGetStatisticSummary(params);
}

/**
 * POST /api/statistics/getStatisticSummary
 * 方法不允许
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
 * PUT /api/statistics/getStatisticSummary
 * 方法不允许
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
 * DELETE /api/statistics/getStatisticSummary
 * 方法不允许
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
