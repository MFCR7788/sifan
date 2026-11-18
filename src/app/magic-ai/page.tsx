'use client';

import LunaiNav from '@/components/lunai/LunaiNav';
import LunaiFooter from '@/components/lunai/LunaiFooter';

export default function MagicAIPage() {
  return (
    <div className="min-h-screen bg-ink text-snow">
      <LunaiNav />

      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面内容区域 */}
        <div className="py-24">
          {/* 这里可以添加你的页面内容 */}
        </div>
      </div>

      {/* Footer */}
      <LunaiFooter />
    </div>
  );
}
