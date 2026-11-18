'use client';

import LunaiNav from '@/components/lunai/LunaiNav';
import LunaiFooter from '@/components/lunai/LunaiFooter';
import Hero from '@/components/lunai/Hero';
import StatsBar from '@/components/lunai/StatsBar';
import DualTrack from '@/components/lunai/DualTrack';
import Timeline from '@/components/lunai/Timeline';
import SixModules from '@/components/lunai/SixModules';
import StoreModel from '@/components/lunai/StoreModel';
import SupplyChain from '@/components/lunai/SupplyChain';
import Partnership from '@/components/lunai/Partnership';
import ThreeYear from '@/components/lunai/ThreeYear';

/**
 * 路耐 LUNAI 公司官网首页
 * 内容来源：《浙江思杋服饰有限公司 · 运营模式及公司简介 V2.1》（2026 年 11 月）
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-snow">
      <LunaiNav />

      <main>
        <Hero />
        <StatsBar />
        <DualTrack />
        <Timeline />
        <SixModules />
        <StoreModel />
        <SupplyChain />
        <Partnership />
        <ThreeYear />
      </main>

      <LunaiFooter />
    </div>
  );
}
