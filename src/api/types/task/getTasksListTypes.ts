// src/api/types/task/getTasksListTypes.ts
// 任务列表API响应类型定义

// 单个任务项类型
interface TaskItem {
  task_id: number; // 任务ID
  template_id: number; // 模板ID
  template_title: string; // 模板标题
  template_type: number; // 模板类型
  video_url: string; // 视频链接
  deadline: number; // 截止时间戳
  deadline_text: string; // 截止时间文本
  task_count: number; // 任务数量
  task_done: number; // 已完成任务数
  task_doing: number; // 进行中任务数
  task_reviewing: number; // 审核中任务数
  task_available: number; // 可用任务数
  progress_percent: number; // 进度百分比
  unit_price: string; // 单价
  total_price: string; // 总价
  status: number; // 状态码
  status_text: string; // 状态文本
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  completed_at: string | null; // 完成时间
  stage: number; // 阶段
  stage_status: number; // 阶段状态
  combo_task_id: number | null; // 组合任务ID
  parent_task_id: number | null; // 父任务ID
}

// 分页信息类型
interface Pagination {
  current_page: number; // 当前页码
  page_size: number; // 每页数量
  total: number; // 总数量
  total_pages: number; // 总页数
}

// API响应数据类型
interface GetTasksListResponse {
  tasks: TaskItem[]; // 任务列表
  pagination: Pagination; // 分页信息
}

// 导出所有类型
export type {
  TaskItem,
  Pagination,
  GetTasksListResponse
};
