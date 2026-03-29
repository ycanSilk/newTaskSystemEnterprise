'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TaskAssistanceProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TaskAssistance({ isOpen = true, onClose }: TaskAssistanceProps) {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoPreviewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 图片路径映射
  const imgPaths = [
    '/images/qa1.jpg',
    
  ];

  // 处理图片点击预览
  const handleImageClick = (index: number) => {
    setPreviewImage(imgPaths[index - 1]);
    setShowPreview(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // 点击背景关闭预览
  const handlePreviewBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === previewRef.current) {
      setShowPreview(false);
    }
  };

  // 关闭视频预览
  const handleCloseVideoPreview = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoPreview(false);
  };

  // 点击背景关闭视频预览
  const handleVideoPreviewBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === videoPreviewRef.current) {
      setShowVideoPreview(false);
    }
  };

  // 点击背景关闭模态框
  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current && onClose) {
      onClose();
    }
  };

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) {
          setShowPreview(false);
        } else if (showVideoPreview) {
          setShowVideoPreview(false);
        } else if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview, showVideoPreview, onClose]);

  // 视频预览模态框打开后自动播放视频
  useEffect(() => {
    if (showVideoPreview && videoRef.current) {
      const timer = setTimeout(() => {
        // 检查视频是否已经加载完成
        if (videoRef.current) {
          if (videoRef.current.readyState >= 1) {
            videoRef.current.play().catch(err => {
              console.error('自动播放失败:', err);
            });
          } else {
            // 如果视频还未加载完成，监听loadedmetadata事件
            const handleLoadedMetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().catch(err => {
                  console.error('自动播放失败:', err);
                });
              }
            };

            videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            return () => {
              if (videoRef.current) {
                videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
              }
            };
          }
        }
      }, 2000); // 2秒延时

      return () => clearTimeout(timer);
    }
  }, [showVideoPreview]);

  if (!isOpen) return null;

  return (
    <>
      {/* 主模态框 */}
      <div 
        ref={modalRef}
        className="fixed top-0 left-0 w-full h-full bg-blue-100/70 backdrop-blur-md flex items-center justify-center p-2 z-50"
      >
        <div className="bg-white/85 backdrop-blur-md w-full max-w-[860px] h-[500px] rounded-lg shadow-lg px-2 py-5 border border-white/70 text-slate-800 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-blue-200">
            <h2 className="font-semibold text-2xl tracking-tight bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">审核任务演示</h2>
          </div>
            {/* 任务做单方法 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">   
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md relative"
                    onClick={() => setShowVideoPreview(true)}
                  >
                    <img src="/images/douyin-logo.png" alt="视频演示" className="w-full h-full object-cover bg-blue-100" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                  </div>
                </div>      
              </div>
            </div>
                {/* 底部关闭按钮 */}
          <div className="mt-4 pt-4 border-t flex justify-center border-blue-200">
            <button 
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              我已全部了解
            </button>
          </div>
          </div>
          
      
        </div>


      {/* 图片预览模态框 */}
      {showPreview && (
        <div 
          ref={previewRef}
          className="fixed top-0 left-0 w-full h-full bg-blue-100/80 backdrop-blur-md flex items-center justify-center z-50 p-2"
          onClick={handlePreviewBackgroundClick}
        >
          <div className="max-w-[800px] max-h-[85vh] bg-white/70 backdrop-blur-md rounded-md p-1 shadow-lg border border-white/70 relative">
            <button 
              className="absolute top-2 right-4 bg-white/80 border-none text-2xl w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-blue-700 backdrop-blur-sm border border-white"
              onClick={handleClosePreview}
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="预览大图" 
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg bg-blue-50"
            />
          </div>
        </div>
      )}

      {/* 视频预览模态框 */}
      {showVideoPreview && (
        <div 
          ref={videoPreviewRef}
          className="fixed top-0 left-0 w-full h-full bg-blue-100/80 backdrop-blur-md flex items-center justify-center z-50 p-2"
          onClick={handleVideoPreviewBackgroundClick}
        >
          <div className="max-w-[800px] max-h-[85vh] bg-white/70 backdrop-blur-md rounded-md p-1 shadow-lg border border-white/70 relative">
            <button 
              className="absolute top-2 right-4 bg-white/80 border-none text-2xl w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-blue-700 backdrop-blur-sm border border-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseVideoPreview();
              }}
            >
              ✕
            </button>
            <video 
              ref={videoRef}
              src="/videos/review.mp4" 
              controls 
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg bg-blue-50"
            />
          </div>
        </div>
      )}
    </>
  );
}
