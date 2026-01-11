import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';

// 创建标准化响应的辅助函数
function createStandardResponse(
  code: number,
  message: string,
  data: {
    list: any[];
    total: number;
    page: number;
    size: number;
    pages: number;
  },
  success: boolean
) {
  return {
    code,
    message,
    data,
    success,
    timestamp: Date.now()
  };
}

export async function POST(request: Request) {
  try {
    // 解析请求体
    let requestData;
    try {
      const rawBody = await request.text();
      requestData = JSON.parse(rawBody);
    } catch (jsonError) {
      return NextResponse.json(
        createStandardResponse(400, '请求参数格式错误', {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        false
        ), 
        { status: 400 }
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('PublishTask_token')?.value || '';  
    console.log('token:', token);

    // 构建请求参数
    const requestParams = {
      page: requestData?.page || 0,
      size: requestData?.size || 10,
      sortField: requestData?.sortField || 'createTime',
      sortOrder: requestData?.sortOrder || 'DESC',
      platform: requestData?.platform || 'DOUYIN',
      taskType: requestData?.taskType || 'COMMENT',
      minPrice: requestData?.minPrice === undefined ? 1 : requestData.minPrice,
      maxPrice: requestData?.maxPrice === undefined ? 999 : requestData.maxPrice,
      keyword: requestData?.keyword || ''
    };
    
    // 安全构建API URL
    let apiUrl = '';
    try {
      if (config && config.baseUrl && config.endpoints && config.endpoints.task && config.endpoints.task.missionhall) {
        apiUrl = `${config.baseUrl}${config.endpoints.task.missionhall}`;
        console.log('token:', token);
        console.log('请求URL:', apiUrl, '请求参数:', requestParams);
      } else {
        throw new Error('配置信息不完整，无法构建API URL');
      }
    } catch (configError) {
      console.error('构建API URL失败:', configError);
      return NextResponse.json(
        createStandardResponse(500, '服务器配置错误', {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        false
        ), 
        { status: 500 }
      );
    }
    
    // 调用外部API
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(config.headers || {})
        },
        body: JSON.stringify(requestParams)
      });
      
      // 处理响应
      try {
        const responseData = await response.json();
        
        // 构建返回数据 - 直接使用API返回的数据
        const listData = Array.isArray(responseData?.data?.list) ? responseData.data.list : (responseData?.data?.list || []);
        
        const dataContent = {
          list: listData,
          total: responseData?.data?.total || 0,
          page: responseData?.data?.page || requestParams.page,
          size: responseData?.data?.size || requestParams.size,
          pages: responseData?.data?.pages || 0
        };
        
        // 构建标准化响应
        const standardResponse = createStandardResponse(
          response.status, 
          response.status >= 200 && response.status < 300 ? '成功' : '请求失败',
          dataContent,
          response.status >= 200 && response.status < 300
        );
        
        // 输出响应结果日志
        console.log('响应状态码:', response.status, '返回数据:', standardResponse);
        
        return NextResponse.json(standardResponse, { status: response.status });
      } catch (jsonError) {
        return NextResponse.json(
          createStandardResponse(500, '解析响应失败', {
            list: [],
            total: 0,
            page: requestParams.page,
            size: requestParams.size,
            pages: 0
          },
          false
          ), 
          { status: 500 }
        );
      }
    } catch (fetchError) {
      return NextResponse.json(
          createStandardResponse(500, '请求外部服务失败', {
            list: [],
            total: 0,
            page: requestParams.page,
            size: requestParams.size,
            pages: 0
          },
          false
          ), 
          { status: 500 }
        );
    }
    
  } catch (error) {
    return NextResponse.json(
      createStandardResponse(500, '服务器内部错误', {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      false
      ), 
      { status: 500 }
    );
  }
}



