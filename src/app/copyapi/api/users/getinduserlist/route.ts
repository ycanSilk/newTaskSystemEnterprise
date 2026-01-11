import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
import config from '../../apiconfig/config.json';
export const dynamic = 'force-dynamic';
// 定义用户信息类型接口
interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  email?: string | null;
  invitationCode?: string;
  createTime?: string;
  avatar?: string;
}

// 定义API响应类型接口
interface ApiResponse {
  code: number;
  message: string;
  data?: {
    userInfo?: UserInfo;
  };
  success: boolean;
  timestamp?: number;
}

export async function POST(request: Request) {
  try {
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
    console.log('从Cookie获取到的token:', token);
    console.log('看到这条代码说明调用API有效');
    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }
    // 构建完整的API URL
    const apiUrl = `${config.baseUrl}${config.endpoints.user.getinbuserlist}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        page: '0',
        size: '10',
        sortField: 'createTime',
        sortOrder: 'DESC',
        username: '',
        email: '',
        phone: ''
      }),
      signal: AbortSignal.timeout(5000)
    });
    const responseData = await response.json();
    console.log('请求URL:', apiUrl);
    console.log('请求token:', token);
    console.log('这是获取个人用户列表API返回的原始响应:', responseData);
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || `外部服务错误: ${response.status}`;
      const errorCode = responseData.code || response.status;
      return NextResponse.json({
        code: errorCode,
        message: errorMessage,
        success: false
      }, { status: response.status });
    }
    const apiUserListData = responseData.data || responseData;
    // 处理分页数据，确保与前端期望的格式一致
    const responseList = Array.isArray(apiUserListData.list) ? apiUserListData.list : [];
    const total = typeof apiUserListData.total === 'number' ? apiUserListData.total : responseList.length;
    const page = typeof apiUserListData.page === 'number' ? apiUserListData.page : 1;
    const size = typeof apiUserListData.size === 'number' ? apiUserListData.size : 10;
    const pages = typeof apiUserListData.pages === 'number' ? apiUserListData.pages : Math.ceil(total / size);
    // 构造最终响应，确保与前端定义的APIResponse格式完全匹配
    return NextResponse.json({
      code: responseData.code || 1,
      message: responseData.message || '成功',
      data: {
        list: responseList.map((user: any) => ({
          id: user.id || '',
          username: user.username || '',
          phone: user.phone || '',
          email: user.email || '',
          invitationCode: user.invitationCode || '',
          createTime: user.createTime || ''
        })),
        total,
        page,
        size,
        pages
      },
      success: responseData.success ?? true,
      timestamp: Date.now()
    });
  } catch (error) {
    // 异常处理
    let errorMessage = '服务器内部错误';
    let statusCode = 500;    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '外部API请求超时';
        statusCode = 504;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到外部API服务';
        statusCode = 503;
      } else if (error.message.includes('JSON')) {
        errorMessage = '无法解析API响应数据';
        statusCode = 502;
      }
    }
    return NextResponse.json({
      code: statusCode,
      message: errorMessage,
      success: false
    }, { status: statusCode });
  }
}
