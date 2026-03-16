// 求租信息详情类型定义

// 求租要求JSON数据接口
export interface RequirementsJson {
account_info: string;
    basic_information: string;//支持修改账号基本信息
    post_douyin: string;//发布抖音
    deblocking: string;//需要人脸验证解封
    identity_verification: string;//需要实名认证
    scan_code: string;//扫码登录
    phone_message: string;//手机号+短信验证登录
    other_require: string;//按承租方要求登录

    platform_type: string;//平台类型（抖音或QQ）

    images: string[];//求租图片

    phone_number: string;//联系方式：手机号

    post_ad: string;//发布广告（QQ）

    account_password: string;//账号密码登录（QQ）

    account_requirements: string;//求租信息详情描速
}

// 求租信息详情数据接口
export interface RequestRentalInfoDetail {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  publisher_email: string;
  title: string;
  budget_amount: number;
  budget_amount_yuan: string;
  days_needed: number;
  deadline: number;
  deadline_datetime: string;
  requirements_json: RequirementsJson;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  application_count: number;
}

// API响应数据接口
export interface GetRequestRentalInfoDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: RequestRentalInfoDetail;
  timestamp: number;
}
