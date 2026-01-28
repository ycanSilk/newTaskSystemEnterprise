// 求租信息状态类型
export type RentalRequestStatus = 0 | 1 | 2;

// 求租信息状态文本映射
export const statusTextMap: Record<RentalRequestStatus, string> = {
  0: '已下架',
  1: '发布中',
  2: '已封禁'
};

// 求租信息状态到选项卡键值的映射
export const statusToTabKeyMap: Record<RentalRequestStatus, string> = {
  0: 'INACTIVE',
  1: 'ACTIVE',
  2: 'INACTIVE'
};

// 分页信息类型
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 求租信息类型
export interface RentalRequest {
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
  status: RentalRequestStatus;
  status_text: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  is_my: boolean;
}

// 获取求租市场列表响应类型
export interface GetRequestRentalMarketListResponse {
  code: number;
  message: string;
  data: {
    list: RentalRequest[];
    pagination: Pagination;
  };
  timestamp: number;
}


// 上下架求租信息请求体
export interface ToggleRequestRentalInfoStatusRequest {
  demand_id: number; // 求租信息id
  status: RentalRequestStatus; // 求租信息状态。0：下架、1：发布中，2：已封禁
}

// 上下架求租信息响应数据
export interface ToggleRequestRentalInfoStatusResponseData {
  demand_id: number;
  status: RentalRequestStatus;
  status_text: string;
  budget_amount: number;
  days_needed: number;
  total_amount: number;
  budget_frozen: number;
  budget_returned: number;
}

// 上下架求租信息响应接口
export interface ToggleRequestRentalInfoStatusResponse {
  code: number;
  message: string;
  data: ToggleRequestRentalInfoStatusResponseData;
  timestamp: number;
}