// Rental模块 - 租赁相关端点定义
// 这个文件定义了租赁模块的所有API端点，用于前后端通信

/**
 * 发布租赁信息端点
 * 发布出租信息，让其他人可以租用你的账号
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含出租信息，如平台类型、账号信息、价格、租期等
 * 响应：发布结果和租赁信息详情
 */
export const PUBLISH_RENTAL_ENDPOINT = '/rental/lease/publish';

/**
 * 出租市场端点
 * 获取出租市场的租赁信息列表
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含筛选条件，如平台类型、价格范围、租期等
 * 响应：包含租赁信息列表和分页信息
 */
export const RENTAL_MARKET_ENDPOINT = '/rental/lease/market';

/**
 * 求租市场端点
 * 获取求租市场的求租信息列表
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含筛选条件，如平台类型、价格范围、租期等
 * 响应：包含求租信息列表和分页信息
 */
export const REQUEST_RENTAL_MARKET_ENDPOINT = '/rental/rent/market';

/**
 * 发布求租信息端点
 * 发布求租信息，寻找你想要租用的账号
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含求租信息，如平台类型、账号要求、价格范围、租期等
 * 响应：发布结果和求租信息详情
 */
export const PUBLISH_REQUEST_RENTAL_ENDPOINT = '/rental/rent/publish';

/**
 * 我的发布租赁信息列表端点
 * 获取我发布的所有出租信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含我的出租信息列表和分页信息
 */
export const MY_PUBLISH_RENTAL_INFO_LIST_ENDPOINT = '/rental/lease/my';

/**
 * 我的请求租赁信息列表端点
 * 获取我发布的所有求租信息
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含我的求租信息列表和分页信息
 */
export const MY_REQUEST_RENTAL_INFO_LIST_ENDPOINT = '/rental/rent/my';

/**
 * 创建租赁订单端点
 * 创建租赁订单，租用他人的账号
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * 请求体：包含租赁信息ID、租期、支付方式等
 * 响应：创建结果和订单详情
 */
export const CREATE_LEASE_ORDER_ENDPOINT = '/rental/orders/create';

/**
 * 我的租赁订单端点
 * 获取我作为出租方的所有订单
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含我的租赁订单列表和分页信息
 */
export const MY_RENTAL_ORDER_ENDPOINT = '/rental/orders/my/lessor';

/**
 * 我的租用订单端点
 * 获取我作为承租方的所有订单
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 查询参数：page, size, status等
 * 响应：包含我的租用订单列表和分页信息
 */
export const MY_RENTED_ORDER_ENDPOINT = '/rental/orders/my/renter';

/**
 * 获取租赁统计端点
 * 获取租赁相关的统计数据
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * 响应：包含租赁统计数据，如订单数量、收入等
 */
export const GET_LEASE_STATS_ENDPOINT = '/api/rental/stats';

/**
 * 获取租赁信息详情端点
 * 获取出租信息的详细内容
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{leaseId} - 租赁信息ID
 * 响应：租赁信息详情
 */
export const GET_LEASE_INFO_DETAIL_ENDPOINT = '/rental/lease/{leaseId}';

/**
 * 获取请求信息详情端点
 * 获取求租信息的详细内容
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{requestId} - 求租信息ID
 * 响应：求租信息详情
 */
export const GET_REQUEST_INFO_DETAIL_ENDPOINT = '/rental/rent/{requestId}';

/**
 * 获取订单详情端点
 * 获取租赁订单的详细内容
 * 请求方法：GET
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 响应：订单详情
 */
export const GET_ORDER_DETAIL_ENDPOINT = '/rental/orders/{orderId}';

/**
 * 取消租赁订单端点
 * 取消租赁订单
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 响应：取消结果
 */
export const CANCEL_LEASE_ORDER_ENDPOINT = '/rental/orders/{orderId}/cancel';

/**
 * 取消租赁信息端点
 * 取消我发布的出租信息
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{leaseId} - 租赁信息ID
 * 响应：取消结果
 */
export const CANCEL_LEASE_RENTAL_INFO_ENDPOINT = '/rental/lease/{leaseId}/cancel';

/**
 * 取消求租信息端点
 * 取消我发布的求租信息
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{requestId} - 求租信息ID
 * 响应：取消结果
 */
export const CANCEL_RENT_REQUEST_INFO_ENDPOINT = '/rental/rent/{requestId}/cancel';

/**
 * 完成租赁订单端点
 * 标记租赁订单为已完成
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 响应：完成结果
 */
export const COMPLETE_LEASE_ORDER_ENDPOINT = '/rental/orders/{orderId}/complete';

/**
 * 支付租赁订单端点
 * 支付租赁订单
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 请求体：包含支付方式、支付金额等
 * 响应：支付结果
 */
export const PAYMENT_LEASE_ORDER_ENDPOINT = '/rental/orders/{orderId}/pay';

/**
 * 开始租赁订单端点
 * 开始租赁订单，标记为进行中
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 响应：开始结果
 */
export const START_LEASE_ORDER_ENDPOINT = '/rental/orders/{orderId}/start';

/**
 * 结算租赁订单端点
 * 结算租赁订单，处理费用和收益
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 响应：结算结果
 */
export const SETTLE_LEASE_ORDER_ENDPOINT = '/rental/orders/{orderId}/settle';

/**
 * 争议订单端点
 * 对订单提出争议
 * 请求方法：POST
 * 请求头：Authorization: Bearer <token>
 * URL参数：{orderId} - 订单ID
 * 请求体：包含争议原因、证据等
 * 响应：争议提交结果
 */
export const DISPUTE_ORDER_ENDPOINT = '/rental/orders/{orderId}/dispute';
