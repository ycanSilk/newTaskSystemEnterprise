import './globals.css';
import { cn } from '@/lib/utils';
import { OptimizationProvider } from '@/components/optimization/OptimizationProvider';
import { ToastProvider, Toaster } from '@/components/ui/Toast';


// 直接使用系统字体，避免字体加载失败的问题
const interFontConfig = {};

export const metadata = {
  title: '巍峨人力',
  description: 'H5移动端优先的任务平台',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '巍峨人力',
  },
  other: {
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-touch-fullscreen': 'yes',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4A90E2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" {...interFontConfig}>
      <head>
        <link rel="apple-touch-icon" href="/images/default.png" />
        <meta name="apple-mobile-web-app-title" content="巍峨人力" />
        <meta name="application-name" content="巍峨人力" />
      </head>
      <body className={cn(
        'min-h-screen bg-gray-50 font-sans antialiased'
      )}>
        <OptimizationProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </OptimizationProvider>
      </body>
    </html>
  )
}
