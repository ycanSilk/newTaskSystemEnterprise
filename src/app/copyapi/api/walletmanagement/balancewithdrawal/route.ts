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
    console.log('Received request data:', requestData);
  } catch (parseError) {
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }
  
  // 参数验证
  if (!requestData.amount || requestData.amount <= 0) {
    return NextResponse.json({ success: false, message: '请输入有效的提现金额' }, { status: 400 });
  }
  
  if (!requestData.securityPassword) {
    return NextResponse.json({ success: false, message: '请输入支付密码' }, { status: 400 });
  }
  
  // 构建新的请求体，包含所需的参数
  const newRequestBody = {
    amount: requestData.amount,
    securityPassword: requestData.securityPassword,
    remark: requestData.remark || ""
  };
  
  // 简化API URL构建，直接拼接baseUrl和endpoint
  const apiUrl = `${config.baseUrl}${config.endpoints.wallet.withdraw}`;
  
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
    
  // 获取原始响应数据
    const responseData = await response.json();


    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取交易记录失败，请稍后重试' 
    }, { status: 500 });
  }
}

