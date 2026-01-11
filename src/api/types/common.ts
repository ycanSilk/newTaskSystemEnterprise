// 通用类型定义
// 这个文件包含了API客户端中使用的通用类型，如响应格式、分页等

/**
 * 标准化API响应类型
 * 所有API响应都会遵循这个格式，确保前后端数据格式一致
 * T是泛型参数，表示响应数据的具体类型，可以根据不同接口进行替换
 */
export interface ApiResponse<T = any> {
  /**
   * 成功标识
   * true表示请求成功，false表示请求失败
   */
  success: boolean;
  
  /**
   * 状态码
   * 表示请求的状态，如200表示成功，404表示资源不存在，500表示服务器错误等
   */
  code: number;
  
  /**
   * 消息
   * 对请求结果的文字描述，如"请求成功"、"用户名或密码错误"等
   */
  message: string;
  
  /**
   * 数据
   * 响应的实际数据，类型为T（泛型），可以是任何类型，如对象、数组、字符串等
   */
  data: T;
  
  /**
   * 时间戳
   * 响应生成的时间，单位为毫秒
   */
  timestamp: number;
  
  /**
   * 错误类型（仅在失败时存在）
   * 表示错误的具体类型，如NETWORK_ERROR、AUTH_ERROR等
   */
  errorType?: string;
}

/**
 * 分页请求参数类型
 * 用于所有需要分页的请求，包含分页、排序相关的参数
 */
export interface PaginationParams {
  /**
   * 页码，从0开始
   * 表示当前请求的是第几页数据，默认为0（第一页）
   */
  page?: number;
  
  /**
   * 每页大小
   * 表示每页显示的数据条数，默认为10
   */
  size?: number;
  
  /**
   * 排序字段
   * 表示根据哪个字段进行排序，如"createTime"、"price"等
   */
  sortField?: string;
  
  /**
   * 排序顺序（ASC/DESC）
   * ASC表示升序排序，DESC表示降序排序，默认为DESC
   */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 分页响应数据类型
 * 用于所有需要分页的响应，包含列表数据和分页信息
 * T是泛型参数，表示列表中每个元素的具体类型
 */
export interface PaginationData<T = any> {
  /**
   * 列表数据
   * 当前页的具体数据列表，类型为T[]（T的数组）
   */
  list: T[];
  
  /**
   * 总数
   * 所有符合条件的数据总条数
   */
  total: number;
  
  /**
   * 页码
   * 当前返回的是第几页数据，从0开始
   */
  page: number;
  
  /**
   * 每页大小
   * 当前每页显示的数据条数
   */
  size: number;
  
  /**
   * 总页数
   * 所有数据总共需要多少页才能显示完，计算公式：Math.ceil(total / size)
   */
  pages: number;
}

/**
 * 标准分页响应类型
 * 结合了ApiResponse和PaginationData，用于分页请求的响应
 * T是泛型参数，表示列表中每个元素的具体类型
 */
export interface PaginationResponse<T = any> extends ApiResponse {
  /**
   * 数据，包含分页信息
   * 类型为PaginationData<T>，包含列表数据和分页信息
   */
  data: PaginationData<T>;
}

/**
 * 空响应类型
 * 用于没有返回数据的API响应，如删除操作
 */
export interface EmptyResponse extends ApiResponse {
  /**
   * 数据，为空
   * 表示该请求没有返回具体数据，只返回了状态信息
   */
  data: null;
}
