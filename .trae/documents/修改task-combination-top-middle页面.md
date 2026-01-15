# 执行计划：修改task-combination-top-middle页面

## 1. 准备工作
- 阅读当前页面代码，理解现有结构和功能
- 检查类型定义文件是否存在
- 检查需要替换的组件是否存在

## 2. 类型定义创建
- 创建`src/app/types/task/publishCombineTaskTypes.ts`文件
- 定义`PublishCombineTaskRequest`接口
- 定义`PublishCombineTaskResponse`接口
- 定义`RecommendMark`接口
- 定义`FormData`接口

## 3. URL参数处理
- 确保正确获取`template_id`、`stage1Price`和`stage2Price`参数
- 验证参数类型和有效性

## 4. API调用逻辑重写
- 删除现有API调用代码
- 实现新的API调用逻辑，调用`/api/task/publishCombineTask/route.ts`
- 处理API响应结果

## 5. 截止时间处理
- 添加当前时间戳变量
- 修改截止时间选择为分钟形式
- 实现时间戳转换：当前时间+任务截止时间

## 6. 总价计算优化
- 修改总价计算公式为：`(stage1Price*stage1_count) + (stage2Price*stage2_count)`
- 确保计算结果正确

## 7. @用户标识处理
- 修改@用户逻辑，确保在提交时插入到recommend_marks数组的最后一条
- 格式为：`{"comment": "上评2", "image_url": "", "at_user": "用户名"}`

## 8. recommend_marks数组处理
- 确保每一组推荐评论+图片都插入到recommend_marks数组
- recommend_marks[0]为上评评论
- 后续为中评评论

## 9. 支付密码组件集成
- 确保`PaymentPasswordModal`组件正确导入
- 实现点击发布按钮显示支付密码弹窗
- 验证密码后调用API
- 根据API结果显示提示

## 10. 中评评论数量处理
- 确保中评评论数量增加时只增加中评数量
- 提交时按顺序插入到recommend_marks数组

## 11. 替换上传图片组件
- 删除现有上传图片逻辑
- 导入`src/components/imagesUpload/ImageUpload.tsx`组件
- 为每一组评论添加一个图片上传组件

## 12. 测试和验证
- 确保所有功能正常工作
- 验证API调用格式正确
- 验证时间戳转换正确
- 验证总价计算正确
- 验证@用户处理正确
- 验证支付密码流程正确
- 验证图片上传功能正常

## 13. 代码清理
- 删除不需要的代码
- 优化代码结构
- 确保代码符合规范

## 14. 最终检查
- 确保所有要求都已满足
- 确保UI布局和样式保留
- 确保没有多余修改

这个计划将严格按照用户的要求进行，确保所有功能都能正确实现。