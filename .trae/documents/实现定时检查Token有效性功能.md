# 实现定时检查Token有效性功能

## 目标
增加定时检测token有效性的功能，除登录和注册页面外，其他页面都要检查。当token失效时，自动重定向到登录页面。

## 实现步骤

### 1. 创建Token检查钩子
- 创建 `src/hooks/useTokenChecker.ts` 文件
- 实现 `useTokenChecker` 钩子，包含以下功能：
  - 检查当前页面是否为登录或注册页面
  - 每10分钟从cookie获取token
  - 只有从cookie成功获取token后，才调用API校验token有效性
  - API调用间隔设置为60分钟
  - 检查失败时重定向到登录页面
  - 无法获取token时也重定向到登录页面

### 2. 更新Publisher布局
- 修改 `src/app/publisher/layout.tsx` 文件
- 在非认证页面中使用 `useTokenChecker` 钩子

### 3. 更新Rental布局
- 修改 `src/app/rental/layout.tsx` 文件
- 添加认证页面检查逻辑
- 在非认证页面中使用 `useTokenChecker` 钩子

### 4. 实现检查逻辑
- 实现无感调用，检查过程对用户无感知
- 定时检查间隔设置为10分钟（获取token）和60分钟（API校验）
- 检查失败时清除可能存在的无效token
- 重定向到登录页面时保留当前页面路径，以便登录后返回

## 技术实现要点
- 使用 `useEffect` 钩子实现定时检查
- 使用 `setInterval` 和 `clearInterval` 管理定时任务
- 使用 `cookies()` 从客户端获取token
- 使用 `useRouter` 或 `usePathname` 进行页面导航和路径检查
- 使用 `fetch` 调用检查token的API
- 确保在组件卸载时清除定时任务，避免内存泄漏
- 实现双定时器机制：10分钟检查cookie，60分钟API校验

## 预期效果
- 除登录和注册页面外，所有页面都会定时检查token有效性
- 当token失效时，用户会被自动重定向到登录页面
- 当无法获取token时，用户也会被重定向到登录页面
- 检查过程对用户无感知，只有在token失效时才会有交互
- API调用频率合理，避免过多的网络请求
