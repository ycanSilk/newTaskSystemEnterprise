// 支付钱包模块 - 充值请求和响应类型定义

/**
 * 充值请求类型
 */
export interface RechargeWalletRequest {
  /** 充值金额 */
  amount: number;
  /** 支付方式 */
  payment_method: string;
  /** 支付凭证URL */
  payment_voucher: string;
  /** 支付密码 */
  pswd: string;
}

/**
 * 充值响应数据类型
 */
export interface RechargeWalletResponseData {
  /** 充值ID */
  recharge_id: number;
  /** 充值金额 */
  amount: string;
  /** 支付方式 */
  payment_method: string;
  /** 支付凭证URL */
  payment_voucher: string;
  /** 状态码（0：待审核） */
  status: number;
  /** 状态描述 */
  status_text: string;
  /** 当前余额 */
  current_balance: string;
  /** 备注信息 */
  remark: string;
}

/**
 * 充值完整响应类型
 */
export interface RechargeWalletResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: RechargeWalletResponseData;
  /** 时间戳 */
  timestamp: number;
}
