// API配置常量
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000,
  RETRY_TIMES: 3,
} as const;

// 应用常量
export const APP_CONFIG = {
  NAME: '抖音评论派单系统',
  VERSION: '2.0.0',
  DESCRIPTION: 'H5移动端优先的评论任务平台',
} as const;

// 用户角色常量
export const USER_ROLES = {
  ADMIN: 'admin',
  PUBLISHER: 'publisher', 
  COMMENTER: 'commenter',
} as const;

// 任务状态常量
export const TASK_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  // 根据规范，主任务只有进行中和已完成两种状态，移除PAUSED状态
} as const;

// 任务执行状态
export const EXECUTION_STATUS = {
  GRABBED: 'grabbed',
  SUBMITTED: 'submitted',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
} as const;

// 支付方式
export const PAYMENT_METHODS = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  USDT: 'usdt',
  BANK: 'bank',
} as const;

// 支付状态
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// 通知类型
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  TASK: 'task',
  PAYMENT: 'payment',
  INVITE: 'invite',
} as const;

// 任务类别
export const TASK_CATEGORIES = [
  { value: 'food', label: '美食探店', icon: '🍔' },
  { value: 'beauty', label: '美妆护肤', icon: '💄' },
  { value: 'travel', label: '旅游攻略', icon: '🏝️' },
  { value: 'fashion', label: '服装穿搭', icon: '👗' },
  { value: 'digital', label: '数码科技', icon: '📱' },
  { value: 'life', label: '生活日用', icon: '🏠' },
  { value: 'sports', label: '运动健身', icon: '⚽' },
  { value: 'entertainment', label: '娱乐游戏', icon: '🎮' },
] as const;

// 任务难度等级
export const DIFFICULTY_LEVELS = [
  { value: 1, label: '简单', stars: '⭐', color: 'text-green-600' },
  { value: 2, label: '中等', stars: '⭐⭐', color: 'text-yellow-600' },
  { value: 3, label: '困难', stars: '⭐⭐⭐', color: 'text-red-600' },
] as const;

// 价格范围选项
export const PRICE_RANGES = [
  { min: 0, max: 1, label: '¥1以下' },
  { min: 1, max: 3, label: '¥1-3' },
  { min: 3, max: 5, label: '¥3-5' },
  { min: 5, max: 10, label: '¥5-10' },
  { min: 10, max: 999, label: '¥10以上' },
] as const;

// 充值金额选项
export const RECHARGE_AMOUNTS = [
  100, 200, 300, 500, 1000, 2000, 5000, 10000
] as const;

// 本地存储键名
export const STORAGE_KEYS = {
  USER_INFO: 'douyin_user_info',
  AUTH_TOKEN: 'douyin_auth_token',
  USER_ROLE: 'douyin_user_role',
  IS_LOGGED_IN: 'douyin_is_logged_in',
  TASK_FILTERS: 'douyin_task_filters',
  GRAB_MODE: 'douyin_grab_mode',
} as const;

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TASK_ALREADY_GRABBED: 'TASK_ALREADY_GRABBED',
  INVALID_SCREENSHOT: 'INVALID_SCREENSHOT',
} as const;

// 正则表达式
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/,
  USERNAME: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/,
  INVITE_CODE: /^[A-Z0-9]{8,12}$/,
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  TASK_PAGE_SIZE: 20,
  NOTIFICATION_PAGE_SIZE: 10,
  COMMISSION_PAGE_SIZE: 20,
  AUTO_REFRESH_INTERVAL: 30000, // 30秒
  COUNTDOWN_INTERVAL: 1000, // 1秒
  DEBOUNCE_DELAY: 300, // 300ms
  MIN_WITHDRAW_AMOUNT: 100, // 最低提现金额
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// 动画持续时间
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-index层级
export const Z_INDEX = {
  MODAL: 1000,
  TOAST: 1100,
  TOOLTIP: 1200,
  LOADING: 1300,
} as const;