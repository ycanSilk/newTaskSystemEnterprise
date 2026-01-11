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
    console.log('原始请求体:', requestData);
  } catch (parseError) {
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }

  // 验证必填参数
  const requiredParams = ['platform', 'accountType', 'expectedPricePerDay', 'expectedLeaseDays'];
  const missingParams = requiredParams.filter(param => !requestData[param]);
  if (missingParams.length > 0) {
    return NextResponse.json({ success: false, message: `缺少必填参数: ${missingParams.join(', ')}` }, { status: 400 });
  }

  // 构建新的请求体，包含所需的参数
  const newRequestBody = {
    platform: requestData.platform,
    accountType: requestData.accountType,
    expectedPricePerDay: requestData.expectedPricePerDay,
    budgetDeposit: requestData.budgetDeposit || (requestData.expectedPricePerDay * requestData.expectedLeaseDays), // 如果前端未提供押金，自动计算
    expectedLeaseDays: requestData.expectedLeaseDays,
    description: requestData.description || "" 
  };

  console.log('转换后的请求体:', newRequestBody);
  
  // 简化API URL构建，直接拼接baseUrl和endpoint
  const apiUrl = `${config.baseUrl}${config.endpoints.rental.publishrequestrental}`;
  
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
    console.log('这是发布求租信息API的日志输出:');
    console.log('请求url', apiUrl);
    console.log('token:', token);
    console.log('请求体:', newRequestBody);
    console.log('返回的状态:', response.status);
    console.log('返回的原始数据', responseData);
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '发布求租信息失败，请稍后重试' 
    }, { status: 500 });
  }
}

