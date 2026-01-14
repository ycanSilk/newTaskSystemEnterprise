// Pending Tasks List API 类型定义

// 待审核任务数据类型
interface PendingTask {
  record_id: number;
  b_task_id: number;
  c_user_id: number;
  c_username: string;
  c_email: string;
  template_title: string;
  video_url: string;
  recommend_mark: {
    comment: string;
    image_url: string;
  };
  comment_url: string;
  screenshots: string[];
  reward_amount: string;
  submitted_at: string;
}

// 分页信息类型
interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 待审核任务列表数据类型
interface PendingTasksListData {
  list: PendingTask[];
  pagination: Pagination;
}

// API响应数据接口
export interface PendingTasksListApiResponse {
  code: number;
  message: string;
  data: PendingTasksListData;
  timestamp: number;
}

// 前端API响应接口
export interface PendingTasksListResponse {
  success: boolean;
  code: number;
  message: string;
  data: PendingTasksListData;
  timestamp: number;
}

// API错误响应接口
export interface ApiResponse {
  success: boolean;
  code: number;
  message: string;
  data: any;
  timestamp: number;
}
