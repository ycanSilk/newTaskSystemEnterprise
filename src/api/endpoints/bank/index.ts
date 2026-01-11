// Bank模块 - 银行卡相关端点定义
// 这个文件定义了银行卡模块的所有API端点，用于前后端通信

/**
 * 获取银行卡列表端点
 * 获取当前用户的银行卡列表
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含银行卡列表
 */
export const GET_BANK_CARDS_LIST_ENDPOINT = '/bank-cards/';

/**
 * 添加银行卡端点
 * 添加新的银行卡到用户账户
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：{ cardNumber: string, bankName: string, cardHolderName: string, phoneNumber: string }
 * 响应：包含新添加的银行卡信息
 */
export const ADD_BANK_CARD_ENDPOINT = '/bank-cards/';

/**
 * 修改银行卡端点
 * 修改指定银行卡的信息
 * 请求方法：PUT
 * 请求头：Authorization: Bearer <token>
 * URL参数：{cardId} - 银行卡ID
 * 请求体：{ bankName: string, cardHolderName: string, phoneNumber: string }
 * 响应：包含修改后的银行卡信息
 */
export const CHANGE_BANK_CARD_ENDPOINT = '/bank-cards/{cardId}';

/**
 * 删除银行卡端点
 * 删除指定的银行卡
 * 请求方法：DELETE
 * 请求头：Authorization: Bearer <token>
 * URL参数：{cardId} - 银行卡ID
 * 响应：删除结果
 */
export const DELETE_BANK_CARD_ENDPOINT = '/bank-cards/{cardId}';

/**
 * 设置默认银行卡端点
 * 将指定银行卡设置为默认卡
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{cardId} - 银行卡ID
 * 响应：设置结果
 */
export const SET_DEFAULT_BANK_CARD_ENDPOINT = '/bank-cards/{cardId}/default';

/**
 * 获取默认银行卡端点
 * 获取用户的默认银行卡
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含默认银行卡信息
 */
export const GET_DEFAULT_BANK_CARD_ENDPOINT = '/bank-cards/default';
