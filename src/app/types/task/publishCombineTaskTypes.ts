// 发布组合任务前端类型定义
// 用于src/app/publisher/create/task-combination-top-middle/page.tsx页面

/**
 * 评论数据类型
 */
export interface CommentData {
  comment: string;
  image: File | null;
  imageUrl: string;
  at_user?: string;
}

/**
 * 表单数据类型
 */
export interface FormData {
  videoUrl: string;
  // 上评评论模块 - 固定为1条
  topComment: CommentData;
  // 中评评论模块
  middleQuantity: number;
  middleComments: CommentData[];
  deadline: string; // 存储分钟数
}

/**
 * 推荐标记项类型
 */
export interface RecommendMark {
  comment: string;
  image_url: string;
  at_user?: string;
}

/**
 * API请求参数类型
 */
export interface PublishCombineTaskRequest {
  template_id: number;
  video_url: string;
  deadline: number; // 时间戳
  stage1_count: number;
  stage2_count: number;
  total_price: number;
  pswd: string;
  recommend_marks: RecommendMark[];
}

/**
 * 任务阶段类型
 */
export interface TaskStage {
  task_id: number;
  title: string;
  count: number;
  price: number;
  total_price: number;
  status: string;
}

/**
 * 钱包信息类型
 */
export interface WalletInfo {
  before_balance: string;
  after_balance: string;
  deducted: string;
}

/**
 * API响应数据类型
 */
export interface PublishCombineTaskResponseData {
  combo_task_id: string;
  is_combo: boolean;
  template_id: number;
  template_title: string;
  video_url: string;
  deadline: number;
  stage1: TaskStage;
  stage2: TaskStage;
  total_price: number;
  wallet: WalletInfo;
}

/**
 * API响应类型
 */
export interface PublishCombineTaskResponse {
  code: number;
  message: string;
  data: PublishCombineTaskResponseData;
  timestamp: number;
}

/**
 * 通用提示框配置类型
 */
export interface AlertConfig {
  title: string;
  message: string;
  icon: string;
  buttonText: string;
  onButtonClick: () => void;
}
