// Auth模块 - 登录相关类型定义
// 这个文件包含了登录和注册相关的请求和响应类型定义

/**
 * 登录请求类型
 * 用于定义登录请求的参数格式
 * 前端发送登录请求时，需要按照这个格式传递参数
 */
export interface LoginRequest {
  /**
   * 账号
   * 用户登录时使用的账号，可以是用户名、手机号或邮箱
   */
  account: string;
  
  /**
   * 密码
   * 用户登录时使用的密码，需要加密后传输
   */
  password: string;
}

/**
 * 登录响应类型
 * 用于定义登录响应的返回格式
 * 后端返回登录结果时，会按照这个格式返回数据
 */
export interface LoginResponse {
  /**
   * 状态码
   * 0表示成功，其他表示失败
   */
  code: number;
  
  /**
   * 消息
   * 登录结果的文字描述，如"登录成功"、"用户名或密码错误"等
   */
  message: string;
  
  /**
   * 数据
   * 登录成功时返回的用户相关数据
   */
  data: {
    /**
     * 认证令牌
     * 用户登录后用于身份验证的token
     */
    token: string;
    
    /**
     * 用户ID
     * 用户的唯一标识，用于后续请求中的用户识别
     */
    user_id: number;
    
    /**
     * 用户名
     * 登录成功的用户名
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
     * 用户所属组织的负责人名称
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

/**
 * 注册请求类型
 * 用于定义注册请求的参数格式
 * 前端发送注册请求时，需要按照这个格式传递参数
 */
export interface RegisterRequest {
  /**
   * 用户名
   * 用户注册时使用的用户名，可以是手机号、邮箱或自定义用户名
   */
  username: string;
  
  /**
   * 密码
   * 用户设置的密码，需要加密后传输
   */
  password: string;
  
  /**
   * 确认密码
   * 再次输入密码，用于确认密码是否正确
   */
  confirmPassword: string;
  
  /**
   * 手机号
   * 用户的手机号，用于验证和找回密码
   */
  phone?: string;
  
  /**
   * 邮箱
   * 用户的邮箱地址，用于验证和找回密码
   */
  email?: string;
  
  /**
   * 验证码
   * 注册时需要输入的验证码，用于验证手机号或邮箱
   */
  verifyCode?: string;
}

/**
 * 注册响应类型
 * 用于定义注册响应的返回格式
 * 后端返回注册结果时，会按照这个格式返回数据
 */
export interface RegisterResponse {
  /**
   * 成功标识
   * true表示注册成功，false表示注册失败
   */
  success: boolean;
  
  /**
   * 状态码
   * 表示注册请求的状态，如200表示成功，400表示参数错误
   */
  code: number;
  
  /**
   * 消息
   * 注册结果的文字描述，如"注册成功"、"用户名已存在"等
   */
  message: string;
  
  /**
   * 数据
   * 注册成功时返回的用户相关数据，可选
   */
  data?: {
    /**
     * 用户ID
     * 新注册用户的唯一标识
     */
    userId: string;
    
    /**
     * 用户名
     * 新注册的用户名
     */
    username: string;
  };
  
  /**
   * 时间戳
   * 响应生成的时间，单位为毫秒
   */
  timestamp: number;
}
