// 获取出租市场列表类型定义

// 分页信息类型
export interface RentalMarketPagination {
  /**
   * 当前页码
   */
  page: number;
  
  /**
   * 每页大小
   */
  page_size: number;
  
  /**
   * 总记录数
   */
  total: number;
  
  /**
   * 总页数
   */
  total_pages: number;
}

// 出租市场列表项类型
export interface RentalMarketItem {
  /**
   * 出租信息ID
   */
  id: number;
  
  /**
   * 用户ID
   */
  user_id: number;
  
  /**
   * 用户类型
   */
  user_type: number;
  
  /**
   * 用户类型文本
   */
  user_type_text: string;
  
  /**
   * 发布者用户名
   */
  publisher_username: string;
  
  /**
   * 出租信息标题
   */
  title: string;
  
  /**
   * 每日价格（分）
   */
  price_per_day: number;
  
  /**
   * 每日价格（元）
   */
  price_per_day_yuan: string;
  
  /**
   * 最低出租天数
   */
  min_days: number;
  
  /**
   * 最高出租天数
   */
  max_days: number;
  
  /**
   * 是否允许续租
   */
  allow_renew: 0 | 1;
  
  /**
   * 是否允许续租文本
   */
  allow_renew_text: string;
  
  /**
   * 状态
   */
  status: number;
  
  /**
   * 状态文本
   */
  status_text: string;
  
  /**
   * 查看次数
   */
  view_count: number;
  
  /**
   * 创建时间
   */
  created_at: string;
  
  /**
   * 更新时间
   */
  updated_at: string;
  
  /**
   * 是否是我的发布
   */
  is_my: boolean;
}

// 获取出租市场列表响应数据类型
export interface GetOffersRentalMarketListResponseData {
  /**
   * 出租市场列表
   */
  list: RentalMarketItem[];
  
  /**
   * 分页信息
   */
  pagination: RentalMarketPagination;
}

// 获取出租市场列表请求参数类型
export interface GetOffersRentalMarketListParams {
  /**
   * 页码
   */
  page?: number;
  
  /**
   * 每页大小
   */
  page_size?: number;
  
  /**
   * 搜索关键词
   */
  keyword?: string;
  
  /**
   * 排序字段
   */
  sort_by?: string;
  
  /**
   * 排序方向
   */
  sort_order?: 'ASC' | 'DESC';
}

// 获取出租市场列表API响应类型
export interface GetOffersRentalMarketListApiResponse {
  /**
   * 状态码
   */
  code: number;
  
  /**
   * 响应消息
   */
  message: string;
  
  /**
   * 响应数据
   */
  data: GetOffersRentalMarketListResponseData;
  
  /**
   * 时间戳
   */
  timestamp: number;
}


