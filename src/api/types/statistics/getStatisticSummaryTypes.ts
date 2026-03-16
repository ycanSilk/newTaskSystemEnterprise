// 统计摘要类型定义
export interface Summary {
  total_income: number;
  total_income_yuan: string;
  total_expenditure: number;
  total_expenditure_yuan: string;
  net_change: number;
  net_change_yuan: string;
}

// 每日数据类型定义
export interface DailyData {
  date: string;
  income: number;
  income_yuan: string;
  expenditure: number;
  expenditure_yuan: string;
  net_change: number;
  net_change_yuan: string;
}

// 分页信息类型定义
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// 响应数据类型定义
export interface GetStatisticSummaryResponseData {
  period: string;
  summary: Summary;
  daily_data: DailyData[];
  pagination: Pagination;
}

// API响应类型定义
export interface GetStatisticSummaryResponse {
  code: number;
  message: string;
  data: GetStatisticSummaryResponseData;
  timestamp: number;
}

// 前端响应类型定义
export interface FrontendGetStatisticSummaryResponse {
  success: boolean;
  message: string;
  data: GetStatisticSummaryResponseData | null;
}

// 请求参数类型定义
export interface GetStatisticSummaryParams {
  period?: string;
  page?: number;
  limit?: number;
}
