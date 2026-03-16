// InviteAgent模块 - 邀请代理相关端点定义
// 这个文件定义了邀请代理模块的所有API端点，用于前后端通信

/**
 * 获取代理统计端点
 * 获取当前用户的代理统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含代理数量、收益统计等数据
 */
export const GET_AGENT_STATS_ENDPOINT = '/agent/stats';

/**
 * 获取我的代理团队端点
 * 获取当前用户的代理团队列表
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含代理团队列表和分页信息
 */
export const GET_MY_AGENT_TEAM_ENDPOINT = '/agent/team';

/**
 * 获取我的邀请码端点
 * 获取当前用户的邀请码
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含邀请码信息
 */
export const GET_MY_INVITATION_CODE_ENDPOINT = '/agent/invitation-code';
