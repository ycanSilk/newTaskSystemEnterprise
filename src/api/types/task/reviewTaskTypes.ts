// 审核任务API类型定义

// 审核任务请求参数接口
export interface ReviewTaskRequest {
  // 主任务ID
  b_task_id: number;
  // 记录ID
  record_id: number;
  // 审核动作：approve=通过, reject=驳回
  action: 'approve' | 'reject';
  // 驳回原因，action=reject时必填
  reject_reason: string;
}

// 审核任务响应数据接口
export interface ReviewTaskResponseData {
  // 状态码
  code: number;
  // 响应消息
  message: string;
  // 审核结果数据
  data: {
    // 记录ID
    record_id: number;
    // 主任务ID
    b_task_id: number;
    // 审核动作结果
    action: string;
    // 用户佣金
    c_user_commission: string;
    // 代理佣金
    agent_commission: string;
    // 代理用户ID
    agent_user_id: number | null;
    // 代理用户名
    agent_username: string | null;
    // 审核时间
    reviewed_at: string;
  };
  // 响应时间戳
  timestamp: number;
}

// 标准API响应接口
export interface ApiResponse {
  // 请求是否成功
  success: boolean;
  // 业务状态码
  code: number;
  // 响应消息
  message: string;
  // 响应时间戳
  timestamp: number;
  // 响应数据
  data: any | null;
}
