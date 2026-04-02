// src/api/types/task/notCompletedTypes.ts
// 未完成任务列表API响应类型定义

// 推荐标记类型
export interface RecommendMark {
  comment: string; // 标签文本
  image_url: string; // 标签图片链接
}

// 任务数据类型
export interface Task {
  task_id: number; // 任务ID
  template_id: number; // 模板ID
  template_title: string; // 模板标题
  template_type: number; // 模板类型
  template_type_text: string; // 模板类型文本
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
  unfinished_count: number; // 未完成任务数
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  completed_at: string | null; // 完成时间
  is_combo: boolean; // 是否为组合任务
  stage: number; // 阶段
  stage_text: string; // 阶段文本
  stage_title: string | null; // 阶段标题
  stage_status: number; // 阶段状态
  stage_status_text: string; // 阶段状态文本
  combo_task_id: string | null; // 组合任务ID
  parent_task_id: number | null; // 父任务ID
  recommend_marks: RecommendMark[]; // 推荐标签
}

// 分页信息类型
export interface Pagination {
  current_page: number; // 当前页码
  page_size: number; // 每页数量
  total: number; // 总数量
  total_pages: number; // 总页数
}

// 响应数据类型
export interface NotCompletedData {
  tasks: Task[]; // 任务列表
  pagination: Pagination; // 分页信息
}

// API响应类型
export interface NotCompletedResponse {
  code: number; // 状态码
  message: string; // 消息
  data: NotCompletedData; // 数据
  timestamp: number; // 时间戳
}
