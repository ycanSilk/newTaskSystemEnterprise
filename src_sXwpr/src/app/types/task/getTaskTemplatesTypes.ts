// 任务模板相关类型定义

// 任务阶段接口（组合任务特有）
export interface TaskStage {
  title: string;
  price: number;
  default_count: number;
}

// 任务模板接口
export interface TaskTemplate {
  id: number;
  type: 0 | 1; // 0: 单任务, 1: 组合任务
  type_text: string;
  title: string;
  price: number;
  description1: string;
  description2: string;
  created_at: string;
  // 组合任务特有字段
  stage1?: TaskStage;
  stage2?: TaskStage;
  default_total_price?: number;
}

// API响应接口
export interface GetTaskTemplatesResponse {
  success: boolean;
  message: string;
  data: TaskTemplate[];
  timestamp: number;
}