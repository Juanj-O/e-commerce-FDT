import { useEffect, useState } from 'react';

export interface HeroSliderViewModel {
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export const useHeroSliderViewModel = (slideCount: number): HeroSliderViewModel => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  return {
    currentSlide,
    setCurrentSlide,
    goToPrevious,
    goToNext,
  };
};
