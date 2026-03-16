// 流水记录类型定义
export interface FlowRecord {
  id: number;
  b_user_id: number;
  username: string;
  flow_type: 1 | 2;
  flow_type_text: string;
  amount: number;
  amount_yuan: string;
  before_balance: number;
  after_balance: number;
  related_type: string;
  related_type_text: string;
  related_id: number | null;
  task_types: number | null;
  task_types_text: string;
  remark: string;
  created_at: string;
}

// 分页信息类型定义
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 响应数据类型定义
export interface GetStatisticFlowListResponseData {
  list: FlowRecord[];
  pagination: Pagination;
}

// API响应类型定义
export interface GetStatisticFlowListResponse {
  code: number;
  message: string;
  data: GetStatisticFlowListResponseData;
  timestamp?: number;
}

// 前端响应类型定义
export interface FrontendGetStatisticFlowListResponse {
  success: boolean;
  message: string;
  data: GetStatisticFlowListResponseData | null;
}

// 请求参数类型定义
export interface GetStatisticFlowListParams {
  page?: number;
  limit?: number;
  related_id?: number;
  related_type?: string;
  task_types?: number;
  start_date?: string;
  end_date?: string;
}
