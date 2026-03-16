// Auth模块 - 注册相关类型定义
// 这个文件包含了注册请求和响应的类型定义，确保类型安全

/**
 * 获取用户信息响应数据类型
 * 定义了获取用户信息成功后返回的用户数据格式,包含用户ID、用户名、邮箱、手机号、组织名称、组织负责人、钱包ID等信息
 * 因为是GET请求，所以响应数据中不包含密码等敏感信息，不需要创建request
 */
export interface GetUserInfoResponseData {

  /**
   * 用户ID
   * 新注册用户的唯一标识
   */
  id: string;
  
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


  wallet: {
    /**
     * 钱包余额，保留2位小数
     * 新注册用户的钱包余额
     */
    balance: number;
  }

  status: string;   // 用户状态，如活跃、已禁用等    1，启用；2，禁用

  reason: null,

  create_ip: string;    // 注册用户的IP地址

  created_at: string;    // 用户创建时间

  updated_at: string;    // 用户最近更新时间    

}

/**
 * 注册响应类型
 * 定义了注册请求的完整响应格式
 */
export interface GetUserInfoResponse {
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
  data: GetUserInfoResponseData;
  
  /**
   * 时间戳
   * 响应生成的时间，单位为秒
   */
  timestamp: number;
}