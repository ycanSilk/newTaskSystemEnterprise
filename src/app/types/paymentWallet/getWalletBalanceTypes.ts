// 支付钱包模块 - 获取钱包余额和交易明细类型定义

/**
 * 钱包信息类型
 */
export interface WalletInfo {
  /** 钱包余额 */
  balance: string;
  /** 钱包ID */
  wallet_id: number;
}

/**
 * 交易记录类型
 */
export interface Transaction {
  /** 交易ID */
  id: number;
  /** 交易类型（1：收入，2：支出） */
  type: number;
  /** 交易类型文本描述 */
  type_text: string;
  /** 交易金额 */
  amount: string;
  /** 交易前余额 */
  before_balance: string;
  /** 交易后余额 */
  after_balance: string;
  /** 关联类型 */
  related_type: string;
  /** 关联ID */
  related_id: number;
  /** 交易备注 */
  remark: string;
  /** 交易创建时间 */
  created_at: string;
}

/**
 * 分页信息类型
 */
export interface Pagination {
  /** 当前页码 */
  page: number;
  /** 每页大小 */
  page_size: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  total_pages: number;
}

/**
 * 获取钱包余额和交易明细响应类型
 */
export interface GetWalletBalanceResponse {
  /** 钱包信息 */
  wallet: WalletInfo;
  /** 交易记录列表 */
  transactions: Transaction[];
  /** 分页信息 */
  pagination: Pagination;
}
