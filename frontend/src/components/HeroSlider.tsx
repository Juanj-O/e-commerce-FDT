import { useEffect, useState } from 'react';

const HERO_CARDS = [
  {
    id: 1,
    title: 'Nueva Colección 2026',
    subtitle: 'Lo último en tecnología',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop',
    bgColor: 'from-red-600 to-red-700',
  },
  {
    id: 2,
    title: 'Ofertas Especiales',
    subtitle: 'Hasta 40% de descuento',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
    bgColor: 'from-purple-600 to-purple-700',
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2); // Solo 2 posiciones
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  return (
    <section className="relative bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          {/* Cards Container */}
          <div className="flex gap-5 justify-center">
            {/* Primera Card */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div
                className={`relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br ${HERO_CARDS[currentSlide].bgColor} shadow-xl`}
              >
                <div className="absolute inset-0 bg-black/30" />
                <img
                  src={HERO_CARDS[currentSlide].image}
                  alt={HERO_CARDS[currentSlide].title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-8">
                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                    {HERO_CARDS[currentSlide].title}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">
                    {HERO_CARDS[currentSlide].subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Segunda Card */}
            <div className="hidden md:block md:w-1/2 flex-shrink-0">
              <div
                className={`relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br ${HERO_CARDS[(currentSlide + 1) % 2].bgColor} shadow-xl`}
              >
                <div className="absolute inset-0 bg-black/30" />
                <img
                  src={HERO_CARDS[(currentSlide + 1) % 2].image}
                  alt={HERO_CARDS[(currentSlide + 1) % 2].title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-8">
                  <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                    {HERO_CARDS[(currentSlide + 1) % 2].title}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">
                    {HERO_CARDS[(currentSlide + 1) % 2].subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-gray-800 w-8' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
