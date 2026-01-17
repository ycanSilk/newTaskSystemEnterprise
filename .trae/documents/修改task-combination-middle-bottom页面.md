# 执行计划：修改task-combination-middle-bottom页面

## 1. 准备工作

* 阅读当前页面代码，理解现有结构和功能

* 分析API\_REQUEST\_STANDARD.md，确保API调用符合规范

* 了解publishCombineTask API的实现

## 2. 类型定义文件创建

* 创建新的类型定义文件 `src/app/types/task/middelBottomTaskTypes.ts`

* 定义适合中下评评论结构的类型

* 包括表单数据、评论数据、API请求和响应类型

## 3. URL参数处理

* 确保正确获取template\_id、stage1Price和stage2Price参数

* 验证参数类型和有效性

## 4. API调用逻辑重写

* 删除旧的API调用代码

* 实现新的API调用逻辑，调用publishCombineTask API

* 处理API响应结果，显示相应的提示信息

## 5. 截止时间处理

* 修改截止时间选择为分钟形式

* 添加当前时间戳变量

* 计算截止时间：当前时间+任务截止时间（分钟）

* 将结果提交到API的deadline字段

## 6. 总价计算优化

* 实现正确的总价计算公式：(stage1Price*stage1\_count) + (stage2Price*stage2\_count)

* 确保stage1\_count固定为1（中评固定1条）

* stage2\_count为下评数量

## 7. @用户标记处理

* 确保@用户标记插入到recommend\_marks数组的最后一条评论中

* 添加at\_user字段到最后一条评论

## 8. recommend\_marks数组构建

* 确保每一组评论+图片都插入到recommend\_marks数组

* recommend\_marks\[0]必须是中评评论信息

* 后续为下评评论信息

## 9. 支付密码组件集成

* 导入PaymentPasswordModal组件

* 实现点击发布按钮显示支付密码弹窗

* 验证密码后调用API

* 关闭弹窗并显示API响应结果

* 确保密码正确保存到请求体的pswd字段

## 10. 图片上传组件替换

* 替换现有上传图片组件为ImageUpload组件

* 为中评和下评评论分别添加图片上传组件

* 确保上传的图片URL正确保存到表单数据

## 11. 中评评论数量处理

* 确保中评评论数量增加时只增加下评数量

* 提交表单时按顺序插入到recommend\_marks数组

## 12. 代码清理

* 删除不需要的代码

* 优化代码结构

* 确保类型安全

## 13. 测试和验证

* 确保所有功能正常工作

* 验证API调用格式正确

* 验证时间戳转换正确

* 验证总价计算正确

* 验证@用户处理正确

* 验证支付密码流程正确

* 验证图片上传功能正常

## 技术实现细节

* 使用React Hooks管理状态

* 遵循TypeScript类型安全

* 组件化开发，提高代码可复用性

* API调用遵循RESTful规范

* 支付密码使用安全传输

* 图片上传组件支持预览和删除

* 不做要求以外的功能任何代码修改

## 预期结果

* 页面UI布局和样式保持不变

* 所有功能按要求实现

* 代码质量良好，类型安全

* 项目可以正常运行

* API调用符合规范

这个计划将严格按照用户的要求进行，确保所有功能都能正确实现。
