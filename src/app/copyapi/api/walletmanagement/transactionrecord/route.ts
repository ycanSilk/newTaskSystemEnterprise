import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理POST请求
export async function POST(request: Request) {
  // 从Cookie获取token
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
  
  // 解析请求体
  let requestData;
  try {
    requestData = await request.json();
  } catch (parseError) {
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }
  
  // 构建新的请求体，包含所需的参数
  const newRequestBody = {
    userId: requestData.userId || "",
    transactionType: requestData.transactionType || "",
    status: requestData.status || "",
    startDate: requestData.startDate || "",
    endDate: requestData.endDate || "",
    page: requestData.page || 1,
    size: requestData.size || 20,
    orderNo: requestData.orderNo || "",
  };
  const apiUrl = `${config.baseUrl}${config.endpoints.wallet.transactionrecord}`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      ...(config.headers || {}),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newRequestBody)
  });
  console.log('获取交易记录响应状态:', newRequestBody.status);
    
    // 获取原始响应数据
    const responseData = await response.json();
    console.log('获取交易记录成功');
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取交易记录失败，请稍后重试' 
    }, { status: 500 });
  }
}

