// 发布组合任务API路由
// 这是一个Next.js API路由，用于处理发布组合任务的HTTP请求
// 它作为中间件，将请求转发给对应的API处理函数
// 遵循API_REQUEST_STANDARD.md规范，只处理路由逻辑，不包含业务逻辑

// 导入NextResponse，用于返回标准化的HTTP响应
import { NextResponse } from 'next/server';
// 导入发布组合任务的API处理函数
import { handlePublishCombineTask } from '../../../../api/handlers/task/publishCombineTaskHandler';

/**
 * 处理POST请求 - 发布组合任务
 * @returns 返回发布组合任务的结果
 */
export async function POST(request: Request): Promise<NextResponse> {
  // 直接调用API处理函数，将请求转发给它处理
  // 处理函数会返回标准化的NextResponse响应
  return handlePublishCombineTask(request);
}

/**
 * 处理GET请求 - 不支持
 * 返回405方法不允许的错误响应
 */
export async function GET(): Promise<NextResponse> {
  // 返回405错误响应，说明不支持GET方法
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
 * 处理PUT请求 - 不支持
 * 返回405方法不允许的错误响应
 */
export async function PUT(): Promise<NextResponse> {
  // 返回405错误响应，说明不支持PUT方法
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
 * 处理DELETE请求 - 不支持
 * 返回405方法不允许的错误响应
 */
export async function DELETE(): Promise<NextResponse> {
  // 返回405错误响应，说明不支持DELETE方法
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
 * 处理PATCH请求 - 不支持
 * 返回405方法不允许的错误响应
 */
export async function PATCH(): Promise<NextResponse> {
  // 返回405错误响应，说明不支持PATCH方法
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
