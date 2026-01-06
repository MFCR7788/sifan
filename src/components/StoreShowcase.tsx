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
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {storeImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${
                index === 4 || index === 7 ? 'md:col-span-2' : ''
              }`}
              style={{ aspectRatio: index === 4 || index === 7 ? '16/9' : '4/3' }}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-semibold text-gray-900 mb-3">100+</div>
            <div className="text-gray-600">合作门店</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-semibold text-gray-900 mb-3">30+</div>
            <div className="text-gray-600">覆盖城市</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-semibold text-gray-900 mb-3">99%</div>
            <div className="text-gray-600">客户满意度</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-semibold text-gray-900 mb-3">24/7</div>
            <div className="text-gray-600">技术支持</div>
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
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
