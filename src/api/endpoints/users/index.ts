// Users模块 - 用户相关端点定义
// 这个文件定义了用户模块的所有API端点，用于前后端通信

/**
 * 获取用户信息端点
 * 获取当前登录用户的个人信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含用户信息，如用户名、邮箱、手机等
 */
export const GET_USER_INFO_ENDPOINT = '/biz/user/profile';

/**
 * 修改密码端点
 * 修改当前用户的密码
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ oldPassword: string, newPassword: string }
 * 响应：修改结果
 */
export const CHANGE_PASSWORD_ENDPOINT = '/biz/user/change-password';

/**
 * 获取企业用户列表端点
 * 获取企业用户列表，用于管理员查看
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, keyword等
 * 响应：包含企业用户列表和分页信息
 */
export const GET_BIZ_USER_LIST_ENDPOINT = '/biz/user/main-accounts/list';

/**
 * 获取个人用户列表端点
 * 获取个人用户列表，用于管理员查看
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, keyword等
 * 响应：包含个人用户列表和分页信息
 */
export const GET_IND_USER_LIST_ENDPOINT = '/ind/user/list';

/**
 * 获取个人用户信息端点
 * 获取指定个人用户的详细信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{userId} - 用户ID
 * 响应：包含用户详细信息
 */
export const GET_IND_USER_ENDPOINT = '/ind/user/profile';

/**
 * 获取企业用户统计端点
 * 获取企业用户相关统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含企业用户统计数据，如总用户数、活跃用户数等
 */
export const GET_BIZ_USER_STATS_ENDPOINT = '/biz/user/main-accounts/stats';
