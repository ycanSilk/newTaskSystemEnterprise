// 快捷派单相关类型定义

// 推荐标记接口
export interface RecommendMark {
  comment: string; // 评论内容
  image_url: string; // 图片URL
}

// 快捷派单请求接口
export interface CreateQuickTaskRequest {
  template_id: number; // 模板ID
  video_url: string[]; // 视频链接数组
  deadline: number; // 截止时间戳
  releases_number: number; // 发布数量
  stage1_count: number; // 阶段1任务数量
  stage2_count: number; // 阶段2任务数量
  total_price: number; // 总价格
  recommend_marks: RecommendMark[]; // 推荐标记数组
}

// 任务信息接口
export interface TaskInfo {
  combo_task_id: string; // 组合任务ID
  stage1_task_id: number; // 阶段1任务ID
  stage2_task_id: number; // 阶段2任务ID
}

// 钱包信息接口
export interface WalletInfo {
  before_balance: string; // 操作前余额
  after_balance: string; // 操作后余额
  deducted: string; // 扣除金额
}

// API响应数据接口
export interface CreateQuickTaskResponseData {
  code: number; // 状态码
  message: string; // 消息
  data: {
    releases_number: number; // 发布数量
    total_price: number; // 总价格
    tasks: TaskInfo[]; // 任务信息数组
    wallet: WalletInfo; // 钱包信息
  };
  timestamp: number; // 时间戳
}

// 前端API响应接口
export interface CreateQuickTaskResponse {
  success: boolean; // 是否成功
  message: string; // 消息
  data: {
    releases_number: number; // 发布数量
    total_price: number; // 总价格
    tasks: TaskInfo[]; // 任务信息数组
    wallet: WalletInfo; // 钱包信息
  } | null; // 数据
  code?: number; // 状态码
  timestamp?: number; // 时间戳
}
