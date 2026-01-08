'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ConfiguratorStep1 from '@/components/configurator/ConfiguratorStep1';
import ConfiguratorStep2 from '@/components/configurator/ConfiguratorStep2';
import ConfiguratorStep3 from '@/components/configurator/ConfiguratorStep3';
import SummaryPanel from '@/components/configurator/SummaryPanel';

interface ConfigState {
  step: number;
  platform: string;
  serviceLevel: string;
  addons: string[];
  totalPrice: number;
}

export default function ConfiguratorPage() {
  const [config, setConfig] = useState<ConfigState>({
    step: 1,
    platform: '',
    serviceLevel: '',
    addons: [],
    totalPrice: 0
  });

  const updateConfig = (updates: Partial<ConfigState>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (config.step < 3) {
      setConfig(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (config.step > 1) {
      setConfig(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
            定制您的专属方案
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            基于您的业务需求，量身定制数字化转型方案
          </p>
          <Link
            href="/solution"
            className="inline-block px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            了解定制方案的详细信息
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="flex-1 flex items-center"
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300
                    ${config.step >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`
                      flex-1 h-1 mx-4 rounded-full transition-all duration-300
                      ${config.step > step ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm">
            <span className={config.step >= 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              业务场景
            </span>
            <span className={config.step >= 2 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              核心功能
            </span>
            <span className={config.step >= 3 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              增值服务
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configurator Steps */}
          <div className="lg:col-span-2">
            {config.step === 1 && (
              <ConfiguratorStep1
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
              />
            )}
            {config.step === 2 && (
              <ConfiguratorStep2
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {config.step === 3 && (
              <ConfiguratorStep3
                config={config}
                updateConfig={updateConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <SummaryPanel
                config={config}
                onStepChange={(step) => setConfig(prev => ({ ...prev, step }))}
                onNext={nextStep}
                onPrev={prevStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
