'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LazyImage from '@/components/LazyImage';

const isoCertificates = [
  {
    src: '/images/iso-quality.png',
    alt: '质量管理体系认证证书',
    title: '质量管理体系认证证书'
  },
  {
    src: '/images/iso-environment.png',
    alt: '环境管理体系认证证书',
    title: '环境管理体系认证证书'
  },
  {
    src: '/images/iso-ohs.png',
    alt: '职业健康安全管理体系认证证书',
    title: '职业健康安全管理体系认证证书'
  },
];

// 所有资质图片（用于预览）
const qualificationImages = [
  { src: '/images/business-license.jpg', alt: '营业执照', title: '营业执照' },
  { src: '/images/franchise-license.jpg', alt: '特许经营许可证', title: '特许经营许可证' },
  { src: '/images/national-high-tech-certificate.png', alt: '国家高新企业证书', title: '国家高新企业证书' },
  { src: '/images/technology-sme.png', alt: '科技型中小企业', title: '科技型中小企业' },
  { src: '/images/iso-quality.png', alt: '质量管理体系认证证书', title: '质量管理体系认证证书' },
  { src: '/images/iso-environment.png', alt: '环境管理体系认证证书', title: '环境管理体系认证证书' },
  { src: '/images/iso-ohs.png', alt: '职业健康安全管理体系认证证书', title: '职业健康安全管理体系认证证书' },
  { src: '/images/value-added-telecom-license.jpg', alt: '增值电信业务经营许可证', title: '增值电信业务经营许可证' },
];

export default function QualificationsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % isoCertificates.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % isoCertificates.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + isoCertificates.length) % isoCertificates.length);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            公司资质
          </h1>
          <p className="text-xl text-gray-600 mt-6">
            浙江思杋服饰有限公司
          </p>
        </div>
      </section>

      {/* Qualifications Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            资质证书
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            我们拥有完善的资质认证，为您提供可靠的服务保障
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 资质卡片 1 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(qualificationImages[0])}
            >
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 relative">
                <LazyImage
                  src="/images/business-license.jpg"
                  alt="营业执照"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">营业执照</h3>
                <p className="text-sm text-gray-600 mt-2">合法经营资质</p>
              </div>
            </div>

            {/* 资质卡片 2 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(qualificationImages[1])}
            >
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 relative">
                <LazyImage
                  src="/images/franchise-license.jpg"
                  alt="特许经营许可证"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">特许经营许可证</h3>
                <p className="text-sm text-gray-600 mt-2">特许经营资质</p>
              </div>
            </div>

            {/* 资质卡片 3 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(qualificationImages[2])}
            >
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 relative">
                <LazyImage
                  src="/images/national-high-tech-certificate.png"
                  alt="国家高新企业证书"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">国家高新企业证书</h3>
                <p className="text-sm text-gray-600 mt-2">国家高新技术企业认证</p>
              </div>
            </div>

            {/* 资质卡片 4 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(qualificationImages[3])}
            >
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 relative">
                <LazyImage
                  src="/images/technology-sme.png"
                  alt="科技型中小企业"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">科技型中小企业</h3>
                <p className="text-sm text-gray-600 mt-2">科技创新企业认证</p>
              </div>
            </div>

            {/* 资质卡片 5 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(isoCertificates[currentSlide])}
            >
              <div className="relative aspect-[4/3] bg-white">
                <LazyImage
                  src={isoCertificates[currentSlide].src}
                  alt={isoCertificates[currentSlide].alt}
                  className="w-full h-full"
                />
                {/* 轮播控制按钮 */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* 轮播指示器 */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  {isoCertificates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-black' : 'bg-black/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">ISO质量体系认证</h3>
                <p className="text-sm text-gray-600 mt-2">{isoCertificates[currentSlide].title}</p>
              </div>
            </div>

            {/* 资质卡片 6 */}
            <div
              className="group bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => setSelectedImage(qualificationImages[7])}
            >
              <div className="aspect-[4/3] bg-white flex items-center justify-center p-4 relative">
                <LazyImage
                  src="/images/value-added-telecom-license.jpg"
                  alt="增值电信业务经营许可证"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">增值电信业务经营许可证</h3>
                <p className="text-sm text-gray-600 mt-2">电信业务经营资质</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Introduction Section */}
      <section className="py-24 md:py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            视频介绍
          </h2>
          <p className="text-xl text-gray-600 mt-6">
            了解我们的产品与服务
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 视频卡片 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-sm">公司介绍视频</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">公司介绍</h3>
                <p className="text-sm text-gray-600 mt-2">了解浙江思杋服饰有限公司的发展历程与核心业务</p>
              </div>
            </div>

            {/* 视频卡片 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-sm">产品展示视频</div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">产品展示</h3>
                <p className="text-sm text-gray-600 mt-2">全面展示我们的校服产品线与设计理念</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <LazyImage
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[90vh]"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              {selectedImage.title}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}