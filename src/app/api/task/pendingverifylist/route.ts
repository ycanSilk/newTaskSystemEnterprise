import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');

export async function POST(request: Request) {
  const operation = 'GET_PENDING_VERIFY_TASKS';
  
 
  
  try {
    // 1. 记录请求URL和方法信息
    const url = new URL(request.url);
    
    // 3. 身份验证
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
    // 记录token获取情况用于调试
 

    // 4. 解析请求体
    let requestData;
    try {
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      requestData = JSON.parse(rawBody);
      

    } catch (jsonError) {
     return NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 3. 验证必填参数
    if (requestData.page === undefined || typeof requestData.page !== 'number' || requestData.page < 0) {
      return NextResponse.json(
        { success: false, message: '页码必须是非负整数' },
        { status: 400 }
      );
    }
    
    if (!requestData.size || typeof requestData.size !== 'number' || requestData.size < 1 || requestData.size > 100) {
      return NextResponse.json(
        { success: false, message: '每页条数必须是1-100之间的整数' },
        { status: 400 }
      );
    }
    


    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.pendingverify}`;
    const requestParams = {
      page: requestData.page === undefined ? 0 : requestData.page,
      size: requestData.size === undefined ? 10 : requestData.size,
      sortField: requestData.sortField === undefined ? 'createTime' : requestData.sortField,
      sortOrder: requestData.sortOrder === undefined ? 'DESC' : requestData.sortOrder,
      platform: requestData.platform === undefined ? 'DOUYIN' : requestData.platform,
      taskType: requestData.taskType === undefined ? 'COMMENT' : requestData.taskType,
      minPrice: requestData.minPrice === undefined ? 1 : requestData.minPrice,
      maxPrice: requestData.maxPrice === undefined ? 999 : requestData.maxPrice,
      keyword: requestData.keyword === undefined ? '' : requestData.keyword
    };
    
    // 6. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestParams)
    });
    
    // 7. 处理API响应
    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);  
    } catch (jsonError) {
      console.error(`${operation} 错误: API响应解析失败 - ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 7. 判断请求是否成功
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    const statusCode = isSuccess ? 200 : 500;
    
    // 8. 构建响应
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取已发布任务列表成功' : '获取已发布任务列表失败'),
      code: responseData.code || (isSuccess ? 200 : 500),
      data: {
        list: responseData.data?.list || responseData.data?.tasks || [],
        total: responseData.data?.total || 0,
        page: requestData.page,
        size: requestData.size,
        pages: Math.ceil((responseData.data?.total || 0) / requestData.size)
      },
      timestamp: Date.now()
    };
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 记录错误信息
    console.error(`[${new Date().toISOString()}] 请求错误: ${operation}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // 错误处理
    return NextResponse.json(
      { 
        code: 500,
        message: '服务器内部错误',
        data: {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        success: true,
        timestamp: 1
      }
    );
  }
}




