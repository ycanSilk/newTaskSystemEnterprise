# 实施计划

## 1. 问题分析

通过分析5个相关页面的代码，发现每个子页面都有自己独立的API调用逻辑，导致代码重复和性能问题。根据API响应示例，API返回的是一个包含所有状态任务的列表，因此最佳策略是在父组件统一调用API，然后根据任务状态分发给子组件。

## 2. 实施步骤

### 2.1 创建类型定义文件

根据API响应结果，创建`src/app/types/task/getTasksListTypes.ts`类型定义文件，包含以下类型：
- 任务数据类型（Task）
- 分页信息类型（Pagination）
- API响应数据类型（GetTasksListResponseData）
- API响应类型（GetTasksListResponse）

### 2.2 修改主页面 `src/app/publisher/dashboard/page.tsx`

1. 删除页面内部的现有任务类型定义
2. 添加API调用逻辑，在页面加载时调用`/api/task/getTasksList`
3. 将API响应结果根据任务状态分发给不同的子组件
4. 引入并使用新创建的类型定义

### 2.3 修改子页面

1. 修改`src/app/publisher/dashboard/OverView/page.tsx`：删除API调用，接收父组件传递的任务列表和统计数据
2. 修改`src/app/publisher/dashboard/InProgress/page.tsx`：删除API调用，接收父组件传递的进行中任务
3. 修改`src/app/publisher/dashboard/Completed/page.tsx`：删除API调用，接收父组件传递的已完成任务
4. 修改`src/app/publisher/dashboard/AwaitingReview/page.tsx`：删除API调用，接收父组件传递的待审核任务

### 2.4 优化数据传递

1. 在主页面添加状态管理，存储API响应结果
2. 使用React的props机制将数据传递给子组件
3. 确保所有页面使用统一的类型定义

## 3. 技术实现要点

1. **API调用策略**：采用父组件统一调用API，子组件接收数据的方式，减少API调用次数
2. **类型安全**：使用TypeScript严格类型定义，确保数据传递的类型安全
3. **状态管理**：使用React useState和useEffect管理API请求状态和数据
4. **错误处理**：添加完善的API错误处理机制
5. **代码复用**：提取公共逻辑，减少代码重复

## 4. 预期效果

1. 减少API调用次数，提高页面加载性能
2. 统一代码风格和API调用方式
3. 提高代码可维护性和扩展性
4. 确保类型安全，减少运行时错误
5. 简化子页面代码，专注于数据渲染

## 5. 实施顺序

1. 创建类型定义文件
2. 修改主页面，添加API调用逻辑
3. 修改子页面，改为接收父组件传递的数据
4. 测试页面功能，确保数据正确渲染
5. 优化代码，确保符合API_REQUEST_STANDARD.md规范