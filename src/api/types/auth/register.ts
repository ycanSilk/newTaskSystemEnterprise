// Auth模块 - 注册相关类型定义
// 这个文件包含了注册请求和响应的类型定义，确保类型安全

/**
 * 注册请求类型
 * 定义了客户端发送注册请求时需要提供的数据格式
 */
export interface RegisterRequest {
  /**
   * 用户名
   * 用户注册时使用的用户名
   */
  username: string;
  
  /**
   * 邮箱
   * 用户的邮箱地址，用于验证和找回密码
   */
  email: string;
  
  /**
   * 手机号
   * 用户的手机号，可选，用于验证和找回密码
   */
  phone: string;
  
  /**
   * 密码
   * 用户设置的登录密码
   */
  password: string;
  
  /**
   * 组织名称
   * 用户所属组织的名称
   */
  organization_name: string;
  
  /**
   * 组织负责人
   * 用户所属组织的负责人名称
   */
  organization_leader: string;
}

/**
 * 注册响应数据类型
 * 定义了注册成功后返回的用户数据格式
 */
export interface RegisterResponseData {
  /**
   * 认证令牌
   * 用户登录后用于身份验证的token
   */
  token: string;
  
  /**
   * 用户ID
   * 新注册用户的唯一标识
   */
  user_id: string;
  
  /**
   * 用户名
   * 注册成功的用户名
   */
  username: string;
  
  /**
   * 邮箱
   * 注册成功的邮箱地址
   */
  email: string;
  
  /**
   * 手机号
   * 注册成功的手机号
   */
  phone: string;
  
  /**
   * 组织名称
   * 注册成功的组织名称
   */
  organization_name: string;
  
  /**
   * 组织负责人
   * 注册成功的组织负责人
   */
  organization_leader: string;
  
  /**
   * 钱包ID
   * 新注册用户的钱包ID
   */
  wallet_id: string;
}

/**
 * 注册响应类型
 * 定义了注册请求的完整响应格式
 */
export interface RegisterResponse {
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
   * 注册成功时返回的用户数据
   */
  data: RegisterResponseData;
  
  /**
   * 时间戳
   * 响应生成的时间，单位为秒
   */
  timestamp: number;
}