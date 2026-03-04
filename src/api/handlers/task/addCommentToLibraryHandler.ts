import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function addCommentToLibraryHandler(req: NextRequest) {
  try {
    const { comments } = await req.json();

    if (!Array.isArray(comments)) {
      return NextResponse.json(
        { code: 1, message: 'Invalid request: comments must be an array' },
        { status: 400 }
      );
    }

    // 读取现有的评论词库文件
    const commentFilePath = path.join(process.cwd(), 'public', 'file', 'comment .json');
    
    let existingComments: string[] = [];
    try {
      const fileContent = fs.readFileSync(commentFilePath, 'utf8');
      existingComments = JSON.parse(fileContent);
      if (!Array.isArray(existingComments)) {
        existingComments = [];
      }
    } catch (error) {
      // 文件不存在或格式错误，使用空数组
      existingComments = [];
    }

    // 过滤掉重复的评论
    const uniqueComments = comments.filter(
      (comment: string) => !existingComments.includes(comment)
    );

    // 添加新评论
    const updatedComments = [...existingComments, ...uniqueComments];

    // 写入更新后的评论词库文件
    fs.writeFileSync(
      commentFilePath,
      JSON.stringify(updatedComments, null, 2),
      'utf8'
    );

    return NextResponse.json({
      code: 0,
      message: `成功添加 ${uniqueComments.length} 条评论到词库`,
      data: {
        addedCount: uniqueComments.length,
        totalCount: updatedComments.length
      }
    });
  } catch (error) {
    console.error('添加评论到词库失败:', error);
    return NextResponse.json(
      { code: 1, message: '添加评论到词库失败' },
      { status: 500 }
    );
  }
}
