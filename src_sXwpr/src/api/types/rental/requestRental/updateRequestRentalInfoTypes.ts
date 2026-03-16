// 更新求租信息API类型定义

// 求租信息更新请求参数接口
export interface UpdateRequestRentalInfoParams {
  demand_id: number; // 需求ID
  title: string; // 标题
  budget_amount: number; // 预算金额
  days_needed: number; // 需要天数
  deadline: number; // 截止时间戳
  requirements_json: {
    account_requirements: string; // 账号要求
    basic_information: string;       //支持修改账号基本信息
    other_requirements: string;      //需要实名认证
    deblocking: string;              //需要人脸验证解封
    post_douyin: string;              //发布抖音
    additional_requirements_tag: string; //其他要求标签
    requested_all: string;           //按承租方要求登录
    phone_message: string;           //手机号+短信验证登录
    scan_code: string;               // 扫码登录
    qq_number: string;               //联系方式：QQ号
    phone_number: string;            //联系方式：手机号
    email: string;                   //联系方式：邮箱
    additional_requirements: string; //其他要求
  };
}

// 求租信息更新响应数据接口
export interface UpdateRequestRentalInfoResponseData {
  demand_id: number; // 需求ID
  title: string; // 标题
  budget_amount: number; // 预算金额
  budget_amount_yuan: string; // 预算金额（元）
  days_needed: number; // 需要天数
  deadline: number; // 截止时间戳
  deadline_datetime: string; // 截止时间（日期时间格式）
  status: number; // 状态
  budget_changed: boolean; // 预算是否变更
  budget_diff: any; // 预算变更差额
  budget_diff_text: string; // 预算变更文本
}

// API响应接口
export interface UpdateRequestRentalInfoApiResponse {
  code: number;
  message: string;
  data: UpdateRequestRentalInfoResponseData;
  timestamp: number;
}

// 前端响应接口
export interface UpdateRequestRentalInfoResponse {
  success: boolean;
  message: string;
  data: UpdateRequestRentalInfoResponseData | null;
}
