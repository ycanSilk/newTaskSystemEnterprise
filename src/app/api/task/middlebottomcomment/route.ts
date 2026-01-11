import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '../../apiconfig/config.json';
import { existsSync, mkdirSync, statSync, writeFile } from 'fs';
import path, { join } from 'path';
import { mkdir, stat } from 'fs/promises';

// 将时间转换为固定30分钟后的具体时间格式
function convertHoursToDateTime(hours?: string | number): string {
  try {
    // 固定设置为当前时间加30分钟
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    
    // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
    return now.toISOString().replace('T', ' ').substring(0, 19);
  } catch (error) {
    console.error('时间转换错误:', error);
    // 错误时仍返回30分钟后的时间
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }
}

// 辅助函数：保存上传的图片文件
const saveImageFile = async (file: any, index: string, imageName?: string): Promise<string | null> => {
  try {
    // 确定上传目录 - 使用绝对路径确保正确性
    const publicDir = join(process.cwd(), 'public');
    const uploadDir = join(publicDir, 'uploads');
    
    // 检查并创建目录
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }
    
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // 生成文件名 - 优先使用前端提供的文件名，否则生成新的
    const originalExtension = file.name.split('.').pop();
    let finalFilename;
    
    if (imageName && imageName.includes('.')) {
      // 如果前端提供了完整文件名
      finalFilename = imageName;
    } else {
      // 生成唯一文件名
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      finalFilename = `comment_${timestamp}_${random}_${index}.${originalExtension}`;
    }
    
    // 保存文件的完整路径
    const filePath = join(uploadDir, finalFilename);
    
    try {
      // 安全读取文件数据，确保文件对象有效
      if (!file || typeof file.arrayBuffer !== 'function') {
        throw new Error('无效的文件对象');
      }
      
      // 使用try-catch包装arrayBuffer操作
      let arrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch (streamError) {
        console.error('读取文件流失败:', streamError);
        // 尝试使用替代方法处理
        if (file.size === 0) {
          throw new Error('空文件');
        }
        throw streamError;
      }
      
      const buffer = Buffer.from(arrayBuffer);
      
      // 写入文件 - 使用Promise包装fs.writeFile
      await new Promise((resolve, reject) => {
        writeFile(filePath, buffer, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        });
      });
      
      // 验证文件是否存在
      if (existsSync(filePath)) {
        // 返回相对路径，用于前端访问
        return `/uploads/${finalFilename}`;
      } else {
        return null;
      }
    } catch (writeError) {
      console.error(`文件写入异常:`, writeError);
      return null;
    }
  } catch (error) {
    console.error(`处理图片时发生异常:`, error);
    return null;
  }
};

// 中评评论发布API路由
export async function POST(request: Request) {
  try {
    // 1. 获取token
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
    
    // 2. 检查是否是multipart/form-data请求
    const contentType = request.headers.get('content-type');
    let formData;
    let requestBody: any = {};
    
    if (contentType?.includes('multipart/form-data')) {
      // 处理多部分表单数据
      formData = await request.formData();
      
      // 提取基本字段
      requestBody.taskTitle = formData.get('taskTitle');
      requestBody.taskPrice = formData.get('taskPrice');
      requestBody.videoUrl = formData.get('videoUrl');
      requestBody.quantity = formData.get('quantity');
      requestBody.deadline = formData.get('deadline');
      requestBody.mentions = JSON.parse(String(formData.get('mentions') || '[]'));
    } else {
      // 处理JSON数据
      requestBody = await request.json();
    }
    
    // 3. 构建评论详情
    const commentDetail: Record<string, string | number> = {};
    commentDetail.commentType = 'SINGLE';
    
    const quantity = Number(requestBody.quantity) || 1;
    const mentionUser = requestBody.mentions?.[0] || '';
    
    // 处理图片上传
    let savedImagePaths: { [key: string]: string } = {};
    
    // 检查是否为multipart/form-data请求
    if (contentType?.includes('multipart/form-data') && formData) {
      // 循环处理每个评论的图片
      for (let i = 1; i <= quantity; i++) {
        const hasImage = formData.get(`hasImage${i}`);
        const imageField = formData.get(`commentImages${i}`);
        const imagePathFromFrontend = formData.get(`imagePath${i}`);
        
        // 检查是否有图片文件
        if (hasImage === 'true' && imageField && typeof imageField !== 'string' && imageField instanceof File) {
          // 尝试从imagePath提取文件名
          let imageName = undefined;
          if (imagePathFromFrontend && typeof imagePathFromFrontend === 'string') {
            // 从路径中提取文件名
            const pathParts = imagePathFromFrontend.split('/');
            imageName = pathParts[pathParts.length - 1];
          }
          
          // 保存图片文件
          const savedPath = await saveImageFile(imageField, String(i), imageName);
          
          if (savedPath) {
            savedImagePaths[`commentImages${i}`] = savedPath;
          }
        }
      }
    }
    
    // 循环处理每个评论
    for (let i = 1; i <= quantity; i++) {
      // 提取评论数据
      let commentText = '';
      let commentImagePath: string | null = null;
      
      if (formData) {
        // 从FormData获取数据
        commentText = (formData.get(`commentText${i}`) as string) || '';
        
        // 处理图片文件
        const hasImage = formData.get(`hasImage${i}`) === 'true';
        const imageField = formData.get(`commentImages${i}`);
        
        // 安全检查图片文件
        if (hasImage && savedImagePaths[`commentImages${i}`]) {
          commentImagePath = savedImagePaths[`commentImages${i}`];
        } else if (hasImage && imageField && imageField instanceof File && imageField.size > 0) {
          try {
            // 如果之前没有处理过这个图片，进行处理
            commentImagePath = await saveImageFile(imageField, String(i));
          } catch (imageError) {
            console.error(`处理评论 ${i} 的图片失败:`, imageError);
            commentImagePath = null;
          }
        }
      }
        
        // 从commentText中移除任何@用户标记
        const cleanContent = commentText.replace(/ @\S+/g, '').trim();
        
        // 填充commentDetail
        commentDetail[`linkUrl${i}`] = requestBody.videoUrl || '';
        commentDetail[`unitPrice${i}`] = Number(requestBody.taskPrice) || 0;
        commentDetail[`quantity${i}`] = 1;
        commentDetail[`commentText${i}`] = cleanContent;
        commentDetail[`commentImages${i}`] = commentImagePath || '';
        
        // 仅在最后一条评论设置mentionUser
        if (i === quantity && mentionUser) {
          commentDetail[`mentionUser${i}`] = mentionUser;
        } else {
          commentDetail[`mentionUser${i}`] = '';
        }
    }
    
    // 构建完整的API请求体
    const apiRequestBody = {
      title: requestBody.taskTitle || '中评评论',
      description: '这是一条中评评论任务',
      platform: requestBody.platform || 'DOUYIN',
      taskType: 'COMMENT',
      totalQuantity: quantity,
      unitPrice: Number(requestBody.taskPrice) || 0,
      deadline: convertHoursToDateTime(requestBody.deadline),
      requirements: '',
      commentType: 'COMBINED',
      commentDetail: commentDetail
    };
    
    // 输出请求体数据
    console.log('请求体数据:', JSON.stringify(apiRequestBody, null, 2));
    
    // 检查图片上传是否成功
    let allImagesUploadedSuccessfully = true;
    for (let i = 1; i <= quantity; i++) {
      const imagePath = commentDetail[`commentImages${i}`];
      if (imagePath === null || imagePath === undefined || imagePath === '') {
        // 如果有任何一个图片需要上传但失败了，设置标志为false
        if (formData && formData.get(`hasImage${i}`) === 'true') {
          allImagesUploadedSuccessfully = false;
        }
      }
    }
    
    // 根据图片上传结果返回相应的响应
    if (allImagesUploadedSuccessfully) {
      try {
        // 构建API请求URL
        const apiUrl = `${config.baseUrl}${config.endpoints.task.publish}`;
        console.log(`请求URL: ${apiUrl}`);
        
        // 构建请求头
        const requestHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // 调用外部API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(apiRequestBody)
        });
        
        // 解析API响应
        const responseData = await response.json();
        console.log('这是发布上中评评论的API日志输出:');
         console.log('发布任务成功，状态码:', responseData.status);
        console.log('API响应数据:', responseData);
        
        // 返回API响应给客户端
        return NextResponse.json(responseData, { status: response.status });
      } catch (apiError) {
        console.error('调用外部API失败:', apiError);
        return NextResponse.json({
          success: false,
          message: '调用外部API失败，请稍后重试'
        }, { status: 503 });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: '部分或全部图片上传失败，请检查后重试',
        errorDetails: {
          failedImageUploads: true,
          commentDetail: commentDetail
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('发布上中评评论任务失败:', error);
    return NextResponse.json({
      success: false,
      message: '系统异常，请稍后重试'
    });
  }
}

