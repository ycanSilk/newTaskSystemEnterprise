import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('获取子任务详情API请求开始');

    const requestData = await request.json();
    const { subTaskId } = requestData;

    if (!subTaskId || typeof subTaskId !== 'string' || subTaskId.trim() === '') {
      console.log('参数验证失败: 子任务ID不能为空');
      return NextResponse.json(
        { 
          code: 400, 
          message: '子任务ID不能为空', 
          data: null, 
          success: false,
          timestamp: Date.now()
        }, 
        { status: 400 }
      );
    }

    // 获取token - 只从HttpOnly Cookie获取
    let token = '';
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('PublishTask_token');
      token = cookieToken?.value || '';
    } catch (cookieError) {
      console.error('无法从Cookie获取token:', cookieError);
    }
    
    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }
    
    // 4. 获取API配置
    const baseUrl = config.baseUrl;
    const timeout = config.timeout;
    const defaultHeaders = config.headers;

    const apiUrl = `${baseUrl}/tasks/subtasks/${subTaskId}`;

    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log(`API URL: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    });
    const data = await response.json();
    console.log("这是获取子任务详情的API返回的日志输出:");
    console.log("apiurl:", apiUrl);
    console.log("这是获取子任务详情的API返回的日志输出:", token);
    console.log('这是获取子任务详情的API返回的日志输出:', response);
    console.log(`外部API响应: status=${response.status}, message=${data?.message || '无消息'}`);
    console.log(`子任务列表数据: ${JSON.stringify(data?.data)}`);

    let httpStatus = response.status;
    if (response.ok && data && data.success === false) {
      httpStatus = data.code || 400;
      if (httpStatus < 400 || httpStatus >= 600) {
        httpStatus = 400;
      }
    }
    // 返回API响应
    return NextResponse.json(data, { status: httpStatus });
    
  } catch (error) {
    console.error('获取子任务详情API调用失败:', error);
    
    return NextResponse.json(
      { 
        code: 500, 
        message: '服务器内部错误', 
        data: null, 
        success: false,
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  } finally {
    console.log('获取子任务详情API请求结束');
  }
}
