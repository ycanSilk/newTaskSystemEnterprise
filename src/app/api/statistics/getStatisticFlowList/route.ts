import { NextResponse } from 'next/server';
import { handleGetStatisticFlowList } from '../../../../api/handlers/statistics/getStatisticFlowListHandlers';

/**
 * GET /api/statistics/getStatisticFlowList
 * 获取流水列表
 */
export async function GET(request: Request): Promise<NextResponse> {
  // 解析查询参数
  const url = new URL(request.url);
  const params = {
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
    related_id: url.searchParams.get('related_id') ? parseInt(url.searchParams.get('related_id')!) : undefined,
    related_type: url.searchParams.get('related_type') || undefined,
    task_types: url.searchParams.get('task_types') ? parseInt(url.searchParams.get('task_types')!) : undefined,
    start_date: url.searchParams.get('start_date') || undefined,
    end_date: url.searchParams.get('end_date') || undefined
  };

  // 调用处理函数
  return handleGetStatisticFlowList(params);
}

/**
 * POST /api/statistics/getStatisticFlowList
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
 * PUT /api/statistics/getStatisticFlowList
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
 * DELETE /api/statistics/getStatisticFlowList
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
