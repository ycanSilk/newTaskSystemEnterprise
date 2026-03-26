// 充值模块 - 获取充值记录响应类型定义
// 这个文件包含了获取充值记录响应的类型定义

/**
 * 充值记录项类型
 */
export interface RechargeRecord {
  id: number;
  wallet_id: number;
  user_id: number;
  username: string;
  user_type: number;
  user_type_text: string;
  type: number;
  type_text: string;
  amount: string;
  before_balance: string;
  after_balance: string;
  related_type: string;
  related_id: number | null;
  remark: string;
  created_at: string;
}

/**
 * 分页信息类型
 */
export interface Pagination {
  current_page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/**
 * 获取充值记录响应数据类型
 */
export interface GetRechargeListResponse {
  records: RechargeRecord[];
  pagination: Pagination;
}
