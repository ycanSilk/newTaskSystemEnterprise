'use client';

import Image from 'next/image';

export default function DouyinVersionPage() {
  // 软件信息
  const softwareInfo = {
    android: {
      downloadUrl: '/software/Android_douyinV28.apk'
    },
    ios: {
      downloadUrl: '/software/iPhone_douyinV29.ipa'
    }
  };

  // 处理下载
  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full text-center">
        {/* 主要内容区域 - 白色卡片 */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          {/* 抖音Logo区域 */}
            <div className="flex items-center justify-center w-full mb-8">
              <Image src="/images/douyin-logo.png" alt="抖音Logo" width={120} height={40} className="mx-auto" />
            </div>

          {/* 平台选择按钮 */}
          <div className="flex justify-center items-center space-x-16 mb-6">
            {/* iOS 按钮 */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleDownload(softwareInfo.ios.downloadUrl)}
                className="p-2 bg-transparent border-none focus:outline-none"
              >
                <Image 
                  src="/images/iPhone.png" 
                  alt="iOS Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain" 
                />
              </button>
              <span className="text-gray-700 font-medium mt-2">iOS</span>
            </div>

            {/* Android 按钮 */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleDownload(softwareInfo.android.downloadUrl)}
                className="p-2 bg-transparent border-none focus:outline-none"
              >
                <Image 
                  src="/images/Android.png" 
                  alt="Android Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain" 
                />
              </button>
              <span className="text-gray-700 font-medium mt-2">Android</span>
            </div>
          </div>

          {/* 普通大小下载按钮 */}
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => handleDownload(softwareInfo.ios.downloadUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              iOS 下载
            </button>
            <button
              onClick={() => handleDownload(softwareInfo.android.downloadUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Android 下载
            </button>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 text-center text-white text-sm">
          © {new Date().getFullYear()} 抖音版本下载
        </div>
      </div>
    </div>
  );
}
