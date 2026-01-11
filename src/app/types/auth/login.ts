// 登录页面类型定义

/**
 * 登录表单数据类型
 * 用于定义登录表单的字段结构
 */
export interface LoginFormData {
  /**
   * 账号
   * 与后端API字段名保持一致
   */
  account: string;
  
  /**
   * 密码
   * 与后端API字段名保持一致
   */
  password: string;
  
  /**
   * 验证码
   * 用于前端验证码验证
   */
  captcha: string;
}

/**
 * 登录API响应类型
 * 用于定义登录API返回的数据结构
 * 与后端API响应格式保持一致
 */
export interface LoginApiResponse {
  /**
   * 成功标识
   * true表示登录成功，false表示登录失败
   */
  success: boolean;
  
  /**
   * 状态码
   * 0表示成功，其他表示失败
   */
  code: number;
  
  /**
   * 消息
   * 登录结果的文字描述
   */
  message: string;
  
  /**
   * 数据
   * 登录成功时返回的用户信息和token
   */
  data: {
    /**
     * 认证令牌
     * 用户登录后用于身份验证的token
     */
    token: string;
    
    /**
     * 用户ID
     * 用户的唯一标识
     */
    user_id: number;
    
    /**
     * 用户名
     * 用户的用户名
     */
    username: string;
    
    /**
     * 邮箱
     * 用户的邮箱地址
     */
    email: string;
    
    /**
     * 手机号
     * 用户的手机号，可能为null
     */
    phone: string | null;
    
    /**
     * 组织名称
     * 用户所属组织的名称
     */
    organization_name: string;
    
    /**
     * 组织负责人
     * 用户所属组织的负责人
     */
    organization_leader: string;
    
    /**
     * 钱包ID
     * 用户的钱包ID
     */
    wallet_id: number;
  };
  
  /**
   * 时间戳
   * 响应生成的时间，单位为秒
   */
  timestamp: number;
}
