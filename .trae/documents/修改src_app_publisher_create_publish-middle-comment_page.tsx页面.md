# 修改计划

## 1. 分析现有代码

* 研究当前页面的UI布局和样式

* 理解现有数据类型定义和API调用方法

* 分析URL参数处理逻辑

## 2. 准备工作

* 导入所需类型定义 `src/app/types/task/publishSingleTaskTypes.ts`

* 导入ImageUpload组件和PaymentPasswordModal组件

* 分析publish-top-comment页面的实现，作为参考

## 3. 修改步骤

### 3.1 保留UI布局，删除现有数据类型和API调用

* 删除页面内部的所有数据类型定义

* 删除所有API调用方法和相关代码

* 保留所有UI组件和样式

### 3.2 接收URL参数

* 确保正确接收template\_id和price参数

* 保存为组件状态

### 3.3 替换图片上传组件

* 删除现有图片上传逻辑

* 导入并使用ImageUpload组件

* 为每个评论添加一个ImageUpload组件

### 3.4 修改任务截止时间处理

* 将截止时间选择改为分钟形式存储

* 添加获取当前时间戳的变量

* 提交时计算：当前时间戳 + 任务截止时间（分钟转换为秒）

### 3.5 优化总价格计算

* 确保总价格计算为 `task_count * price`

### 3.6 处理@用户标识

* 在表单提交时，将@用户标识插入到recommend\_marks数组最后一条

* 添加at\_user字段

### 3.7 优化表单提交逻辑

* 引入PaymentPasswordModal组件

* 用户点击"立即发布任务"时，调起支付密码输入框

* 输入正确密码后，调用publishSingleTask API

* 根据API响应显示结果提示，提示要删除重复的成功提示。sussesc等

* 提示结果后，添加1秒延迟后自动跳转到src\app\publisher\create\douyin\page.tsx页面

### 3.8 确保数据正确插入recommend\_marks数组

* 每一组推荐评论+图片都插入到recommend\_marks数组

* 确保image\_url字段正确传递，调用上传图片组件请求成功后返回的url字段

## 4. 测试和验证

* 确保所有UI元素正常显示

* 测试URL参数接收

* 测试图片上传功能

* 测试表单提交逻辑

* 测试支付密码验证

* 测试API调用和响应处理

## 5. 遵循API\_REQUEST\_STANDARD.md规范

* 使用正确的API调用方式

* 处理API响应和错误

* 保持代码风格一致

## 6. 最终检查

* 确保所有要求都已满足

* 确保代码没有语法错误

* 确保UI布局和样式保持不变

* 确保功能正常运行

