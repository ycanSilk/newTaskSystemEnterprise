// API客户端配置管理
// 使用环境变量管理敏感配置，提高安全性和可维护性

// 定义API配置对象，包含所有API调用的基础设置
export const apiConfig = {
  // 基础URL，优先使用环境变量（如果环境变量没配置，就用默认值）
  // 这是调用后端API的基础地址，所有API请求都会拼接到这个地址后面
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://134.122.136.221:4667/api',
  
  // 请求超时时间，单位毫秒
  // 如果请求超过这个时间没有响应，就会自动取消，避免长时间等待
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '5000'),
  
  // 默认请求头
  // 告诉后端我们能接受什么格式的数据，以及我们发送的数据是什么格式
  headers: {
    accept: '*/*',  // 我们能接受后端返回的任何格式数据
    'Content-Type': 'application/json',  // 我们发送给后端的数据是JSON格式
  },
  
  // 重试配置
  // 当请求失败时，自动重试的次数和间隔时间
  retry: {
    count: parseInt(process.env.NEXT_PUBLIC_API_RETRY_COUNT || '3'),  // 最多重试3次
    delay: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000'),  // 每次重试间隔1000毫秒（1秒）
  },
  
  // 认证相关配置
  // 关于用户登录后token的存储和管理
  auth: {
    // Token存储的Cookie名称
    // 用户登录成功后，后端会返回一个token（类似于通行证），我们把它存到这个名字的Cookie里
    tokenCookieName: 'PublishTask_token',
    
    // 支持的Token键名列表，用于兼容旧版本
    // 如果有多个可能的token名字，会依次检查，找到第一个存在的token
    tokenKeys: ['PublishTask_token'],
  },
};

// 导出默认配置
// 这样其他文件可以直接导入使用这个配置
export default apiConfig;
