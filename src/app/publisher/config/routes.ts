// Publisher模块路由配置管理

/**
 * 路由标题映射（硬解码）
 */
export const routeTitleMap: Record<string, string> = {
  // 主页面
  '/publisher': '发布者中心',
  
  // Dashboard相关路由
  '/publisher/dashboard': '评论订单',
  '/publisher/dashboard/InProgress': '活跃任务',
  '/publisher/dashboard/Completed': '已完成任务',
  '/publisher/dashboard/AwaitingReview': '审核中任务',
  '/publisher/dashboard/OverView': '任务概览',
  '/publisher/dashboard/task-detail': '任务详情',
  '/publisher/dashboard/account-rental-detail': '账号租赁详情',
  
  // 创建任务相关路由
  '/publisher/create/platformtype': '发布评论',
  '/publisher/create/platform-task/douyin': '发布抖音评论',
  '/publisher/create/publish-top-comment': '发布上评评论',
  '/publisher/create/publish-middle-comment': '发布中评评论',
  '/publisher/create/publish-nakahiro': '发布中评评论',
  '/publisher/create/task-combination-middle-bottom': '发布中下评评论',
  '/publisher/create/task-combination-top-middle': '发布上中评评论',
  '/publisher/create/task-combination-all': '发布全类型评论',
  '/publisher/create/search-keyword-task': '放大镜搜索',
  '/publisher/create/supplementaryorder': '补充订单',
  '/publisher/create/video-send': '视频发送',
  '/publisher/create/video-task': '视频任务',
  
  // 个人中心相关路由
  '/publisher/profile': '我的',
  '/publisher/profile/data-stats': '数据总览',
  '/publisher/profile/personal-info': '个人信息',
  '/publisher/profile/settings': '个人资料',
  '/publisher/profile/verification': '身份认证',
  '/publisher/profile/changepwd': '修改密码',
  '/publisher/profile/paymentsettings': '支付设置',
  '/publisher/profile/paymentsettings/bindalipay': '绑定支付宝',
  '/publisher/profile/paymentsettings/setpaymentpwd': '设置支付密码',
  
  // 订单相关路由
  '/publisher/orders': '订单管理',
  '/publisher/orders/active': '活跃订单',
  '/publisher/orders/task-detail/[id]': '订单详情',
  '/publisher/orders/task-detail/[id]/suborders-detail/[id]': '子订单详情',
  '/publisher/orders/account-rental/[id]': '账号租赁订单',
  
  // 财务管理相关路由
  '/publisher/finance': '充值',
  '/publisher/balance': '账户余额',
  '/publisher/balance/transactionList': '交易记录',
  '/publisher/balance/transactionDetails/[id]': '交易详情',
  
  // 充值相关路由
  '/publisher/recharge': '充值',
  '/publisher/recharge/rechargeList': '充值记录',
  '/publisher/recharge/rechargeDetail/[id]': '充值记录详情',
  '/publisher/transactions': '充值记录',
  '/publisher/transactions/[id]': '充值详情',
  
  // 银行卡相关路由
  '/publisher/bank-cards': '银行卡管理',
  '/publisher/bank-cards/bank-cardlist/[id]': '银行卡详情',
  '/publisher/bind-bank-card': '绑定银行卡',
  
  // 其他路由
  '/publisher/notification': '通知提醒',
  '/publisher/douyin-version': '下载中心',
  '/publisher/stats': '统计报表',
  '/publisher/tasks/history': '任务历史',
  '/publisher/order-management': '订单管理选择'
};

/**
 * 路由层级关系和返回路径映射（硬解码）
 */
export const routeHierarchyMap: Record<string, string> = {
  // 创建任务相关路由层级
  '/publisher/create/platform-task/douyin': '/publisher/create/platformtype',
  '/publisher/create/publish-top-comment': '/publisher/create/platform-task/douyin',
  '/publisher/create/publish-middle-comment': '/publisher/create/platform-task/douyin',
  '/publisher/create/publish-nakahiro': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-middle-bottom': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-top-middle': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-all': '/publisher/create/platform-task/douyin',
  '/publisher/create/search-keyword-task': '/publisher/create/platform-task/douyin',
  '/publisher/create/supplementaryorder': '/publisher/orders',
  
  // 订单相关路由层级
  '/publisher/orders/task-detail': '/publisher/orders',
  '/publisher/orders/task-detail/[id]': '/publisher/orders',
  '/publisher/orders/task-detail/[id]/suborders-detail/[id]': '/publisher/orders/task-detail/[id]',
  '/publisher/orders/account-rental': '/publisher/orders',
  '/publisher/orders/account-rental/[id]': '/publisher/orders/account-rental',
  
  // 个人资料相关路由层级
  '/publisher/profile/data-stats': '/publisher/profile',
  '/publisher/profile/settings': '/publisher/profile',
  '/publisher/profile/changepwd': '/publisher/profile',
  '/publisher/profile/paymentsettings': '/publisher/profile',
  '/publisher/profile/paymentsettings/bindalipay': '/publisher/profile/paymentsettings',
  '/publisher/profile/paymentsettings/setpaymentpwd': '/publisher/profile/paymentsettings',
  
  // 财务相关路由层级
  '/publisher/balance': '/publisher/profile',
  '/publisher/balance/transactionList': '/publisher/balance',
  '/publisher/balance/transactionDetails/[id]': '/publisher/balance/transactionList',
  '/publisher/recharge': '/publisher/profile',
  '/publisher/recharge/rechargeList': '/publisher/recharge',
  '/publisher/recharge/rechargeDetail/[id]': '/publisher/recharge/rechargeList',
  '/publisher/transactions': '/publisher/profile',
  '/publisher/transactions/[id]': '/publisher/transactions',
  '/publisher/bank-cards': '/publisher/profile',
  '/publisher/bind-bank-card': '/publisher/bank-cards',
  
  // 其他路由层级
  '/publisher/douyin-version': '/publisher/profile',
  // Dashboard任务详情
  '/publisher/dashboard/task-detail/[id]': '/publisher/dashboard',
  // 账号租赁详情
  '/publisher/dashboard/account-rental-detail/[id]': '/publisher/dashboard',
  '/publisher/notification': '/publisher/profile'
};

/**
 * 发布者模块的一级页面
 */
export const firstLevelPages = [
  '/publisher/create/platformtype',
  '/publisher/profile'
];

// 动态路由模式配置已删除，所有路由均使用硬解码映射