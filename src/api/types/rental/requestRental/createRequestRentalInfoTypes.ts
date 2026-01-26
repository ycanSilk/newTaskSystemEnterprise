// 创建求租信息API类型定义

// 求租信息创建请求参数接口
export interface CreateRequestRentalInfoParams {
  title: string; // 标题
  budget_amount: number; // 预算金额
  days_needed: number; // 需要天数
  deadline: number; // 截止时间戳
  requirements_json: {
    account_requirements: string; // 账号要求
    basic_information:number;       //支持修改账号基本信息
    other_requirements:number;      //需要实名认证
    deblocking:number;              //需要人脸验证解封
    requested_all:number;           //按承租方要求登录
    phone_message:number;           //手机号+短信验证登录
    scan_code_login: number;        // 扫码登录
    qq_number:string;               //联系方式：手机号
    phone_number:string;            //qq号
    email:string;                   //邮箱

  };
}

// 求租信息创建响应数据接口
export interface CreateRequestRentalInfoResponseData {
  demand_id: string; // 需求ID
  title: string; // 标题
  budget_amount: number; // 预算金额
  budget_amount_yuan: string; // 预算金额（元）
  days_needed: number; // 需要天数
  deadline: number; // 截止时间戳
  deadline_datetime: string; // 截止时间（日期时间格式）
  status: number; // 状态
  status_text: string; // 状态文本
  wallet_frozen: number; // 冻结钱包金额
  wallet_balance: number; // 钱包余额
  log_id: string; // 日志ID
}

// API响应接口
export interface CreateRequestRentalInfoApiResponse {
  code: number;
  message: string;
  data: CreateRequestRentalInfoResponseData;
  timestamp: number;
}

// 前端响应接口
export interface CreateRequestRentalInfoResponse {
  success: boolean;
  message: string;
  data: CreateRequestRentalInfoResponseData | null;
}