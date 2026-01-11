// Task模块 - 任务相关端点定义
// 这个文件定义了任务模块的所有API端点，用于前后端通信

/**
 * 发布任务端点
 * 发布新的任务，让其他人可以接受并完成
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含任务信息，如任务类型、平台、要求、奖励等
 * 响应：发布结果和任务详情
 */
export const PUBLISH_TASK_ENDPOINT = '/tasks/publish';

/**
 * 我的发布任务列表端点
 * 获取我发布的所有任务列表
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含我的任务列表和分页信息
 */
export const MY_PUBLISHED_TASKS_ENDPOINT = '/tasks/my-published';

/**
 * 待审核任务列表端点
 * 获取需要我审核的任务列表
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size等
 * 响应：包含待审核任务列表和分页信息
 */
export const PENDING_VERIFY_TASKS_ENDPOINT = '/tasks/pending-verify';

/**
 * 审核任务端点
 * 审核子任务，标记为通过或拒绝
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{subTaskId} - 子任务ID
 * 请求体：包含审核结果、备注等
 * 响应：审核结果
 */
export const REVIEW_TASK_ENDPOINT = '/tasks/accepted/{subTaskId}/verify';

/**
 * 任务统计端点
 * 获取任务相关统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含任务统计数据，如总任务数、完成任务数等
 */
export const TASK_STATS_ENDPOINT = '/tasks/stats';

/**
 * 任务大厅端点
 * 获取任务大厅的任务列表，供用户接受
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含筛选条件，如任务类型、平台、奖励范围等
 * 响应：包含任务列表和分页信息
 */
export const TASK_HALL_ENDPOINT = '/tasks/hall';

/**
 * 平台统计端点
 * 获取平台相关统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含平台统计数据，如活跃用户数、总任务量等
 */
export const PLATFORM_STATS_ENDPOINT = '/tasks/platform-stats';

/**
 * 主任务详情端点
 * 获取主任务的详细信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{taskId} - 主任务ID
 * 响应：主任务详情
 */
export const MAIN_TASK_DETAIL_ENDPOINT = '/tasks/main/{taskId}';

/**
 * 子任务列表端点
 * 获取子任务列表
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：taskId, status等
 * 响应：包含子任务列表和分页信息
 */
export const SUB_TASK_LIST_ENDPOINT = '/tasks/sub';

/**
 * 子任务详情端点
 * 获取子任务的详细信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{subTaskId} - 子任务ID
 * 响应：子任务详情
 */
export const SUB_TASK_DETAIL_ENDPOINT = '/tasks/sub/{subTaskId}';

/**
 * 上评评论端点
 * 发布上评评论任务
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含评论任务信息，如视频链接、评论内容要求等
 * 响应：发布结果和任务详情
 */
export const TOP_COMMENT_ENDPOINT = '/tasks/top-comment';

/**
 * 中评评论端点
 * 发布中评评论任务
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含评论任务信息，如视频链接、评论内容要求等
 * 响应：发布结果和任务详情
 */
export const MIDDLE_COMMENT_ENDPOINT = '/tasks/middle-comment';

/**
 * 中下评评论端点
 * 发布中下评评论任务
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含评论任务信息，如视频链接、评论内容要求等
 * 响应：发布结果和任务详情
 */
export const MIDDLE_BOTTOM_COMMENT_ENDPOINT = '/tasks/middle-bottom-comment';

/**
 * 上中评评论端点
 * 发布上中评评论任务
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含评论任务信息，如视频链接、评论内容要求等
 * 响应：发布结果和任务详情
 */
export const TOP_MIDDLE_COMMENT_ENDPOINT = '/tasks/top-middle-comment';

/**
 * 所有类型评论端点
 * 发布所有类型评论任务
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含评论任务信息，如视频链接、评论内容要求等
 * 响应：发布结果和任务详情
 */
export const ALL_COMMENT_ENDPOINT = '/tasks/all-comment';

/**
 * 任务平台统计端点
 * 获取任务平台相关统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含任务平台统计数据，如各平台任务数量、完成情况等
 */
export const TASKS_PLATFORM_STATS_ENDPOINT = '/tasks/platform-stats';
