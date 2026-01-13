/**
 * 检查支付密码的后端API端点,请求方法：GET
 */
export const CHECK_WALLET_PWD_ENDPOINT = '/b/v1/check-wallet-password.php';

//设置支付密码的后端API端点,请求方法：POST
export const SET_WALLET_PWD_ENDPOINT = '/b/v1/wallet-password.php';  // 设置支付密码


//获取钱包余额和交易明细的后端API端点,请求方法：GET
export const GET_WALLET_BALANCE_ENDPOINT = '/b/v1/wallet.php';  // 获取钱包余额和交易明细


//充值的后端API端点,请求方法：POST
export const RECHARGE_WALLET_ENDPOINT = '/b/v1/recharge.php';  // 充值