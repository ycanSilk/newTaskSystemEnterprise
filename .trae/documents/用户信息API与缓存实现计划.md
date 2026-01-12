# 用户信息API与Zustand状态管理实现计划

## 1. 实现Zustand状态管理

### 1.1 创建Zustand用户状态存储
- **文件**: `src/store/userStore.ts`
- **功能**: 
  - 定义用户信息状态和操作方法
  - 实现获取用户信息的异步逻辑
  - 支持内存缓存用户信息
- **引用**: 导入类型定义 `GetUserInfoResponseData`

### 1.2 更新根布局
- **文件**: `src/app/layout.tsx`
- **功能**: 
  - 应用启动时调用Zustand store的fetchUser方法
  - 确保用户信息在应用加载时就位

## 2. 实现API请求处理逻辑

### 2.1 创建用户信息API处理函数
- **文件**: `src/api/handlers/users/getUserInfoHandler.ts`
- **功能**: 实现调用外部API获取用户信息的逻辑
- **引用**: 
  - 导入API端点配置
  - 导入类型定义 `GetUserInfoResponseData` 和 `GetUserInfoResponse`

### 2.2 创建用户信息API端点
- **文件**: `src/api/endpoints/users/index.ts`
- **功能**: 定义GET_USER_INFO_ENDPOINT常量

## 3. 实现Next.js API路由

### 3.1 创建API路由处理器
- **文件**: `src/app/api/users/getUserInfo/route.ts`
- **功能**: 调用API处理函数，返回用户信息
- **引用**: 导入getUserInfoHandler

## 4. 修改前端页面

### 4.1 更新个人资料页面
- **文件**: `src/app/publisher/profile/page.tsx`
- **功能**: 
  - 使用Zustand hook获取用户信息
  - 渲染到UI布局（135-140行）
  - 移除直接API调用

### 4.2 更新个人设置页面
- **文件**: `src/app/publisher/profile/settings/page.tsx`
- **功能**: 
  - 删除现有API调用代码
  - 删除相关数据类型定义
  - 使用Zustand hook获取用户信息
  - 渲染到UI布局（247-261行）
  - 删除账号类型和用户ID展示代码（262-278行）

## 5. 验证与测试

### 5.1 确保类型安全
- 所有API调用和数据处理都使用正确的类型定义
- 确保TypeScript编译通过

### 5.2 确保功能正常
- Zustand store能够正确获取和缓存用户信息
- 前端页面能够正确读取和渲染用户信息
- 应用加载时自动获取用户信息

## 执行顺序

1. 创建API处理函数和端点
2. 创建API路由
3. 创建Zustand用户状态存储
4. 更新根布局
5. 更新个人资料页面
6. 更新个人设置页面
7. 验证和测试

## 预期效果

- 用户信息通过API获取并缓存在Zustand store中
- 前端页面从store读取用户信息，减少重复API调用
- 应用加载时自动获取用户信息，确保数据就位
- 确保类型安全和代码可维护性
- 优化用户体验，减少页面加载时间