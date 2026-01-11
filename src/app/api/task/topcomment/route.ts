import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');

/**
 * 上评评论发布API路由
 * 功能：处理用户发布评论任务的请求
 */
export async function POST(request: Request) {
  try {
    // 1. 从Cookie获取并验证token
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
    
    // 2. 解析请求体
    let requestData: any;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 3. 验证必填字段
    const requiredFields = [
      'title', 'description', 'platform', 'taskType', 
      'totalQuantity', 'unitPrice', 'deadline', 'requirements',
      'commentDetail'
    ];
    
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} 是必填字段` },
          { status: 400 }
        );
      }
    }
    
    // 验证commentDetail中的必填字段
    const { commentDetail } = requestData;
    
    if (commentDetail.commentType === 'SINGLE') {
      const requiredCommentFields = [
        'linkUrl1', 'unitPrice1', 'quantity1', 'commentText1'
      ];
      
      for (const field of requiredCommentFields) {
        if (!commentDetail[field] && commentDetail[field] !== 0) {
          return NextResponse.json(
            { success: false, message: `评论详情中的 ${field} 是必填字段` },
            { status: 400 }
          );
        }
      }
    }
    
    // 4. 构建并调用外部API
    const apiUrl = `${config.baseUrl}${config.endpoints.task.publish}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestData)
    });

    const responseData = await response.json();
    // 5. 处理API响应

    const responseToClient = {
      success: responseData.success,
      message: responseData.message || '',
      code: responseData.code,
      data: responseData.data,
      timestamp: Date.now()
    };
   
    if (response.ok) {
      console.log('请求url:', apiUrl);
      console.log('请求token :Bearer ', token);
      console.log('请求体:', JSON.stringify(requestData));
      console.log('响应状态:', response.status);

      // 准备响应数据，确保包含timestamp字段  
    return NextResponse.json(responseToClient);
    }else{
      return NextResponse.json(responseToClient, { status: response.status });
    }
    
    
    
  } catch (error) {
    // 处理API请求错误
    if ((error as any).message?.includes('fetch')) {
      return NextResponse.json(
        { success: false, message: '外部API请求失败，请稍后重试' },
        { status: 503 }
      );
    }
    
    // 全局错误处理
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 处理不支持的HTTP方法
 */
export async function GET() {
  return NextResponse.json(
    { success: false, message: '不支持GET方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: '不支持PUT方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: '不支持DELETE方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}