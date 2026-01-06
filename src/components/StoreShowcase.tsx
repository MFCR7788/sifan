'use client';

import { useState } from 'react';

interface StoreImage {
  id: string;
  src: string;
  alt: string;
}

const storeImages: StoreImage[] = [
  { id: '1', src: '/images/stores/0feedback_sendimage.jpg', alt: '合作门店1' },
  { id: '2', src: '/images/stores/0feedback_sendimage 2.jpg', alt: '合作门店2' },
  { id: '3', src: '/images/stores/0feedback_sendimage 3.jpg', alt: '合作门店3' },
  { id: '4', src: '/images/stores/4.jpg', alt: '合作门店4' },
  { id: '5', src: '/images/stores/4 2.jpg', alt: '合作门店5' },
  { id: '6', src: '/images/stores/4bd60ab93ae0970e66c1d1afeabae231.JPG', alt: '合作门店6' },
  { id: '7', src: '/images/stores/5beeca9084b91f0f872c9c3476e8a80a.JPG', alt: '合作门店7' },
  { id: '8', src: '/images/stores/05e2912c440fb6652e89774c71f8636e.JPG', alt: '合作门店8' },
  { id: '9', src: '/images/stores/7c509a63078b2316cf880e2544942885.JPG', alt: '合作门店9' },
  { id: '10', src: '/images/stores/56cd5a7393a7212098d258d5330b4868.JPG', alt: '合作门店10' },
  { id: '11', src: '/images/stores/625b273dd65cdb12d73190a5d9c9afad.JPG', alt: '合作门店11' },
  { id: '12', src: '/images/stores/06121157_00.jpg', alt: '合作门店12' },
  { id: '13', src: '/images/stores/06121338_02.jpg', alt: '合作门店13' },
  { id: '14', src: '/images/stores/be7b306770cba2e2c800ea2e50ac8c17.jpg', alt: '合作门店14' },
  { id: '15', src: '/images/stores/d6dec57c24dbd785f420768c6d74c47f.JPG', alt: '合作门店15' },
  { id: '16', src: '/images/stores/IMG_0110.jpg', alt: '合作门店16' },
  { id: '17', src: '/images/stores/IMG_0781.JPG', alt: '合作门店17' },
  { id: '18', src: '/images/stores/IMG_0782.JPG', alt: '合作门店18' },
  { id: '19', src: '/images/stores/IMG_0830.jpg', alt: '合作门店19' },
  { id: '20', src: '/images/stores/IMG_1376 2.JPG', alt: '合作门店20' },
  { id: '21', src: '/images/stores/IMG_6593.jpg', alt: '合作门店21' },
  { id: '22', src: '/images/stores/IMG_6670.jpg', alt: '合作门店22' },
  { id: '23', src: '/images/stores/IMG_6906.jpg', alt: '合作门店23' },
  { id: '24', src: '/images/stores/IMG_6908.jpg', alt: '合作门店24' },
  { id: '25', src: '/images/stores/IMG_7989.jpg', alt: '合作门店25' },
  { id: '26', src: '/images/stores/IMG_9238.jpg', alt: '合作门店26' },
  { id: '27', src: '/images/stores/IMG_9267.jpg', alt: '合作门店27' },
  { id: '28', src: '/images/stores/IMG_9428.jpg', alt: '合作门店28' },
  { id: '29', src: '/images/stores/IMG_9437.jpg', alt: '合作门店29' },
  { id: '30', src: '/images/stores/IMG_9816.JPG', alt: '合作门店30' },
];

export default function StoreShowcase() {
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {storeImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group overflow-hidden rounded-2xl cursor-pointer"
              style={{ aspectRatio: '4/3' }}
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
            <div className="text-5xl font-semibold text-gray-900 mb-3">300+</div>
            <div className="text-gray-600">合作网点</div>
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
