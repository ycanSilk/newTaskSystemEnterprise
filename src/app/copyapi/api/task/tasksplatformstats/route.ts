import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '../../apiconfig/config.json';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Helper function to validate date format (YYYY-MM-DD)
    const isValidDate = (dateString: string): boolean => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
    };

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Validate and set startDate
    let startDate: string;
    if (startDateParam) {
      if (!isValidDate(startDateParam)) {
        return NextResponse.json(
          { success: false, message: 'Invalid startDate format. Please use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      startDate = startDateParam;
    } else {
      startDate = today;
    }

    // Validate and set endDate
    let endDate: string;
    if (endDateParam) {
      if (!isValidDate(endDateParam)) {
        return NextResponse.json(
          { success: false, message: 'Invalid endDate format. Please use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
      endDate = endDateParam;
    } else {
      endDate = today;
    }

    // Ensure endDate is not earlier than startDate
    if (new Date(startDate) > new Date(endDate)) {
      endDate = startDate;
    }

    console.log('日期参数处理结果:');
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);

    // 从Cookie获取token - 优先使用管理员token
    const cookieStore = await cookies();
    let token: string | undefined;
    
    // 优先检查管理员token
    token = cookieStore.get('admin_token')?.value;
    
    // 如果没有管理员token，再检查其他类型的token
    if (!token) {
      const tokenKeys = ['commenter_token', 'PublishTask_token', 'user_token', 'auth_token', 'token'];
      for (const key of tokenKeys) {
        token = cookieStore.get(key)?.value;
        if (token) break;
      }
    }
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: '认证失败，请先登录' 
      }, { status: 401 });
    }

    const targetUrl = `${config.baseUrl}/tasks/platform-stats?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    // 获取响应数据
    const responseData = await response.json();
    
    console.log('平台任务统计API日志:');
    console.log('请求URL:', targetUrl.toString());
    console.log('请求token:', token);
    console.log('响应数据:', responseData);

    // 返回成功响应
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    
    let errorMessage = '获取平台统计信息失败，请稍后重试';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接';
        statusCode = 408;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器';
        statusCode = 503;
      }
    }

    return NextResponse.json({
      code: statusCode,
      message: errorMessage,
      data: null,
      success: false,
      timestamp: Date.now()
    });
  }
}