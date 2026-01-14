// 发布单个任务API类型定义
// 该文件定义了发布单个任务功能所需的所有类型

// 推荐标记接口 - 用于comment/image/at_user数据
export interface RecommendMark {
  // 评论内容
  comment: string;
  // 图片URL
  image_url: string;
  // @用户
  at_user: string;
}

// 评论项接口 - 前端表单使用
export interface CommentItem {
  // 评论内容
  content: string;
  // 图片文件
  image: File | null;
  // 图片URL（从API返回）
  imageUrl: string;
}

// 发布单个任务表单数据接口 - 前端表单使用
export interface PublishTaskFormData {
  // 视频URL
  videoUrl: string;
  // 任务数量
  quantity: number;
  // 评论列表
  comments: CommentItem[];
  // 截止时间（分钟）
  deadline: string;
}

// 发布单个任务请求接口 - API请求使用
export interface PublishSingleTaskRequest {
  // 模板ID
  template_id: number;
  // 视频URL
  video_url: string;
  // 截止时间戳
  deadline: number;
  // 任务数量
  task_count: number;
  // 总价格
  total_price: number;
  // 支付密码
  pswd: string;
  // 推荐标记列表
  recommend_marks: RecommendMark[];
}

// 钱包信息接口 - API响应使用
export interface WalletInfo {
  // 扣除前余额
  before_balance: string;
  // 扣除后余额
  after_balance: string;
  // 扣除金额
  deducted: string;
}

// 发布单个任务响应数据接口 - API响应使用
export interface PublishSingleTaskResponseData {
  // 任务ID
  task_id: number;
  // 是否为组合任务
  is_combo: boolean;
  // 模板ID
  template_id: number;
  // 模板标题
  template_title: string;
  // 视频URL
  video_url: string;
  // 截止时间戳
  deadline: number;
  // 任务数量
  task_count: number;
  // 已完成任务数
  task_done: number;
  // 进行中任务数
  task_doing: number;
  // 审核中任务数
  task_reviewing: number;
  // 单价
  unit_price: number;
  // 总价格
  total_price: number;
  // 推荐标记列表
  recommend_marks: RecommendMark[];
  // 任务状态
  status: number;
  // 钱包信息
  wallet: WalletInfo;
}

// 发布单个任务响应接口 - API响应使用
export interface PublishSingleTaskResponse {
  // 响应码
  code: number;
  // 响应消息
  message: string;
  // 响应数据
  data: PublishSingleTaskResponseData;
  // 时间戳
  timestamp: number;
}

// 标准化API响应接口
export interface ApiResponse<T = any> {
  // 请求是否成功
  success: boolean;
  // 响应码
  code: number;
  // 响应消息
  message: string;
  // 时间戳
  timestamp: number;
  // 响应数据
  data: T | null;
}
