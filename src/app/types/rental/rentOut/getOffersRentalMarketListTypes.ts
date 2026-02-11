// 响应数据类型
export interface RentalAccountInfo {
  id: number;               //出租信息ID
  userId: string;               //用户ID
  user_type: number;            //用户类型
  user_type_text: string;       //用户类型文本显示
  publisher_username: string;   //发布者用户名
  title: string;               //出租标题
  content_json: ContentJson;    //账号要求登录方式等信息数组
  price_per_day: number;       // 每日租金（分）
  price_per_day_yuan: number;  // 每日租金（元）
  min_days: string;            // 最小租期（天）
  max_days: number;            // 最大租期（天）
  allow_renew: number;      // 是否允许续租状态
  allow_renew_text: string;       //是否允许续租文本显示
  status: string;             //出租信息状态
  status_text: string;        //出租信息状态文本显示
  view_count: number;       //浏览次数
  created_at: string;       // 创建时间
  updated_at: string;       // 更新时间
  is_my: boolean;           // 是否是我的出租信息	
}

// API响应数据接口
export interface GetOffersRentalMarketListResponseData {
  list: RentalAccountInfo[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// API响应接口
export interface GetOffersRentalMarketListResponse {
  code: number;
  message: string;
  data: GetOffersRentalMarketListResponseData;
  success: boolean;
  timestamp: number;
  status?: number;
}

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
