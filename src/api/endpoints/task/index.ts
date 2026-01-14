// Task模块 - 任务相关端点定义
// 这个文件定义了任务模块的所有API端点，用于前后端通信

/**
 * 发布任务模板端点
 * 发布新的任务模板，让其他人可以接受并完成
 * 请求方法：POST
 * 请求体：包含任务模板信息，如任务类型、平台、要求、奖励等
 * 响应：发布结果和任务模板详情
 */
export const PUBLISH_TASK_TEMPLATE_ENDPOINT = '/b/v1/task-templates.php';


//发布单个任务请求端点
export const PUBLISH_SINGLE_TASK_ENDPOINT = '/b/v1/tasks.php';


//获取组合任务请求端点
export const GET_COMBINED_TASK_ENDPOINT = '/b/v1/tasks.php';


//获取已经发布的全部任务列表
export const GET_PUBLISHED_TASKS_LIST_ENDPOINT = '/b/v1/tasks/list.php';



