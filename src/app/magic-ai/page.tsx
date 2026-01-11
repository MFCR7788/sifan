'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MagicAIPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面内容区域 */}
        <div className="py-24">
          {/* 这里可以添加你的页面内容 */}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
