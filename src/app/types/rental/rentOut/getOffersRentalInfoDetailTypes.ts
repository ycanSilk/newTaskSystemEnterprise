// 响应数据类型
export interface ContentJson {
    images: string[];     // 图片列表
  //账号要求
  deblocking: string;    // 解除封禁
  account_info: string;  // 出租信息详细描速
  identity_verification: string;  // 身份验证，需要实名认证
  post_douyin:string;             // 发布抖音视频和评论
  basic_information: string;      // 基本信息，需要完善个人信息
  //登录要求
  phone_message: string;  // 手机号+短信验证登录
  requested_all: string;  // 按承租方要求登录
  scan_code: string;      // 扫码登录
  

  // 联系方式
  email: string;          // 邮箱
  qq_number: string;      // qq号
  phone_number: string;   // 手机号
}

export interface RentalInfoDetail {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  publisher_email: string;
  title: string;
  price_per_day: number;
  price_per_day_yuan: string;
  min_days: number;
  max_days: number;
  allow_renew: number;
  allow_renew_text: string;
  content_json: ContentJson;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
}

// API响应接口
export interface GetOffersRentalInfoDetailResponse {
  code: number;
  message: string;
  data: RentalInfoDetail;
  timestamp: number;
}
