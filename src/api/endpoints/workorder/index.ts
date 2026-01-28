/*
出租部分
*/ 
//创建工单
export const CREATE_WORK_ORDER_ENDPOINT = `/rental/tickets/create.php`;

//获取工单列表
export const GET_WORK_ORDER_LIST_ENDPOINT = `/rental/tickets/list.php`;

//获取工单详情信息和消息列表
export const GET_WORK_ORDER_DETAIL_ENDPOINT = `/rental/tickets/detail.php`;


//获取工单的消息列表
export const GET_ORDER_MESSAGE_LIST_ENDPOINT = `/rental/tickets/messages.php`;


//发送消息请求端点
export const SEND_MESSAGE_ENDPOINT = `/rental/tickets/send-message.php`;

//关闭工单请求端点
export const CLOSE_WORK_ORDER_ENDPOINT = `/rental/tickets/close.php`;