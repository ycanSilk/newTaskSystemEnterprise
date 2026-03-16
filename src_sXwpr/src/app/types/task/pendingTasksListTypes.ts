// 待审核任务类型定义
export interface PendingTask {
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
  // 补充额外字段以匹配UI需求
  task_id?: number;
  status_text?: string;
  unit_price?: string;
  created_at?: string;
  deadline_text?: string;
}

// 分页信息类型
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// API响应数据类型
export interface PendingTasksListData {
  list: PendingTask[];
  pagination: Pagination;
}

// API响应类型
export interface PendingTasksListResponse {
  success: boolean;
  code: number;
  message: string;
  timestamp: number;
  data: PendingTasksListData;
}
