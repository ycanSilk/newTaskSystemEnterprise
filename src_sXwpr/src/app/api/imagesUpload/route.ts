// 图片上传API路由

// 标记为动态路由，因为需要处理文件上传

export const dynamic = 'force-dynamic';

// 导入Next.js类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API配置
import { apiConfig } from '@/api/client/config';
// 导入图片上传处理函数
import { imagesUploadHandler } from '@/api/handlers/imagesUpload/imagesUploadHandler';

/**
 * 上传图片的API路由
 * @param req - Next.js请求对象
 * @returns Next.js响应对象
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/imagesUpload 请求收到');
    
    // 调用API处理函数上传图片，直接返回处理结果
    return await imagesUploadHandler(req);
  } catch (error) {
    console.error('POST /api/imagesUpload 错误:', error);
    
    // 返回错误响应
    return new NextResponse(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : '图片上传失败',
      data: null
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
