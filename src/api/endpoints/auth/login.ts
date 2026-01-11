// Auth模块 - 登录相关端点定义
// 这个文件定义了auth模块的所有API端点，用于前后端通信

/**
 * 登录端点
 * 用户登录API，用于获取认证token
 * 请求方法：POST
 * 请求体：{ account: string, password: string }
 * 响应：包含token和用户信息
 */
export const LOGIN_ENDPOINT = '/b/v1/auth/login.php';

/**
 * 注册端点
 * 用户注册API，用于创建新用户
 * 请求方法：POST
 * 请求体：{ username: string, password: string, email: string, phone: string }
 * 响应：包含注册结果和用户信息
 */
export const REGISTER_ENDPOINT = '/b/v1/auth/register.php';

/**
 * 登出端点
 * 用户登出API，用于销毁当前token
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 响应：登出结果
 */
export const LOGOUT_ENDPOINT = '/b/v1/auth/change-password.php';

/**
 * 重置密码端点
 * 重置密码API，用于忘记密码时重置
 * 请求方法：POST
 * 请求体：{ email: string, newPassword: string, verificationCode: string }
 * 响应：重置结果
 */
export const RESET_PASSWORD_ENDPOINT = '/biz/user/reset-password';

/**
 * 刷新Token端点
 * 刷新token API，用于获取新的token
 * 请求方法：POST
 * 请求头：Authorization: Bearer <refreshToken>
 * 响应：包含新的token和刷新token
 */
export const REFRESH_TOKEN_ENDPOINT = '/biz/user/refresh';

/**
 * 用户列表端点
 * 获取用户列表API，用于管理员查看用户
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, keyword等
 * 响应：包含用户列表和分页信息
 */
export const USER_LIST_ENDPOINT = '/biz/user/list';

/**
 * 用户列表端点
 * 获取用户列表API，用于管理员查看用户
 * 请求方法：GET
 * 请求头：X-Token: <token>
 * 查询参数：page, size, keyword等
 * 响应：包含用户列表和分页信息
 */
export const USER_INFO_ENDPOINT = '/b/v1/me.php';