import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const operation = 'GET_TASK_STATS';
  try {
    // 1. 身份验证
    const cookieStore = await cookies();
    const tokenKeys = ['PublishTask_token'];
    let token: string | undefined;
    
    for (const key of tokenKeys) {
      token = cookieStore.get(key)?.value;
      if (token) break;
    }
    
    if (!token) {
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    // 2. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.taskcount}`;
    
    // 3. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders
    });

    // 4. 处理API响应
    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 5. 判断请求是否成功
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    const statusCode = isSuccess ? 200 : 500;
    
    // 6. 构建响应
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取任务统计信息成功' : '获取任务统计信息失败'),
      code: responseData.code || (isSuccess ? 200 : 500),
      data: responseData.data || {
      publishedCount: 0,
      acceptedCount: 0,
      submittedCount: 0,
      completedCount: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      todayEarnings: 0,
      monthEarnings: 0,
      passedCount: 0,
      rejectedCount: 0,
      passRate: 0,
      avgCompletionTime: 0,
      ranking: 0,
      agentTasksCount: 0,
      agentEarnings: 0,
      invitedUsersCount: 0
      },
      timestamp: Date.now()
    };
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 错误处理
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        code: 500,
        data: {
          totalTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          cancelledTasks: 0,
          totalAmount: 0,
          taskTypeDistribution: {}
        },
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

