'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TaskAssistanceProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TaskAssistance({ isOpen = true, onClose }: TaskAssistanceProps) {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 图片路径映射
  const imgPaths = [
    '/images/qa1.jpg',
    '/images/qa2.png',
    '/images/qa3.jpg',
    '/images/qa4.png',
    '/images/qa5.jpg',
    '/images/qa6.jpg'
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

  // 点击背景关闭模态框
  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current && onClose) {
      onClose();
    }
  };

  // 直接开始倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) {
          setShowPreview(false);
        } else if (onClose && canClose && hasReadTerms) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview, onClose, canClose, hasReadTerms]);

  if (!isOpen) return null;

  return (
    <>
      {/* 主模态框 */}
      <div 
        ref={modalRef}
        className="fixed top-0 left-0 w-full h-full bg-blue-100/70 backdrop-blur-md flex items-center justify-center p-2 z-50"
      >
        <div className="bg-white/85 backdrop-blur-md w-full max-w-[860px] max-h-[85vh] rounded-lg shadow-lg px-2 py-5 border border-white/70 text-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-2 pb-2 border-b-2 border-blue-200">
            <h2 className="font-semibold text-2xl tracking-tight bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">📘 任务手册</h2>
          </div>

          <div 
            ref={contentRef}
            className="space-y-3 flex-grow overflow-y-auto"
          >
            {/* 1. 如何复制口令？ */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                如何复制口令？
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <p>长按口令选择复制即可。</p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(1)}
                  >
                    <img src={imgPaths[0]} alt="复制口令示意" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 无法复制交单口令，虚影处理 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                无法复制交单口令，出现虚影如何处理？
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <p>文案审核中0-3分钟无法复制则放弃本单（留意是否满8条评论/换号）。</p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(2)}
                  >
                    <img src={imgPaths[1]} alt="虚影示意" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>

                <div className="my-4 bg-blue-50 p-3 rounded-md">
                  <span className="font-semibold">1 、(上评任务窗口)</span> 上评如何快速找到并复制口令？<br />
                  发布上评后0-3分钟审核，退出抖音再返回该视频翻0-10页查找评论，便可复制口令。
                </div>

                <div className="my-2.5 bg-blue-50 p-3 rounded-md">
                  <span className="font-semibold">2、 (中评)</span> 中评如何快速找到并复制口令？<br />
                  通过接单任务的口令进入便可快速找到。
                </div>

                <div className="my-2.5 bg-blue-50 p-3 rounded-md">
                  <span className="font-semibold">3、 (下评)</span> 下评如何快速找到并复制口令？<br />
                  通过接单任务的口令进入便可快速找到。
                </div>
              </div>
            </div>

            {/* 3. 无法复制交单口令的问题分析 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                无法复制交单口令的是什么问题？
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <p>1、 可能文案问题，更换文案。</p>
                <p>2、 换文案后仍不行，试试发评论“我爱你”能否复制口令。若不行则账号问题，养号3天，或换号。</p>
              </div>
            </div>

            {/* 4. 如何养号 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                如何养号？
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                养号期间每天花1小时正常的刷视频，点赞，看直播，发布视频。
              </div>
            </div>

            {/* 4. 如何养号 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                为了避免封号可能，请仔细阅读并遵守以下的事项：
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <p><br/>              
                  1. 交单后留意审核，不通过的及时删除评论<br/>
                  2. 同一个抖音号隔开几分钟再单<br/>
                  3. 看到任务评论有人做@就放弃此单<br/>
                  4. 掉@掉评论 不能强做，放弃此单<br/>
                  5. 1个号不要超过（8条）评论<br/>
                  6. 特殊情况还是会有，尝试解封<br/>
                  7. 新号要正常使用养3-5天再接单<br/>
                  8. 平时不要给非任务的视频点赞和评论相关，会影响号和接单数量<br/>
                  9. 被封号后解封，最少养号3-5天再进行接单<br/>
                  10. 我们的文案不能有引导性的目的。不能乱发文案<br/>
                  11. 我们自己下载了旧版抖音，就可以马上复制口令，如若复制不了，马上删掉，更改文案，再次如此马上休息养号。<br/>
                  12. 多号时WiFi和数据换着用。
                </p>
              </div>
            </div>

            {/* 任务做单方法 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                任务做单方法
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <p><strong>1、带@用户任务单做法：</strong> </p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(3)}
                  >
                    <img src={imgPaths[2]} alt="@用户" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>
                <p><strong>2、上评单做法：</strong></p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(4)}
                  >
                    <img src={imgPaths[3]} alt="上评单" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>
                <p><strong>3、中评单做法：</strong> </p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(5)}
                  >
                    <img src={imgPaths[4]} alt="中评单" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>
                <p><strong>4、下评单做法：</strong> </p>
                <div className="flex flex-wrap gap-3.5 mt-3.5 mb-2">
                  <div 
                    className="w-36 h-36 bg-blue-50 rounded-md overflow-hidden shadow-sm border-2 border-white transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => handleImageClick(6)}
                  >
                    <img src={imgPaths[5]} alt="下评单" className="w-full h-full object-cover bg-blue-100" />
                  </div>
                </div>
              </div>
            </div>

            {/* 接单禁止事项 */}
            <div className="rounded-lg bg-white/40 p-2 backdrop-blur-sm shadow-sm border border-white/80">
              <div className="font-semibold text-lg mb-2 text-blue-800 flex items-center gap-2">
                <span className="bg-blue-500 text-white text-sm font-semibold w-6 h-6 rounded-md flex items-center justify-center shadow-blue-200">Q</span>
                接单禁止事项 ⚠️
              </div>
              <div className="text-blue-900 leading-relaxed pl-8 relative">
                <span className="absolute left-1.5 top-0 text-blue-500 font-semibold text-sm opacity-80">A</span>
                <span className="inline-block bg-amber-100 rounded-md px-3 py-1 text-amber-800 text-sm mr-1 mt-1">上评接单禁止</span>
                <p>1.作者有删除评论习惯的视频</p>
                <p>2.违反平台的：引导词，极限词，赌博以及其他限制词 </p>
                <p>3.违法言论</p>
                <span className="inline-block bg-amber-100 rounded-md px-3 py-1 text-amber-800 text-sm mr-1 mt-1">中评接单禁止</span>
                <p>1.违反平台的：引导词，极限词，赌博以及其他限制词 </p>
                <p>2.违法言论</p>
                <p>3.上评没有本@名字的“上评名字或词汇”</p>
                <span className="inline-block bg-amber-100 rounded-md px-3 py-1 text-amber-800 text-sm mr-1 mt-1">上中评接单禁止</span> 
                <p>1.平台限制词不可发送</p>
                <span className="inline-block bg-amber-100 rounded-md px-3 py-1 text-amber-800 text-sm mr-1 mt-1">中下评接单禁止</span>
                <p>1.违反平台的：引导词，极限词，赌博以及其他限制词 </p>
                <p>2.违法言论</p>
                <p>3.评论已有人做“广告@”</p>
                <p>4.发布上评的点开头像发现没有作品，没什么关注或者粉丝的假人号和新号</p>
                <p>5.上评发布低于15分钟</p>
                <div className="mt-4 bg-blue-100 rounded-md p-3 border-l-4 border-blue-500">
                  🚫 如发现触犯禁止派单类，严重者将受派单限制。
                </div>
              </div>
            </div>

           

            {/* 小提示 */}
            <div className="bg-blue-50 rounded-md p-2 mt-2">
              <p className="text-sm">💬 文案审核中0-3分钟未通过则复制失败放弃；换文案或发“我爱你”测试账号；养号3天。<br />
              上评查找翻0-10页；中/下评直接通过任务口令进入。</p>
            </div>
            <div className="flex items-center mb-4">
              <input 
                type="checkbox" 
                id="readTerms" 
                checked={hasReadTerms} 
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="readTerms" className="text-sm text-blue-800">我已阅读并理解上述任务手册内容</label>
            </div>
          </div>
          
          {/* 底部协议阅读和关闭按钮 */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            
            
            <button 
              onClick={() => {
                if (canClose && hasReadTerms && onClose) {
                  onClose();
                }
              }}
              disabled={!canClose || !hasReadTerms}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${canClose && hasReadTerms ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {!canClose ? `请等待 ${countdown} 秒后点击` : 
               !hasReadTerms ? '请勾选阅读协议' : '我已全部了解'}
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
    </>
  );
}
