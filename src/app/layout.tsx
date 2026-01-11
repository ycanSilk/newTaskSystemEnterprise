import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers/Providers';

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
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="派单系统" />
        <meta name="application-name" content="派单系统" />
      </head>
      <body className={cn(
        'min-h-screen bg-gray-50 font-sans antialiased'
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}