interface AppleFeatureProps {
  title: string;
  description: string;
  image?: React.ReactNode;
  reverse?: boolean;
}

export default function AppleFeature({ title, description, image, reverse }: AppleFeatureProps) {
  return (
    <div className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className={`${reverse ? 'order-2 md:order-1' : 'order-1'}`}>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xl text-gray-600 mt-6">
          {description}
        </p>
      </div>
      <div className={`${reverse ? 'order-1 md:order-2' : 'order-2'}`}>
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">
          {image || (
            <div className="text-center">
              <div className="text-8xl text-gray-300">✨</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
