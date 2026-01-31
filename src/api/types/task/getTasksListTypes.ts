// src/api/types/task/getTasksListTypes.ts
// 任务列表API响应类型定义

// 组合任务信息类型
interface ComboInfo {
  stage1_title: string; // 阶段1标题
  stage1_price: string; // 阶段1价格
  stage2_title: string; // 阶段2标题
  stage2_price: string; // 阶段2价格
}

// 单个任务项类型（基础类型，包含单任务和组合任务的共同字段）
interface BaseTaskItem {
  task_id: number; // 任务ID
  template_id: number; // 模板ID
  template_title: string; // 模板标题
  template_type: number; // 模板类型
  template_type_text: string; // 模板类型文本
  video_url: string | null; // 视频链接
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
  is_combo: boolean; // 是否为组合任务
  stage: number; // 阶段
  stage_text: string; // 阶段文本
  stage_title: string | null; // 阶段标题
  stage_status: number; // 阶段状态
  stage_status_text: string; // 阶段状态文本
  combo_task_id: string | null; // 组合任务ID
  parent_task_id: number | null; // 父任务ID
}

// 单任务类型
interface SingleTaskItem extends BaseTaskItem {
  is_combo: false; // 标记为单任务
  combo_info?: never; // 单任务没有组合信息
}

// 组合任务类型
interface ComboTaskItem extends BaseTaskItem {
  is_combo: true; // 标记为组合任务
  combo_info: ComboInfo; // 组合任务信息
}

// 任务项联合类型（可以是单任务或组合任务）
type TaskItem = SingleTaskItem | ComboTaskItem;

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
  SingleTaskItem,
  ComboTaskItem,
  BaseTaskItem,
  ComboInfo,
  Pagination,
  GetTasksListResponse
};
