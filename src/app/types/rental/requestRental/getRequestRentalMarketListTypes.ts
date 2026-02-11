// 求租市场列表数据类型定义

// 求租信息项接口
export interface RequestRentalItem {
  id: number;
  user_id: number;
  user_type: number;
  user_type_text: string;
  publisher_username: string;
  title: string;
  budget_amount: number;
  budget_amount_yuan: string;
  days_needed: number;
  deadline: number;
  deadline_datetime: string;
  status: number;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_my: boolean;
  requirements_json: RequirementsJson;
}

// 分页信息接口
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// API响应数据接口
export interface GetRequestRentalMarketListResponseData {
  list: RequestRentalItem[];
  pagination: Pagination;
}

// API响应接口
export interface GetRequestRentalMarketListResponse {
  success: boolean;
  code: number;
  message: string;
  data: GetRequestRentalMarketListResponseData;
  timestamp: number;
}

// 求租要求JSON数据接口
export interface RequirementsJson {
  account_requirements: string; // 账号要求
    basic_information: string;       //支持修改账号基本信息
    other_requirements: string;      //需要实名认证
    deblocking: string;              //需要人脸验证解封
    requested_all: string;           //按承租方要求登录
    phone_message: string;           //手机号+短信验证登录
    scan_code: string;        // 扫码登录
    qq_number:string;               //联系方式：手机号
    phone_number:string;            //qq号
    email:string;                   //邮箱
    additional_requirements?: string; // 其他要求
}

