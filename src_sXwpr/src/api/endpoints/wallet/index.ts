// Wallet模块 - 钱包相关端点定义
// 这个文件定义了钱包模块的所有API端点，用于前后端通信

/**
 * 获取钱包信息端点
 * 获取当前用户的钱包信息，包括余额、提现记录等
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含钱包信息，如总余额、可用余额、冻结余额等
 */
export const GET_WALLET_INFO_ENDPOINT = '/wallet/info';

/**
 * 绑定支付宝端点
 * 绑定用户的支付宝账号，用于提现和支付
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ alipayAccount: string, realName: string }
 * 响应：绑定结果
 */
export const BIND_ALIPAY_ENDPOINT = '/wallet/bind-alipay';

/**
 * 设置支付密码端点
 * 设置或修改用户的支付密码，用于提现和支付验证
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ password: string } 或 { oldPassword: string, newPassword: string }
 * 响应：设置结果
 */
export const SET_PAYMENT_PASSWORD_ENDPOINT = '/wallet/security-password';

/**
 * 余额提现端点
 * 申请将钱包余额提现到绑定的支付宝或银行卡
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ amount: number, paymentMethod: string, password: string }
 * 响应：提现申请结果
 */
export const BALANCE_WITHDRAWAL_ENDPOINT = '/wallet/withdraw';

/**
 * 获取可用余额端点
 * 获取用户的可用余额，不包括冻结金额
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含可用余额
 */
export const GET_AVAILABLE_BALANCE_ENDPOINT = '/wallet/available-balance';

/**
 * 验证支付密码端点
 * 验证用户的支付密码是否正确
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ password: string }
 * 响应：验证结果
 */
export const VERIFY_PAYMENT_PASSWORD_ENDPOINT = '/wallet/validate-security-password';

/**
 * 获取交易记录端点
 * 获取用户的交易记录，包括充值、提现、任务奖励等
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含筛选条件，如交易类型、时间范围等
 * 响应：包含交易记录列表和分页信息
 */
export const GET_TRANSACTION_RECORD_ENDPOINT = '/wallet/transactions';

/**
 * 用户充值端点
 * 用户充值，向钱包中添加余额
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ amount: number, paymentMethod: string }
 * 响应：充值结果和支付链接
 */
export const USERS_RECHARGE_ENDPOINT = '/wallet/recharge';

/**
 * 处理提现端点
 * 处理用户的提现申请，通常由管理员使用
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ withdrawalId: string, status: string, remark: string }
 * 响应：处理结果
 */
export const PROCESS_WITHDRAWAL_ENDPOINT = '/wallet/process-withdraw';
