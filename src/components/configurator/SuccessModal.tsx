'use client';

import { useEffect } from 'react';

interface SuccessModalProps {
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  onClose: () => void;
}

export default function SuccessModal({ orderNumber, customerName, totalPrice, onClose }: SuccessModalProps) {
  // 按下 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 点击外部不关闭，必须点击关闭按钮
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 成功图标 */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          提交成功！
        </h2>

        {/* 主要信息 */}
        <p className="text-gray-600 mb-6">
          <span className="font-medium">{customerName}</span>，您的定制方案已成功记录
        </p>

        {/* 订单详情卡片 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">订单号</span>
            <span className="text-sm font-medium text-gray-900">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">方案金额</span>
            <span className="text-sm font-medium text-gray-900">¥{totalPrice.toLocaleString()}/年</span>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-left">
              <p className="text-sm text-blue-900 font-medium mb-1">客服联系方式</p>
              <p className="text-sm text-blue-800">
                客服将在24小时内与您联系，详细沟通方案细节。
              </p>
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          我知道了
        </button>

        {/* 底部说明 */}
        <p className="mt-4 text-xs text-gray-500">
          如有疑问，请直接联系客服
        </p>
      </div>
    </div>
  );
}
