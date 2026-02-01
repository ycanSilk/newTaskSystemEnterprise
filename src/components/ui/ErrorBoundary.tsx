// 全局错误边界组件
// 用于捕获子组件树中的JavaScript错误，防止整个应用崩溃
// 提供友好的错误提示和重试机制

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * 静态方法，用于在子组件抛出错误时更新状态
   * @param error 捕获到的错误
   * @returns 更新后的状态
   */
  static getDerivedStateFromError(error: Error): State {
    // 更新状态，下次渲染时显示错误界面
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * 组件方法，用于在子组件抛出错误后执行副作用
   * @param error 捕获到的错误
   * @param errorInfo 错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误日志
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // 更新状态，保存错误信息
    this.setState({
      errorInfo
    });
    
    // 可以在这里添加错误上报逻辑
    // 例如：上报到Sentry等错误监控服务
  }

  /**
   * 重试方法，用于重新渲染子组件
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * 渲染方法
   * @returns 渲染结果
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // 如果有自定义的错误提示组件，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 否则显示默认的错误提示
      return (
        <div className="error-container min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="error-content max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              出错了
            </h1>
            <p className="text-gray-700 mb-4">
              抱歉，页面发生了错误。请重试或返回首页。
            </p>
            {this.state.error && (
              <div className="error-details mb-6 text-left bg-gray-50 p-3 rounded text-sm text-gray-600">
                <h3 className="font-semibold mb-1">错误信息：</h3>
                <p>{this.state.error.message}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 如果没有错误，正常渲染子组件
    return this.props.children;
  }
}

/**
 * 函数式组件包装器，用于将函数式组件包装在错误边界中
 * @param Component 要包装的函数式组件
 * @param fallback 错误提示组件
 * @returns 包装后的组件
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  // 保持组件名称，便于调试
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;