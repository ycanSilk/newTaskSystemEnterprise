// 用户账户余额相关类型定义

// 交易类型枚举
export enum TransactionType {
  RECHARGE = 'recharge',          // 充值
  WITHDRAWAL = 'withdrawal',      // 提现
  TASK_PAYMENT = 'task_payment',  // 任务支付
  TASK_REWARD = 'task_reward',    // 任务奖励
  REFUND = 'refund',              // 退款
  FEE = 'fee'                     // 费用
}

// 交易状态枚举
export enum TransactionStatus {
  PENDING = 'pending',            // 处理中
  COMPLETED = 'completed',        // 已完成
  FAILED = 'failed',              // 失败
  CANCELLED = 'cancelled'         // 已取消
}

// 账户状态接口
export interface AccountStatus {
  isActive: boolean;              // 账户是否激活
  isFrozen: boolean;              // 账户是否冻结
  freezeReason: string | null;    // 冻结原因
  lastStatusUpdateTime: string;   // 上次状态更新时间
}

// 充值信息接口
export interface RechargeInfo {
  supportedPaymentMethods: string[];  // 支持的支付方式
  minRechargeAmount: number;          // 最小充值金额
  maxRechargeAmount: number;          // 最大充值金额
  lastRechargeTime: string;           // 上次充值时间
  lastRechargeAmount: number;         // 上次充值金额
}

// 提现账户接口
export interface WithdrawalAccount {
  id: string;                 // 提现账户ID
  type: 'alipay' | 'wechat_pay' | 'bank_card';  // 提现账户类型
  accountNumber: string;      // 账户号码
  accountName: string;        // 账户名称
  isDefault: boolean;         // 是否默认账户
  status: 'verified' | 'pending' | 'rejected';  // 账户状态
}

// 提现信息接口
export interface WithdrawalInfo {
  withdrawalAccounts: WithdrawalAccount[];  // 提现账户列表
  minWithdrawalAmount: number;              // 最小提现金额
  maxWithdrawalAmount: number;              // 最大提现金额
  dailyWithdrawalLimit: number;             // 每日提现限额
  dailyWithdrawalRemaining: number;         // 每日剩余可提现金额
  withdrawalFeeRate: number;                // 提现手续费率
  lastWithdrawalTime: string;               // 上次提现时间
  lastWithdrawalAmount: number;             // 上次提现金额
}

// 交易记录接口
export interface Transaction {
  id: string;                 // 交易ID
  type: TransactionType;      // 交易类型
  amount: number;             // 交易金额（负数表示支出）
  balanceAfter: number;       // 交易后余额
  paymentMethod?: string;     // 支付方式（充值时使用）
  withdrawalAccountId?: string;  // 提现账户ID（提现时使用）
  relatedTaskId?: string;     // 关联任务ID（任务相关交易时使用）
  status: TransactionStatus;  // 交易状态
  transactionTime: string;    // 交易时间
  description: string;        // 交易描述
}

// 用户账户余额接口
export interface AccountBalance {
  userId: string;             // 用户ID
  userType: 'publisher' | 'commenter' | 'admin';  // 用户类型
  currentBalance: number;     // 当前余额
  availableBalance: number;   // 可用余额
  frozenAmount: number;       // 冻结金额
  currency: string;           // 货币类型
  accountStatus: AccountStatus;  // 账户状态
  rechargeInfo: RechargeInfo;    // 充值信息
  withdrawalInfo: WithdrawalInfo;  // 提现信息
  transactionHistory: Transaction[];  // 交易历史记录
  createdAt: string;          // 创建时间
  updatedAt: string;          // 更新时间
}