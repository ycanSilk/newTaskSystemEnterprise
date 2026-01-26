/*
出租部分
*/ 
//创建出租信息
export const CREATE_OFFERS_RENTAL_INFO_ENDPOINT = `/rental/offers/create.php`;

//获取出租市场列表
export const GET_OFFERS_RENTAL_MARKET_LIST_ENDPOINT = `/rental/offers/list.php`;

//获取账号出租信息详情信息
export const GET_OFFERS_RENTAL_INFO_DETAIL_ENDPOINT = `/rental/offers/detail.php`;






/*
求租部分
*/ 

//创建求租信息
export const CREATE_REQUEST_RENTAL_INFO_ENDPOINT = `/rental/demands/create.php`;


//获取求租市场列表
export const GET_REQUEST_RENTAL_MARKET_LIST_ENDPOINT = `/rental/demands/list.php`;

//获取求租信息详情信息
export const GET_REQUEST_RENTAL_INFO_DETAIL_ENDPOINT = `/rental/demands/detail.php`;

//求租信息应征申请请求端点
export const APPLY_REQUEST_RENTAL_INFO_ENDPOINT = `/rental/applications/apply.php`;

//求租信息应征申请列表
export const GET_APPLIED_REQUEST_RENTAL_INFO_LIST_ENDPOINT = `/rental/applications/list.php`;

//审核求租信息应征申请
export const REVIEW_APPLIED_REQUEST_RENTAL_INFO_ENDPOINT = `/rental/applications/review.php`;



//同样租赁订单接口
//我购买的租赁订单
export const MY_BUYS_RENTAL_ORDER_LIST_ENDPOINT = '/rental/orders/my-buyer.php'



//我出售的租赁订单
export const MY_SELLER_RENTAL_ORDER_LIST_ENDPOINT = '/rental/orders/my-seller.php'
