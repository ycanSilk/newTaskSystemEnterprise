// 支付钱包模块 - 设置支付密码相关类型定义
// 这个文件包含了检查用户是否设置支付密码的请求和响应类型定义

/**
 * 设置支付密码请求类型
 * 由于是GET请求，没有请求体，所以这个接口为空
 */
export interface SetWalletPwdRequest {
  password: string;   // 要设置的支付密码
}


/**
 * 设置支付密码响应类型
 * 用于定义设置支付密码API返回的数据结构
 * 与后端API响应格式保持一致
 */
export interface SetWalletPwdResponse {
  /**
   * 状态码
   * 0表示成功，其他表示失败
   */
  code: number;
  
  /**
   * 消息
   * 操作结果的文字描述
   */
  message: string;
  
  /**
   * 数据
   * 包含设置支付密码的结果
   */
  data: {
    /**
     * 是否设置了支付密码
     * true表示已设置，false表示未设置
     */
    has_password: boolean;
  };
  
  /**
   * 时间戳
   * 响应生成的时间，单位为秒
   */
  timestamp: number;
}



