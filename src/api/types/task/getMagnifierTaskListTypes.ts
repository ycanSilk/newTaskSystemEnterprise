// 放大镜任务列表类型定义
// 此文件定义了获取放大镜任务列表的请求和响应类型

// 推荐标记接口
export interface MagnifierRecommendMark {
  /**
   * 评论内容
   */
  comment: string;
  /**
   * @用户信息（可选）
   */
  at_user?: string;
  /**
   * 图片URL（可选）
   */
  image_url?: string;
}

// 放大镜任务项接口
export interface MagnifierTaskItem {
  /**
   * 任务ID
   */
  id: number;
  /**
   * B端用户ID
   */
  b_user_id: number;
  /**
   * 组合任务ID
   */
  combo_task_id: number | null;
  /**
   * 父任务ID
   */
  parent_task_id: number | null;
  /**
   * 模板ID
   */
  template_id: number;
  /**
   * 视频链接
   */
  video_url: string;
  /**
   * 到期时间戳（秒）
   */
  deadline: number;
  /**
   * 推荐标记数组
   */
  recommend_marks: MagnifierRecommendMark[];
  /**
   * 任务数量
   */
  task_count: number;
  /**
   * 已完成任务数
   */
  task_done: number;
  /**
   * 进行中任务数
   */
  task_doing: number;
  /**
   * 审核中任务数
   */
  task_reviewing: number;
  /**
   * 任务单价
   */
  unit_price: string;
  /**
   * 任务总价
   */
  total_price: string;
  /**
   * 任务状态
   */
  status: number;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 更新时间
   */
  updated_at: string;
  /**
   * 完成时间
   */
  completed_at: string | null;
  /**
   * 任务标题
   */
  title: string;
  /**
   * 价格
   */
  price: string;
  /**
   * 状态文本
   */
  status_text: string;
}

// 任务列表数据接口
export interface MagnifierTaskListData {
  /**
   * 任务列表
   */
  list: MagnifierTaskItem[];
  /**
   * 总任务数
   */
  total: number;
  /**
   * 当前页码
   */
  page: number;
  /**
   * 每页条数
   */
  pageSize: number;
}

// 后端API响应接口
export interface GetMagnifierTaskListApiResponse {
  /**
   * 响应码
   */
  code: number;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 响应数据
   */
  data: MagnifierTaskListData;
  /**
   * 时间戳
   */
  timestamp: number;
}

// 前端请求参数接口
export interface GetMagnifierTaskListRequest {
  /**
   * 页码，默认1
   */
  page?: number;
  /**
   * 每页条数，默认10，最大100
   */
  pageSize?: number;
  /**
   * 筛选特定用户的任务（仅Admin可用）
   */
  b_user_id?: number;
  /**
   * 筛选特定状态的任务
   */
  status?: number;
}

// 前端响应接口
export interface GetMagnifierTaskListResponse {
  /**
   * 是否成功
   */
  success: boolean;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 响应数据
   */
  data: MagnifierTaskListData | null;
}
