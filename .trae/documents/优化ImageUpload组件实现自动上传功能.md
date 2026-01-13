### 执行计划：优化ImageUpload组件实现指定API格式的自动上传功能

**目标**：修改ImageUpload组件，使其按照指定的API格式调用远程服务器，并存储返回的URL。

#### 1. 更新API处理器实现
- **文件**：`src/api/handlers/imagesUpload/imagesUploadHandler.ts`
- **操作**：
  - 修改处理器以处理原始二进制请求体
  - 添加X-Token验证
  - 转发请求到指定的远程API `http://134.122.136.221:4667/api/upload.php`
  - 确保响应格式与示例一致

#### 2. 更新useEphemeralImageManager钩子
- **文件**：`src/hooks/useEphemeralImageManager.ts`
- **操作**：
  - 从useUserStore获取认证token
  - 添加`uploadedUrls: string[]`状态用于存储API返回的URL
  - 修改`handleImageUpload`函数：
    - 压缩图片后，使用fetch API调用本地API路由
    - 设置正确的请求头：X-Token, Content-Type等
    - 发送原始二进制文件内容
    - 处理API响应，提取并存储`data.url`
  - 更新`removeImage`和`resetImages`函数以管理URLs
  - 确保返回类型包含`uploadedUrls`

#### 3. 更新ImageUpload组件
- **文件**：`src/components/imagesUpload/ImageUpload.tsx`
- **操作**：
  - 接收并使用钩子返回的`uploadedUrls`
  - 修改`onImagesChange`回调，确保父组件能访问上传后的URLs
  - 添加上传状态提示

#### 4. 实现错误处理机制
- **文件**：相关文件
- **操作**：
  - 为API调用添加错误捕获和处理
  - 显示上传失败提示信息
  - 确保状态正确重置

#### 5. 验证实现效果
- **测试**：
  - 图片选择后自动压缩并上传
  - API调用格式符合要求
  - 返回的URL正确存储
  - 父组件可访问上传后的URLs
  - 错误情况正确处理

**预期结果**：组件实现从选择到上传的完整流程，按照指定API格式调用远程服务器，自动管理返回的URL，简化父组件使用。