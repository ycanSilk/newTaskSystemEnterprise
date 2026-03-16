// 金融记录相关类型定义

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',          // 待支付/处理中
  COMPLETED = 'completed',      // 已完成
  FAILED = 'failed',            // 失败
  CANCELLED = 'cancelled',      // 已取消
  REVIEWING = 'reviewing',      // 审核中
  REVIEWED = 'reviewed'         // 已审核
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',            // 支付宝
  WECHAT_PAY = 'wechat_pay',    // 微信支付
  BANK_TRANSFER = 'bank_transfer' // 银行转账
}

// 提现账户类型枚举
export enum WithdrawalAccountType {
  ALIPAY = 'alipay',            // 支付宝
  WECHAT_PAY = 'wechat_pay',    // 微信支付
  BANK_CARD = 'bank_card'       // 银行卡
}

// 消费类型枚举
export enum ExpenseType {
  TASK_PUBLISH = 'task_publish',// 任务发布
  VIP_SUBSCRIPTION = 'vip_subscription', // VIP订阅
  ADVERTISEMENT = 'advertisement', // 广告
  OTHER = 'other'               // 其他
}

// 收入类型枚举
export enum IncomeType {
  TASK_REWARD = 'task_reward',  // 任务奖励
  REFERRAL_BONUS = 'referral_bonus', // 推荐奖励
  OTHER = 'other'               // 其他
}

// 充值订单接口
export interface RechargeOrder {
  orderId: string;              // 订单ID
  userId: string;               // 用户ID
  userType: 'publisher' | 'commenter' | 'admin'; // 用户类型
  amount: number;               // 充值金额
  currency: string;             // 货币类型
  paymentMethod: PaymentMethod; // 支付方式
  transactionId: string | null; // 支付平台交易ID
  status: OrderStatus;          // 订单状态
  orderTime: string;            // 下单时间
  paymentTime: string | null;   // 支付时间
  completedTime: string | null; // 完成时间
  ipAddress: string;            // IP地址
  description: string;          // 描述
}

// 提现订单接口
export interface WithdrawalOrder {
  orderId: string;              // 订单ID
  userId: string;               // 用户ID
  userType: 'publisher' | 'commenter' | 'admin'; // 用户类型
  amount: number;               // 提现金额
  currency: string;             // 货币类型
  withdrawalAccountId: string;  // 提现账户ID
  withdrawalAccountType: WithdrawalAccountType; // 提现账户类型
  transactionId: string | null; // 支付平台交易ID
  status: OrderStatus;          // 订单状态
  orderTime: string;            // 下单时间
  reviewTime: string | null;    // 审核时间
  paymentTime: string | null;   // 支付时间
  completedTime: string | null; // 完成时间
  fee: number;                  // 手续费
  ipAddress: string;            // IP地址
  description: string;          // 描述
}

// 消费订单接口
export interface ExpenseOrder {
  orderId: string;              // 订单ID
  userId: string;               // 用户ID
  userType: 'publisher' | 'commenter' | 'admin'; // 用户类型
  amount: number;               // 消费金额
  currency: string;             // 货币类型
  type: ExpenseType;            // 消费类型
  relatedId: string;            // 关联ID（如任务ID、VIP套餐ID等）
  status: OrderStatus;          // 订单状态
  orderTime: string;            // 下单时间
  completedTime: string | null; // 完成时间
  ipAddress: string;            // IP地址
  description: string;          // 描述
}

// 收入记录接口
export interface IncomeRecord {
  recordId: string;             // 记录ID
  userId: string;               // 用户ID
  userType: 'publisher' | 'commenter' | 'admin'; // 用户类型
  amount: number;               // 收入金额
  currency: string;             // 货币类型
  type: IncomeType;             // 收入类型
  relatedId: string;            // 关联ID（如任务ID等）
  status: OrderStatus;          // 记录状态
  recordTime: string;           // 记录时间
  description: string;          // 描述
}

// 退款记录接口
export interface RefundRecord {
  refundId: string;             // 退款ID
  originalOrderId: string;      // 原始订单ID
  userId: string;               // 用户ID
  userType: 'publisher' | 'commenter' | 'admin'; // 用户类型
  amount: number;               // 退款金额
  currency: string;             // 货币类型
  reason: string;               // 退款原因
  status: OrderStatus;          // 退款状态
  applyTime: string;            // 申请时间
  processTime: string | null;   // 处理时间
  completedTime: string | null; // 完成时间
  description: string;          // 描述
}

// 金融记录主接口
export interface FinancialRecords {
  rechargeOrders: RechargeOrder[];  // 充值订单列表
  withdrawalOrders: WithdrawalOrder[]; // 提现订单列表
  expenseOrders: ExpenseOrder[];    // 消费订单列表
  incomeRecords: IncomeRecord[];    // 收入记录列表
  refundRecords: RefundRecord[];    // 退款记录列表
}