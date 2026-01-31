// 任务列表API响应类型定义
// 严格按照API响应示例定义，确保类型安全

// 分页信息类型
export interface Pagination {
  current_page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 组合任务信息类型
export interface ComboInfo {
  stage1_title: string;
  stage1_price: string;
  stage2_title: string;
  stage2_price: string;
}

// 基础任务项类型
export interface BaseTaskItem {
  task_id: number;
  template_id: number;
  template_title: string;
  template_type: number;
  template_type_text: string;
  video_url: string 
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
  is_combo: boolean;
  stage: number;
  stage_text: string;
  stage_title: string | null;
  stage_status: number;
  stage_status_text: string;
  combo_task_id: string | null;
  parent_task_id: number | null;
}

// 单任务类型
export interface SingleTaskItem extends BaseTaskItem {
  is_combo: false;
  combo_task_id: null;
  parent_task_id: null;
}

// 组合任务类型
export interface ComboTaskItem extends BaseTaskItem {
  is_combo: true;
  combo_task_id: string;
  combo_info: ComboInfo;
}

// 任务类型（联合类型）
export type Task = SingleTaskItem | ComboTaskItem;

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




// 订单统计数据类型
export interface OrderStats {
  acceptedCount: number;
  submittedCount: number;
  completedCount: number;
}
