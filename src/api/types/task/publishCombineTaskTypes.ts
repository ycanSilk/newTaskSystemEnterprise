// 发布组合任务类型定义
// 这个文件定义了发布组合任务API的请求和响应类型

/**
 * 推荐标记项类型
 * 包含评论内容和图片URL
 */
export interface RecommendMark {
   // 评论内容
  comment: string;
  // 图片URL
  image_url: string;
  // @用户
  at_user: string;
}

/**
 * 发布组合任务请求参数类型
 */
export interface PublishCombineTaskRequest {
  template_id: number;      //模板ID
  video_url: string;        //第一组任务URL地址
  deadline: number;         //截至时间
  stage1_count: number;     //第一组任务数量，只能是1条，1+N
  stage2_count: number;     //第一组任务数量，可以N条，1+N
  total_price: number;      //组合任务的总价格，通过前端计算后传递
  pswd: string;             //支付密码
  recommend_marks: RecommendMark[];     //评论+图片+@用户的组合
}

/**
 * 任务阶段类型  请求成功后返回的响应字段定义
 */
export interface TaskStage {
  task_id: number;          //C端任务大厅显示的子任务ID
  title: string;            //任务标题
  count: number;            //任务数量
  price: number;            //单价
  total_price: number;      //总价格
  status: string;           //状态提示；已开放/未开放（等待阶段1完成）
}

/**
 * 钱包信息类型
 */
export interface WalletInfo {
  before_balance: string;       //发布前余额
  after_balance: string;        //发布后余额
  deducted: string;             //此次任务消费金额
}

/**
 * 发布组合任务响应数据类型
 */
export interface PublishCombineTaskResponseData {
  combo_task_id: string;        //组合任务ID
  is_combo: boolean;            //是不是组合任务；true/false
  template_id: number;          //任务模板ID
  template_title: string;       //任务模板标题
  video_url: string;            //第一组任务的url地址
  deadline: number;             //截止时间
  stage1: TaskStage;            //第一组任务
  stage2: TaskStage;            //第二组任务
  total_price: number;          //此次发布任务消费的总价格
  wallet: WalletInfo;           //钱包信息集合
}

/**
 * 发布组合任务后端响应类型
 */
export interface PublishCombineTaskBackendResponse {
  code: number;
  message: string;
  data: PublishCombineTaskResponseData;
  timestamp: number;
}

/**
 * 发布组合任务前端响应类型
 */
export interface PublishCombineTaskResponse {
  success: boolean;
  code: number;
  message: string;
  data: PublishCombineTaskResponseData | null;
  timestamp: number;
}
