import './globals.css';
import { cn } from '@/lib/utils';
import { OptimizationProvider } from '@/components/optimization/OptimizationProvider';
import { ToastProvider, Toaster } from '@/components/ui/Toast';

// 尝试使用next/font导入Inter字体，如果失败则使用系统字体
let interFontConfig = {};
let interVariable = '--font-inter';

try {
  const { Inter } = require('next/font/google');
  const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  });
  interFontConfig = { className: inter.variable };
} catch (error) {
  console.warn('Failed to load Inter font from Google Fonts, using system fonts as fallback');
}

export const metadata = {
  title: '抖音评论派单系统',
  description: 'H5移动端优先的评论任务平台',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '派单系统',
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
        <meta name="apple-mobile-web-app-title" content="派单系统" />
        <meta name="application-name" content="派单系统" />
      </head>
      <body className={cn(
        'min-h-screen bg-gray-50 font-sans antialiased',
        'font-[var(--font-inter),sans-serif]'
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
