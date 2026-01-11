// Task模块 - 任务大厅请求处理逻辑
// 这个文件包含了处理任务大厅请求的核心逻辑和相关类型定义

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入API客户端实例，用于发送HTTP请求
import apiClient from '../../client';
// 导入任务大厅端点常量
import { TASK_HALL_ENDPOINT } from '../../endpoints/task';
// 导入错误处理相关的函数和类型
import { ApiError, handleApiError, createErrorResponse } from '../../client/errorHandler';
// 导入通用API响应类型和分页响应类型
import { ApiResponse, PaginationResponse } from '../../types/common';

/**
 * 任务大厅请求参数类型
 * 定义了客户端发送任务大厅请求时可以传递的参数
 */
export interface TaskHallRequest {
  /**
   * 页码，从0开始
   * 表示当前请求的是第几页数据
   */
  page?: number;
  
  /**
   * 每页大小
   * 表示每页显示的数据条数
   */
  size?: number;
  
  /**
   * 排序字段
   * 表示根据哪个字段进行排序，如"createTime"、"price"等
   */
  sortField?: string;
  
  /**
   * 排序顺序（ASC/DESC）
   * ASC表示升序排序，DESC表示降序排序
   */
  sortOrder?: 'ASC' | 'DESC';
  
  /**
   * 平台类型
   * 表示任务所属的平台，如"DOUYIN"（抖音）
   */
  platform?: string;
  
  /**
   * 任务类型
   * 表示任务的类型，如"COMMENT"（评论任务）
   */
  taskType?: string;
  
  /**
   * 最低价格
   * 用于筛选价格大于等于该值的任务
   */
  minPrice?: number;
  
  /**
   * 最高价格
   * 用于筛选价格小于等于该值的任务
   */
  maxPrice?: number;
  
  /**
   * 关键词
   * 用于根据关键词搜索任务
   */
  keyword?: string;
}

/**
 * 处理任务大厅请求
 * @param req - Next.js请求对象，包含客户端发送的任务大厅查询参数
 * @returns Next.js响应对象，包含任务列表或错误信息
 */
export async function handleMissionHall(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体，获取客户端发送的查询参数
    // 将请求体转换为TaskHallRequest类型，确保数据格式正确
    const requestData: TaskHallRequest = await req.json();
    
    // 构建请求参数，为缺失的参数设置默认值
    const requestParams = {
      // 页码，默认为0（第一页）
      page: requestData?.page || 0,
      // 每页大小，默认为10条
      size: requestData?.size || 10,
      // 排序字段，默认按创建时间排序
      sortField: requestData?.sortField || 'createTime',
      // 排序顺序，默认降序
      sortOrder: requestData?.sortOrder || 'DESC',
      // 平台类型，默认抖音
      platform: requestData?.platform || 'DOUYIN',
      // 任务类型，默认评论任务
      taskType: requestData?.taskType || 'COMMENT',
      // 最低价格，默认为1
      minPrice: requestData?.minPrice === undefined ? 1 : requestData.minPrice,
      // 最高价格，默认为999
      maxPrice: requestData?.maxPrice === undefined ? 999 : requestData.maxPrice,
      // 关键词，默认为空字符串
      keyword: requestData?.keyword || ''
    };
    
    // 调用API客户端发送POST请求到任务大厅端点
    // 使用TASK_HALL_ENDPOINT常量作为URL，requestParams作为请求体
    // 类型参数ApiResponse表示期望的响应数据类型
    const response = await apiClient.post<ApiResponse>(TASK_HALL_ENDPOINT, requestParams);
    
    // 返回响应给客户端
    // 使用NextResponse.json方法，将响应数据和状态码返回
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // 捕获并处理请求过程中发生的错误
    // 使用handleApiError函数将原始错误转换为标准化的ApiError对象
    const apiError: ApiError = handleApiError(error);
    // 使用createErrorResponse函数创建标准化的错误响应
    const errorResponse: ApiResponse = createErrorResponse(apiError);
    
    // 返回错误响应给客户端
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}