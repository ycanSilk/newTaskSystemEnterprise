现在开始优化src\app\publisher\dashboard\InProgress\page.tsx这个页面；
按照这个文档要求，来处理这个页面；增加日志分级管理，并且根据后端的错误码；进行对应层级处理；要根据错误码提示，进行分层级显示； 并自动记录日志。
增加http状态码管理，根据http状态码，进行对应层级处理；
按照要求修改文件src\api\handlers\task\getTasksListHandler.ts
参考src\api\handlers\auth\loginHandler.ts这个文件修改，导入
// 导入文件系统操作模块
import fs from 'fs';
import path from 'path';
// 导入日志配置
import logConfig from '../../../config/logConfig.json';
模块来记录，实现持久化日志存储  

HTTP通用错误码：
| 错误码 | 常量名 | 说明 | 使用场景 | HTTP 状态码 |
|--------|--------|------|----------|------------|
| **0** | `SUCCESS` | 成功 | 所有成功响应 | 200 |
| **1001** | `INVALID_PARAMS` | **请求参数错误** | 参数校验失败 | 400 |=

API错误码如下：
* 错误码说明：
 * 1001 - 请求方法错误
 * 4012 - 用户认证失败
 * 5001 - 数据库错误
 * 5002 - 获取任务列表失败
 

API请求示例：
 * B 端任务列表接口
 * 
 * GET /api/b/v1/tasks/list
 * 
 * 请求头：
 * X-Token: <token> (B 端)
 * 
 * 请求参数：
 * - status (可选): 任务状态筛选 0=已过期 1=进行中 2=已完成 3=已取消
 * - page (可选): 页码，默认 1
 * - page_size (可选): 每页数量，默认 20
 * 
 * 请求示例：
 * GET /api/b/v1/tasks/list?status=1&page=1&page_size=20
 * 
 * 响应示例（成功）：
 * {
 *   "code": 0,
 *   "message": "获取成功",
 *   "data": {
 *     "tasks": [
 *       {
 *         "task_id": 1,
 *         "template_id": 5,
 *         "template_title": "抖音点赞任务",
 *         "template_type": 0,
 *         "template_type_text": "单任务",
 *         "video_url": "https://...",
 *         "deadline": 1737388799,
 *         "deadline_text": "2026-01-20 23:59:59",
 *         "task_count": 100,
 *         "task_done": 45,
 *         "task_doing": 20,
 *         "task_reviewing": 10,
 *         "task_available": 25,
 *         "progress_percent": 45.00,
 *         "unit_price": "5.00",
 *         "total_price": "500.00",
 *         "status": 1,
 *         "status_text": "进行中",
 *         "is_combo": false,
 *         "stage": 0,
 *         "stage_text": "单任务",
 *         "stage_status": 1,
 *         "stage_status_text": "已开放",
 *         "combo_task_id": null,
 *         "parent_task_id": null,
 *         "is_newbie": false,
 *         "is_newbie_text": "普通任务",
 *         "created_at": "2026-01-14 10:00:00",
 *         "updated_at": "2026-01-14 12:00:00",
 *         "completed_at": null
 *       }
 *     ],
 *     "pagination": {
 *       "current_page": 1,
 *       "page_size": 20,
 *       "total": 50,
 *       "total_pages": 3
 *     }
 *   },
 *   "timestamp": 1737123456
 * }
 * 
 * 响应示例（失败）：
 * {
 *   "code": 5001,
 *   "message": "数据库连接失败",
 *   "data": []
 * }
 * 
