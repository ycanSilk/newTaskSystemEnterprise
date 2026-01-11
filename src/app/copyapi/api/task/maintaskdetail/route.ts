import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('获取主任务详情API请求开始');
    
    // 从请求中获取taskId参数
    const requestData = await request.json();
    const { taskId } = requestData;
    // 参数验证
    if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
      console.log('参数验证失败: 任务ID不能为空');
      return NextResponse.json(
        { 
          code: 400, 
          message: '任务ID不能为空', 
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
    
    // 构造完整的API URL，将taskId作为路径参数
    const apiUrl = `${baseUrl}/tasks/${taskId}`;
    
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 构造请求参数
    const requestParams = {
      ...requestData // 包含其他可能的参数
    };

    
    
    // 调用外部API获取主任务详情
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    });
    
    // 解析响应数据
    const data = await response.json();

    console.log("这是主任务详情页面的API返回的日志输出:");
    console.log(`请求参数: ${JSON.stringify(requestParams)}`);
    console.log("apiurl:", apiUrl);
    console.log("token:", token);
    console.log('请求返回的数据:', response);
    // 输出完整的响应结果，不做格式化处理
    console.log('完整的响应结果数据:');
    console.log(data);
    
    // 根据外部API返回的success字段决定HTTP状态码
    // 如果外部API返回的success为false，应该返回适当的错误状态码
    let httpStatus = response.status;
    if (response.ok && data && data.success === false) {
      // 如果外部API返回了成功的HTTP状态码但数据中包含错误
      // 根据错误类型设置合适的HTTP状态码
      httpStatus = data.code || 400;
      // 确保httpStatus是有效的HTTP状态码
      if (httpStatus < 400 || httpStatus >= 600) {
        httpStatus = 400;
      }
    }
    
    // 返回API响应
    return NextResponse.json(data, { status: httpStatus });
    
  } catch (error) {
    console.error('获取主任务详情API调用失败:', error);
    
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
    console.log('获取主任务详情API请求结束');
  }
}
