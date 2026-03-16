// 注册页面类型定义

/**
 * 注册表单数据类型
 * 用于定义注册表单的字段结构
 */
export interface RegisterFormData {
  /**
   * 用户名
   * 与后端API字段名保持一致
   */
  username: string;
  
  /**
   * 密码
   * 与后端API字段名保持一致
   */
  password: string;
  
  /**
   * 确认密码
   * 用于前端密码确认，不直接发送到后端
   */
  confirmPassword: string;
  
  /**
   * 手机号
   * 与后端API字段名保持一致
   */
  phone: string;
  
  /**
   * 邮箱
   * 与后端API字段名保持一致
   */
  email: string;
  
  /**
   * 企业名称
   * 与后端API字段名保持一致
   */
  organization_name: string;
  
  /**
   * 企业负责人
   * 与后端API字段名保持一致
   */
  organization_leader: string;
  
  /**
   * 验证码
   * 用于前端验证码验证
   */
  captcha: string;
  
  /**
   * 是否同意条款
   * 用于前端条款同意验证
   */
  agreeToTerms: boolean;
}

/**
 * 注册API请求类型
 * 用于定义发送到后端的注册请求数据结构
 * 与后端API请求格式保持一致
 */
export interface RegisterApiRequest {
  /**
   * 用户名
   * 与后端API字段名保持一致
   */
  username: string;
  
  /**
   * 密码
   * 与后端API字段名保持一致
   */
  password: string;
  
  /**
   * 手机号
   * 与后端API字段名保持一致
   */
  phone: string;
  
  /**
   * 邮箱
   * 与后端API字段名保持一致
   */
  email: string;
  
  /**
   * 企业名称
   * 与后端API字段名保持一致
   */
  organization_name: string;
  
  /**
   * 企业负责人
   * 与后端API字段名保持一致
   */
  organization_leader: string;
}

/**
 * 注册API响应类型
 * 用于定义注册API返回的数据结构
 * 与后端API响应格式保持一致
 */
export interface RegisterApiResponse {
  /**
   * 成功标识
   * true表示注册成功，false表示注册失败
   */
  success: boolean;
  
  /**
   * 状态码
   * 0表示成功，其他表示失败
   */
  code: number;
  
  /**
   * 消息
   * 注册结果的文字描述
   */
  message: string;
  
  /**
   * 数据
   * 注册成功时返回的用户信息
   */
  data?: {
    /**
     * 用户ID
     * 新注册用户的唯一标识
     */
    user_id?: number;
    
    /**
     * 用户名
     * 新注册用户的用户名
     */
    username?: string;
  };
  
  /**
   * 时间戳
   * 响应生成的时间，单位为秒
   */
  timestamp: number;
}
