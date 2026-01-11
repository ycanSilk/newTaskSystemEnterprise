import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
// 定义充值请求参数接口
interface RechargeRequest {
  channel: string;
  amount: number;
  remark: string;
}

// 定义响应接口
interface ApiResponse {
  code?: number;
  success: boolean;
  message: string;
  data?: any;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: RechargeRequest = await request.json();
    let token = '';
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('PublishTask_token');
      token = cookieToken?.value || '';
    } catch (cookieError) {
      console.error('无法从Cookie获取token:', cookieError);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '获取认证信息失败'
      }, { status: 401 });
    }

    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json<ApiResponse>({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }

    // 构建外部API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.wallet.usersrecharge}`;
    const requestHeaders: HeadersInit = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };

    // 发送请求到外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    // 解析外部API响应
    const result = await response.json();
    console.log("充值成功:", result);

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('充值API调用失败:', error);

    let errorMessage = '服务器内部错误';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接';
        statusCode = 408;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器';
        statusCode = 503;
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = '请求数据格式错误';
        statusCode = 400;
      }
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: errorMessage
    }, { status: statusCode });
  }
}