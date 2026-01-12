// 图片上传API处理函数

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入文件系统操作模块
import fs from 'fs';
import path from 'path';
// 导入通用API响应类型
import { ApiResponse } from '../../types/common';

/**
 * 处理上传图片请求
 * @param request - Next.js请求对象
 * @returns Next.js响应对象，包含上传图片结果或错误信息
 */
export const imagesUploadHandler = async (request: NextRequest): Promise<NextResponse> => {
  try {
    // 解析FormData
    const formData = await request.formData();
    
    // 获取文件
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({
        success: false,
        message: '未找到上传的文件',
        data: null
      } as ApiResponse, { status: 400 });
    }
    
    // 获取保存路径，默认保存到public/upload/images
    const savePath = formData.get('savePath') as string || 'public/upload/images';
    
    // 确保保存目录存在
    const fullSavePath = path.join(process.cwd(), savePath);
    if (!fs.existsSync(fullSavePath)) {
      fs.mkdirSync(fullSavePath, { recursive: true });
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const filePath = path.join(fullSavePath, fileName);
    
    // 读取文件内容并保存到指定路径
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '图片上传成功',
      data: {
        fileName,
        filePath,
        originalName: file.name,
        size: file.size,
        url: `/${savePath.replace('public/', '')}/${fileName}`
      }
    } as ApiResponse, { status: 200 });
  } catch (error) {
    console.error('图片上传失败:', error);
    
    // 返回错误响应
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '图片上传失败',
      data: null
    } as ApiResponse, { status: 500 });
  }
};
