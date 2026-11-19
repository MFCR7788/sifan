'use client';

import LunaiShell from '@/components/lunai/LunaiShell';
import { LunaiHero, LunaiSection } from '@/components/lunai/Blocks';
import AppCenter from '@/components/apps/AppCenter';
import { APP_MODULES } from '@/lib/apps/registry';

/**
 * 应用中心 —— 公司应用层统一入口
 *
 * 所有模块由 registry 统一登记，新增模块自动上架（搭积木）。
 */
export default function AppsPage() {
  const liveCount = APP_MODULES.filter((m) => m.status === 'live').length;

  return (
    <LunaiShell>
      <LunaiHero
        eyebrow="App Center"
        title={
          <>
            应用中心
            
            <span className="mt-2.5 block text-[0.38em] font-normal tracking-[0.05em] text-mist/45">
              公司系统模块统一入口
            </span>
          </>
        }
        description={`已上架 ${liveCount} 个应用模块。每个模块独立部署、独立迭代，像积木一样按需组合——今天接一个工具，明天加一块业务能力，无需重构。`}
      />

      <LunaiSection tone="ink2">
        <AppCenter />
      </LunaiSection>
    </LunaiShell>
  );
}
