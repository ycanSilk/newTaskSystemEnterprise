// 任务列表API响应类型定义
// 严格按照API响应示例定义，确保类型安全

// 分页信息类型
export interface Pagination {
  current_page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 任务数据类型
export interface Task {
  task_id: number;
  template_id: number;
  template_title: string;
  template_type: number;
  video_url: string;
  deadline: number;
  deadline_text: string;
  task_count: number;
  task_done: number;
  task_doing: number;
  task_reviewing: number;
  task_available: number;
  progress_percent: number;
  unit_price: string;
  total_price: string;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  stage: number;
  stage_status: number;
  combo_task_id: string | null;
  parent_task_id: string | null;
}

// API响应数据类型
export interface GetTasksListResponseData {
  tasks: Task[];
  pagination: Pagination;
}

// API响应类型
export interface GetTasksListResponse {
  code: number;
  message: string;
  data: GetTasksListResponseData;
  timestamp: number;
}

// 统计数据类型
export interface TaskStats {
  publishedCount: number;
  acceptedCount: number;
  submittedCount: number;
  completedCount: number;
  totalEarnings: number;
  pendingEarnings: number;
  todayEarnings: number;
  monthEarnings: number;
  passedCount: number;
  rejectedCount: number;
  passRate: number;
  avgCompletionTime: number;
  ranking: number;
  agentTasksCount: number;
  agentEarnings: number;
  invitedUsersCount: number;
}

// 订单统计数据类型
export interface OrderStats {
  acceptedCount: number;
  submittedCount: number;
  completedCount: number;
}