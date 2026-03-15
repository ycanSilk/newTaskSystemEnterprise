# AI评论生成组件更新计划

## 项目背景
根据之前的优化，我们已经更新了 `AiCommentGenerator.tsx` 和 `MiddleCommentGenerator.tsx` 组件，添加了会话管理、批量生成、进度更新等功能。现在需要修改三个页面以使用这些新功能。

## 目标页面
1. `task-combination-top-middle/page.tsx` - 上中评评论发布页面
2. `task-combination-middle-bottom/page.tsx` - 中下评评论发布页面
3. `publish-middle-comment/page.tsx` - 中评评论发布页面

## 实现计划

### [x] 任务1：更新 `task-combination-top-middle/page.tsx`
- **Priority**: P0
- **Depends On**: 无
- **Description**: 
  - 添加会话ID生成功能
  - 在使用 AiCommentGenerator 和 MiddleCommentGenerator 组件时传递会话ID
  - 添加进度更新回调
  - 确保组件使用新的API端点
- **Success Criteria**:
  - 页面能够正常加载和使用
  - AI评论生成功能能够正常工作
  - 会话管理功能能够正常工作
- **Test Requirements**:
  - `programmatic` TR-1.1: 页面能够正常构建
  - `human-judgment` TR-1.2: AI评论生成功能能够正常使用，生成的评论多样化

### [x] 任务2：更新 `task-combination-middle-bottom/page.tsx`
- **Priority**: P0
- **Depends On**: 无
- **Description**:
  - 添加会话ID生成功能
  - 在使用 MiddleCommentGenerator 组件时传递会话ID
  - 添加进度更新回调
  - 确保组件使用新的API端点
- **Success Criteria**:
  - 页面能够正常加载和使用
  - AI评论生成功能能够正常工作
  - 会话管理功能能够正常工作
- **Test Requirements**:
  - `programmatic` TR-2.1: 页面能够正常构建
  - `human-judgment` TR-2.2: AI评论生成功能能够正常使用，生成的评论多样化

### [x] 任务3：更新 `publish-middle-comment/page.tsx`
- **Priority**: P0
- **Depends On**: 无
- **Description**:
  - 确保会话ID生成功能正确实现
  - 在使用 MiddleCommentGenerator 组件时传递会话ID
  - 添加进度更新回调
  - 确保组件使用新的API端点
- **Success Criteria**:
  - 页面能够正常加载和使用
  - AI评论生成功能能够正常工作
  - 会话管理功能能够正常工作
- **Test Requirements**:
  - `programmatic` TR-3.1: 页面能够正常构建
  - `human-judgment` TR-3.2: AI评论生成功能能够正常使用，生成的评论多样化

### [x] 任务4：测试所有页面
- **Priority**: P1
- **Depends On**: 任务1、任务2、任务3
- **Description**:
  - 测试所有三个页面的AI评论生成功能
  - 验证会话管理功能是否正常工作
  - 验证批量生成和逐条生成功能是否正常工作
  - 验证进度更新和取消功能是否正常工作
- **Success Criteria**:
  - 所有页面的AI评论生成功能都能正常工作
  - 生成的评论多样化，没有重复
  - 页面能够正常构建和运行
- **Test Requirements**:
  - `programmatic` TR-4.1: 所有页面能够正常构建
  - `human-judgment` TR-4.2: 所有页面的AI评论生成功能能够正常使用，生成的评论多样化

## 技术实现要点
1. **会话ID生成**：使用 `localStorage` 存储会话ID，确保会话的唯一性
2. **组件参数**：确保传递所有必要的参数，包括 `sessionId` 和 `onProgressUpdate`
3. **API端点**：确保组件使用新的 `/api/generate-comment` 端点
4. **错误处理**：确保错误处理逻辑正确实现
5. **用户体验**：确保进度更新和取消功能能够正常工作

## 预期效果
- 生成的评论更加多样化，避免重复
- 生成过程更加高效，支持批量处理
- 用户体验更加友好，提供了进度更新和取消功能
- 代码逻辑更加清晰，易于维护