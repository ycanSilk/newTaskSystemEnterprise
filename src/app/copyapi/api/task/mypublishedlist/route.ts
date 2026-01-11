import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');

/**
 * 获取我发布的任务列表API路由
 * 功能：处理发布者获取已发布任务列表的请求，支持分页、排序和筛选
 */
export async function POST(request: Request) {
  try {
    // 1. 身份验证 - 简化token获取逻辑
    const cookieStore = await cookies();
    const token = cookieStore.get('PublishTask_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    // 2. 解析请求体
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: '无效的JSON格式' }, { status: 400 });
    }
    

    // 验证排序方向
    if (requestData.sortOrder && !['ASC', 'DESC'].includes(requestData.sortOrder.toUpperCase())) {
      return NextResponse.json({ success: false, message: '排序方向必须是ASC或DESC' }, { status: 400 });
    }
    // 4. 构建API请求参数
    const apiUrl = `${config.baseUrl}${config.endpoints.task.mypublished}`;
    const requestParams = {
      page:0,
      size:10,
      sortField: requestData.sortField || 'createTime',
      sortOrder: requestData.sortOrder || 'DESC',
      platform: requestData.platform || 'DOUYIN',
      taskType: requestData.taskType || 'COMMENT',
      minPrice:1,
      maxPrice:999,
      keyword: requestData.keyword || ''
    };
    
    // 5. 调用外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {})
      },
      body: JSON.stringify(requestParams)
    });

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    // 统一错误处理
    return NextResponse.json({
      success: false,
      message: '服务器内部错误',
      code: 500,
      data: {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      timestamp: Date.now()
    }, { status: 500 });
  }
}

// 处理不支持的HTTP方法
const handleUnsupportedMethod = () => NextResponse.json(
  { 
    success: false, 
    message: '不支持该HTTP方法，请使用POST',
    code: 405,
    data: { list: [], total: 0, page: 0, size: 10, pages: 0 },
    timestamp: Date.now()
  },
  { status: 405, headers: { 'Allow': 'POST' } }
);

