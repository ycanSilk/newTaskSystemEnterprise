'use client';
import { useState, useRef } from 'react';
import { CustomerServiceOutlined } from '@ant-design/icons';



interface CustomerServiceButtonProps {
  // 可以根据需要添加更多props，使组件更灵活
  className?: string;
  buttonText?: string;
  modalTitle?: string;
  CustomerServiceId?: string;
  chatUrl?: string;
  size?: number;
}

export const CustomerServiceButton: React.FC<CustomerServiceButtonProps> = ({
  className = '',
  buttonText = '客服',
  modalTitle = '联系客服',
  CustomerServiceId = 'admin',
  chatUrl = 'http://localhost:8081/chatIndex?kefu_id=admin',
  size = 32
}) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 打开客服聊天模态框
  const openChatModal = () => {
    setIsChatModalOpen(true);
  };

  // 关闭客服聊天模态框
  const closeChatModal = () => {
    setIsChatModalOpen(false);
  };

  // 构建完整的聊天URL
  const fullChatUrl = `http://localhost:8081/chatIndex?kefu_id=${CustomerServiceId}`;

  return (
    <>
      {/* 客服按钮 */}
      <button 
        onClick={openChatModal} 
        className={`flex items-center justify-center transition-colors ${className}`}
      >
        <CustomerServiceOutlined style={{ fontSize: `${size}px` }} />
      </button>
      
      {/* 客服聊天模态框 */}
      {isChatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <button 
                onClick={closeChatModal} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="关闭"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {/* 使用iframe直接加载聊天页面 */}
              <iframe
                ref={iframeRef}
                src={fullChatUrl}
                className="w-full h-full border-0"
                title="客服聊天窗口"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  // 使用iframe直接加载聊天页面，不再需要useEffect动态加载脚本
};