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


//发布组合任务请求端点
export const PUBLISH_COMBINED_TASK_ENDPOINT = '/b/v1/tasks.php';


//获取已经发布的全部任务列表
export const GET_PUBLISHED_TASKS_LIST_ENDPOINT = '/b/v1/tasks/list.php';


//获取等待审核的任务列表
export const GET_PENDING_TASKS_LIST_ENDPOINT = '/b/v1/tasks/pending.php';


//审核任务端点
export const APPROVE_TASK_ENDPOINT = '/b/v1/tasks/review.php';


//发布放大镜任务请求端点
export const PUBLISH_MAGNIFIER_TASK_ENDPOINT = '/b/v1/magnify/create.php';

//获取放大镜任务详情端点
export const GET_MAGNIFIER_TASK_DETAILS_ENDPOINT = '/b/v1/magnify/detail.php';

//获取放大镜任务列表端点
export const GET_MAGNIFIER_TASK_LIST_ENDPOINT = '/b/v1/magnify/list.php';


//发布新手任务请求端点
export const PUBLISH_NEWBIE_TASK_ENDPOINT = '/b/v1/newbie-tasks.php';



