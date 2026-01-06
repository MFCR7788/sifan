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
  { id: '31', src: '/images/stores/0b9be583d7ea0957fa0e48b918d25a6e.JPG', alt: '合作门店31' },
  { id: '32', src: '/images/stores/1c1ec5c761daafb1ae10e04144b85779.JPG', alt: '合作门店32' },
  { id: '33', src: '/images/stores/1feedback_sendimage.jpg', alt: '合作门店33' },
  { id: '34', src: '/images/stores/7a08f8e26e9d383f7695f22f14be2c07.JPG', alt: '合作门店34' },
  { id: '35', src: '/images/stores/7fa2d8a24ff80c2477f4d4e8bbf3c017.JPG', alt: '合作门店35' },
  { id: '36', src: '/images/stores/8a3dfcae464961c046ad89f0dfd3949f.JPG', alt: '合作门店36' },
  { id: '37', src: '/images/stores/09d5229557a1f76d80c188b3c070ae6c.JPG', alt: '合作门店37' },
  { id: '38', src: '/images/stores/13dcbec0f6b6ee5af510ec2385def15d.JPG', alt: '合作门店38' },
  { id: '39', src: '/images/stores/527e0cb519d677801e90059e7e43d602.JPG', alt: '合作门店39' },
  { id: '40', src: '/images/stores/1362f90b6b7c744ae9a88c506375fd8f.JPG', alt: '合作门店40' },
  { id: '41', src: '/images/stores/957041c397eb1e62ca6df0a1fd5c6c5f.JPG', alt: '合作门店41' },
  { id: '42', src: '/images/stores/43926449652b6bba509336c93a1096c4.JPG', alt: '合作门店42' },
  { id: '43', src: '/images/stores/微信图片_20240612133847.jpg', alt: '合作门店43' },
  { id: '44', src: '/images/stores/aa6f56333bc1e2095487ee5c04d20c8c.JPG', alt: '合作门店44' },
  { id: '45', src: '/images/stores/aab3a2b7fd4bd22fde4434120b33493b.JPG', alt: '合作门店45' },
  { id: '46', src: '/images/stores/b09d0eb255885a906b642c5f87358c56.JPG', alt: '合作门店46' },
  { id: '47', src: '/images/stores/b6820b6dceb324c9970129ca61324211.JPG', alt: '合作门店47' },
  { id: '48', src: '/images/stores/d4a4e6b9c89cf86ed66af8846da7f9ac.JPG', alt: '合作门店48' },
  { id: '49', src: '/images/stores/d4f57815b2cc6b80bdeea3f8b79b73f7.JPG', alt: '合作门店49' },
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
