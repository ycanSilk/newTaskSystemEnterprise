// 前端支付钱包模块 - 检查支付密码相关类型定义
// 这个文件包含了前端检查用户是否设置支付密码的API响应类型定义

/**
 * 检查支付密码API响应类型
 * 用于定义前端调用检查支付密码API返回的数据结构
 * 包含标准化的success字段，方便前端处理
 */
export interface CheckWalletPwdApiResponse {
  /**
   * 成功标识
   * true表示请求成功，false表示请求失败
   */
  success: boolean;
  
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
   * 包含检查支付密码的结果
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
