import { act, renderHook } from '@testing-library/react'
import { useHeroSliderViewModel } from './useHeroSliderViewModel'

describe('useHeroSliderViewModel', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with currentSlide at 0', () => {
    const { result } = renderHook(() => useHeroSliderViewModel(3))

    expect(result.current.currentSlide).toBe(0)
  })

  it('should provide all required functions', () => {
    const { result } = renderHook(() => useHeroSliderViewModel(3))

    expect(result.current.setCurrentSlide).toBeDefined()
    expect(result.current.goToPrevious).toBeDefined()
    expect(result.current.goToNext).toBeDefined()
  })

  describe('setCurrentSlide', () => {
    it('should set slide to specific index', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      act(() => {
        result.current.setCurrentSlide(2)
      })

      expect(result.current.currentSlide).toBe(2)
    })

    it('should allow setting to last slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      act(() => {
        result.current.setCurrentSlide(4)
      })

      expect(result.current.currentSlide).toBe(4)
    })

    it('should allow setting to first slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      act(() => {
        result.current.setCurrentSlide(2)
      })

      expect(result.current.currentSlide).toBe(2)

      act(() => {
        result.current.setCurrentSlide(0)
      })

      expect(result.current.currentSlide).toBe(0)
    })
  })

  describe('goToNext', () => {
    it('should advance to next slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(1)
    })

    it('should wrap to first slide after last slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      act(() => {
        result.current.setCurrentSlide(2)
      })

      expect(result.current.currentSlide).toBe(2)

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(0)
    })

    it('should handle single slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(1))

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(0)
    })
  })

  describe('goToPrevious', () => {
    it('should go to previous slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      act(() => {
        result.current.setCurrentSlide(2)
      })

      expect(result.current.currentSlide).toBe(2)

      act(() => {
        result.current.goToPrevious()
      })

      expect(result.current.currentSlide).toBe(1)
    })

    it('should wrap to last slide from first slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        result.current.goToPrevious()
      })

      expect(result.current.currentSlide).toBe(2)
    })

    it('should handle single slide', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(1))

      act(() => {
        result.current.goToPrevious()
      })

      expect(result.current.currentSlide).toBe(0)
    })
  })

  describe('auto-advance', () => {
    it('should auto-advance after 5 seconds', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(4))

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentSlide).toBe(1)
    })

    it('should continue auto-advancing', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        jest.advanceTimersByTime(5000)
      })
      expect(result.current.currentSlide).toBe(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })
      expect(result.current.currentSlide).toBe(2)

      act(() => {
        jest.advanceTimersByTime(5000)
      })
      expect(result.current.currentSlide).toBe(0)
    })

    it('should wrap around when auto-advancing', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      act(() => {
        result.current.setCurrentSlide(2)
      })

      expect(result.current.currentSlide).toBe(2)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentSlide).toBe(0)
    })

    it('should clean up timer on unmount', () => {
      const { unmount } = renderHook(() => useHeroSliderViewModel(3))

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })

    it('should restart timer when slideCount changes', () => {
      const { result, rerender } = renderHook(({ count }) => useHeroSliderViewModel(count), {
        initialProps: { count: 3 }
      })

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.currentSlide).toBe(1)

      // Change slide count
      rerender({ count: 5 })

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // Should still advance
      expect(result.current.currentSlide).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle 2 slides', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(2))

      expect(result.current.currentSlide).toBe(0)

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(1)

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(0)
    })

    it('should handle multiple next clicks', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      act(() => {
        result.current.goToNext()
        result.current.goToNext()
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(0)
    })

    it('should handle multiple previous clicks', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(3))

      act(() => {
        result.current.goToPrevious()
        result.current.goToPrevious()
        result.current.goToPrevious()
      })

      expect(result.current.currentSlide).toBe(0)
    })

    it('should handle mixed navigation', () => {
      const { result } = renderHook(() => useHeroSliderViewModel(5))

      act(() => {
        result.current.goToNext()
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(2)

      act(() => {
        result.current.goToPrevious()
      })

      expect(result.current.currentSlide).toBe(1)

      act(() => {
        result.current.setCurrentSlide(4)
      })

      expect(result.current.currentSlide).toBe(4)

      act(() => {
        result.current.goToNext()
      })

      expect(result.current.currentSlide).toBe(0)
    })
  })
})
