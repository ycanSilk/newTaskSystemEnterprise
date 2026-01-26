// 获取通知列表API路由
// 遵循API_REQUEST_STANDARD.md的规范，负责路由分发和HTTP方法处理

import { NextResponse } from 'next/server';
import { handleGetNotificationsList } from '@/api/handlers/notifications/getNotificationsListHandlers';

/**
 * GET请求处理函数
 * @returns NextResponse - 调用处理函数返回的标准化响应
 */
export async function GET(): Promise<NextResponse> {
  return handleGetNotificationsList();
}

/**
 * POST请求处理函数 - 不支持
 * @returns NextResponse - 405方法不允许响应
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
 * PUT请求处理函数 - 不支持
 * @returns NextResponse - 405方法不允许响应
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
 * DELETE请求处理函数 - 不支持
 * @returns NextResponse - 405方法不允许响应
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

/**
 * PATCH请求处理函数 - 不支持
 * @returns NextResponse - 405方法不允许响应
 */
export async function PATCH(): Promise<NextResponse> {
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
 * OPTIONS请求处理函数 - 不支持
 * @returns NextResponse - 405方法不允许响应
 */
export async function OPTIONS(): Promise<NextResponse> {
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