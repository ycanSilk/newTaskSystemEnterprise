'use client';

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export default function AgreementModal({ isOpen, onClose, title, content }: AgreementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="prose max-w-none">
            {content}
          </div>
          <div className="mt-6 flex justify-center">
            <button 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-200 transition-all active:scale-95"
              onClick={onClose}
            >
              我已知晓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
