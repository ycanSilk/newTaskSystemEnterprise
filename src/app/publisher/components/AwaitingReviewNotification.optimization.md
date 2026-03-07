# AwaitingReviewNotification 组件优化方案

## 需求分析

**核心需求**：
1. 全局检测：在项目的任何页面都能自动检测待审核任务
2. 实时提示：当检测到有待审核任务时，显示提示并播放提示音
3. 固定位置：提示固定在头部，位于 layout.tsx 的 main 区域内
4. 轮询机制：每间隔30秒检测一次，一直循环
5. 提示音循环：只要待审核任务数量 > 0，就每60秒循环播放提示音

## 当前代码分析

### 1. 组件结构
- **AwaitingReviewNotification.tsx**：负责检测待审核任务并显示提示
- **layout.tsx**：全局布局，导入并使用 AwaitingReviewNotification 组件
- **pendingTasksListHandler.ts**：处理待审核任务列表的 API 请求

### 2. 当前问题
1. **提示位置**：提示框当前是固定定位在顶部，但位置可能需要调整
2. **提示音间隔**：当前提示音循环间隔是30秒，需要改为60秒
3. **全局覆盖**：需要确保在所有页面都能检测到待审核任务
4. **缓存问题**：需要确保每次检测都能获取最新数据

## 优化方案

### 1. 组件位置优化
- 将 AwaitingReviewNotification 组件放在 layout.tsx 的 main 区域内，确保在所有页面都能显示
- 调整提示框的样式，使其固定在头部，不影响其他内容

### 2. 轮询机制优化
- 保持每30秒检测一次的频率
- 确保页面可见性变化时能重新检测
- 避免重复请求，确保检测的稳定性

### 3. 提示音优化
- 将提示音循环间隔从30秒改为60秒
- 确保只有在有待审核任务时才循环播放提示音
- 当待审核任务数量为0时，停止播放提示音

### 4. 缓存优化
- 在 API 请求中添加缓存控制头，确保每次都获取最新数据
- 禁用全局缓存，确保检测的实时性

### 5. 日志优化
- 保持详细的日志输出，便于调试和问题定位

## 具体实现

### 1. layout.tsx 优化
```tsx
// 在 main 区域内添加 AwaitingReviewNotification 组件
<main className="flex-1 pt-[60px] pb-20">
  <AwaitingReviewNotification />
  <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
    {children}
  </Suspense>
</main>
```

### 2. AwaitingReviewNotification.tsx 优化

#### 配置参数调整
```tsx
// 配置参数
const config = {
  pollingInterval: 30000, // 固定30秒检测间隔
  soundInterval: 60000, // 固定60秒提示音间隔
  throttleTime: 5000, // 节流时间
};
```

#### 提示音循环调整
```tsx
// 设置定时循环播放提示音，每间隔60秒
if (!soundIntervalRef.current) {
  console.log('[AwaitingReviewNotification] 启动提示音循环播放');
  soundIntervalRef.current = setInterval(() => {
    console.log('[AwaitingReviewNotification] 循环播放提示音');
    playNotificationSound();
  }, config.soundInterval); // 60秒
}
```

#### 缓存控制优化
```tsx
// 使用全局fetch包装器，禁用缓存，确保每次都获取最新数据
const data: PendingTasksListResponse = await globalFetch('/api/task/pendingTasksList', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}, {
  // 禁用缓存，确保每次都从服务器获取最新数据
  enableCache: false,
  // 启用自动重试
  enableRetry: true,
  retryCount: 3,
  retryDelay: 1000
});
```

#### 提示框样式优化
```tsx
{/* 新的待审核任务提示 */}
{hasNewAwaitingReviewTasks && (
  <div className="fixed top-[70px] left-0 right-0 mx-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md shadow-sm flex items-center justify-between z-50">
    <div className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-yellow-700 font-medium">有新的待审核任务 ({awaitingReviewCount})</span>
    </div>
    <button
      onClick={handleViewAwaitingReview}
      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
    >
      查看
    </button>
  </div>
)}
```

### 3. 轮询机制优化

#### 初始化和设置轮询
```tsx
// 初始化和设置轮询
useEffect(() => {
  // 重置刷新标志
  isRefreshingRef.current = false;
  
  // 初始获取待审核任务数量
  console.log('[AwaitingReviewNotification] 组件初始化，开始首次检测');
  fetchAwaitingReviewCount();

  // 监听页面可见性变化
  const handleVisibilityChange = () => {
    const visible = document.visibilityState === 'visible';
    setIsPageVisible(visible);
    
    // 当页面重新可见时，立即检测一次
    if (visible) {
      console.log('[AwaitingReviewNotification] 页面重新可见，触发检测');
      fetchAwaitingReviewCount();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 设置轮询
  const startPolling = () => {
    // 清除现有的定时器
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // 固定30秒检测间隔
    console.log('[AwaitingReviewNotification] 启动轮询，间隔30秒');
    pollingIntervalRef.current = setInterval(() => {
      console.log('[AwaitingReviewNotification] 轮询触发检测');
      fetchAwaitingReviewCount();
    }, config.pollingInterval);
  };

  // 启动初始轮询
  startPolling();

  // 清理函数
  return () => {
    console.log('[AwaitingReviewNotification] 组件卸载，清理资源');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

## 验证方法

1. **启动项目**：运行 `npm run dev` 启动开发服务器
2. **访问任意页面**：在浏览器中访问项目的任意页面
3. **查看控制台日志**：检查控制台是否有检测待审核任务的日志输出
4. **模拟待审核任务**：确保 API 返回有待审核任务的结果
5. **验证提示**：检查是否显示黄色提示框，提示"有新的待审核任务"
6. **验证提示音**：检查是否播放提示音，并且每60秒循环播放
7. **验证轮询**：检查是否每30秒检测一次待审核任务

## 预期效果

1. **全局检测**：在项目的任何页面都能检测到待审核任务
2. **实时提示**：当检测到有待审核任务时，立即显示提示并播放提示音
3. **固定位置**：提示固定在头部，不影响其他内容
4. **稳定轮询**：每30秒检测一次，一直循环
5. **提示音循环**：只要有待审核任务，每60秒循环播放提示音
6. **无缓存**：每次检测都能获取最新数据
7. **详细日志**：控制台输出详细的日志，便于调试和问题定位

## 代码优化建议

1. **错误处理优化**：增加更详细的错误处理，确保组件在网络错误时仍能正常工作
2. **性能优化**：考虑在页面不可见时降低轮询频率，减少不必要的请求
3. **用户体验优化**：添加关闭提示的功能，允许用户暂时关闭提示
4. **可配置性**：将轮询间隔、提示音间隔等参数改为可配置的，便于后续调整

## 总结

通过以上优化方案，AwaitingReviewNotification 组件将能够在项目的任何页面都能检测待审核任务，并在有任务时显示提示和播放提示音，满足用户的需求。