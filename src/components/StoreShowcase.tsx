'use client';

import { useState } from 'react';

interface StoreImage {
  id: string;
  src: string;
  alt: string;
}

const storeImages: StoreImage[] = [
  { id: '1', src: '/images/stores/0feedback_sendimage.jpg', alt: '合作门店1' },
  { id: '2', src: '/images/stores/5beeca9084b91f0f872c9c3476e8a80a.JPG', alt: '合作门店2' },
  { id: '3', src: '/images/stores/28efb704fb733bdf4d96b8af8f9fcfd4.jpg', alt: '合作门店3' },
  { id: '4', src: '/images/stores/c31f0ac7b7cd44a6cd02f613bd3bb7d3.jpg', alt: '合作门店4' },
  { id: '5', src: '/images/stores/IMG_0110.jpg', alt: '合作门店5' },
  { id: '6', src: '/images/stores/IMG_0781.JPG', alt: '合作门店6' },
  { id: '7', src: '/images/stores/IMG_0782.JPG', alt: '合作门店7' },
  { id: '8', src: '/images/stores/IMG_0829.JPG', alt: '合作门店8' },
];

export default function StoreShowcase() {
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              合作门店展示
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            我们的系统已服务全国众多知名门店
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {storeImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative group overflow-hidden rounded-xl cursor-pointer ${
                index === 4 || index === 7 ? 'md:col-span-2' : ''
              }`}
              style={{ aspectRatio: index === 4 || index === 7 ? '16/9' : '4/3' }}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold">合作门店 #{image.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl font-bold text-cyan-400 mb-2">100+</div>
            <div className="text-gray-400">合作门店</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl font-bold text-cyan-400 mb-2">30+</div>
            <div className="text-gray-400">覆盖城市</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl font-bold text-cyan-400 mb-2">99%</div>
            <div className="text-gray-400">客户满意度</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
            <div className="text-gray-400">技术支持</div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
