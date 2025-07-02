import { useEffect, useCallback, useRef } from 'react';

export const useOptimizedPerformance = () => {
  const frameRef = useRef<number | undefined>(undefined);

  // Оптимизированный debounce для событий
  const optimizedDebounce = useCallback((func: Function, delay: number) => {
    return (...args: any[]) => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        setTimeout(() => func(...args), delay);
      });
    };
  }, []);

  // Плавный скролл к элементу
  const smoothScrollTo = useCallback((element: Element | string, offset: number = 0) => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }, []);

  // Ленивая загрузка изображений
  const setupLazyImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.add('fade-in-up');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    
    return () => {
      images.forEach(img => imageObserver.unobserve(img));
    };
  }, []);

  // Предзагрузка критических ресурсов
  const preloadCriticalResources = useCallback(() => {
    const criticalImages = [
      '/src/assets/background.png',
      // Добавьте другие критические изображения
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  // Оптимизация для мобильных устройств
  const optimizeForMobile = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Добавляем класс для мобильной оптимизации
      document.body.classList.add('mobile-optimized');
      
      // Отключаем hover эффекты на мобильных
      const style = document.createElement('style');
      style.textContent = `
        @media (hover: none) {
          .mobile-optimized *:hover {
            transform: none !important;
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    preloadCriticalResources();
    optimizeForMobile();
    const cleanupLazy = setupLazyImages();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      cleanupLazy();
    };
  }, [preloadCriticalResources, optimizeForMobile, setupLazyImages]);

  return {
    optimizedDebounce,
    smoothScrollTo,
    setupLazyImages,
    preloadCriticalResources,
    optimizeForMobile
  };
};

export default useOptimizedPerformance; 