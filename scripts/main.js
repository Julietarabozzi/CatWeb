document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) {
    setupCarousels();
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
    });

    animatedElements.forEach((el) => {
      el.classList.add('reveal');
      el.classList.remove('is-visible');
      observer.observe(el);
    });
  } else {
    animatedElements.forEach((el) => el.classList.add('is-visible'));
  }

  setupCarousels();
});

function setupCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');

  if (!carousels.length) {
    return;
  }

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const items = Array.from(track?.children || []);
    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');

    if (!track || !items.length || !prevButton || !nextButton) {
      return;
    }

    let currentIndex = 0;
    let resizeTimeout;

    const getItemsPerView = () => {
      if (window.innerWidth >= 900) return 3;
      if (window.innerWidth >= 600) return 2;
      return 1;
    };

    const clampIndex = (value) => {
      const max = Math.max(0, items.length - getItemsPerView());
      return Math.min(Math.max(value, 0), max);
    };

    const update = () => {
      currentIndex = clampIndex(currentIndex);

      const computedStyle = window.getComputedStyle(track);
      let gapValue = 0;
      const gapSource = computedStyle.columnGap && computedStyle.columnGap !== 'normal'
        ? computedStyle.columnGap
        : computedStyle.gap;

      if (gapSource) {
        const parsed = parseFloat(gapSource);
        gapValue = Number.isNaN(parsed) ? 0 : parsed;
      }

      const referenceItem = items[0];
      if (!referenceItem) {
        return;
      }

      const itemWidth = referenceItem.getBoundingClientRect().width;
      const offset = currentIndex * (itemWidth + gapValue);
      track.style.transform = `translateX(-${offset}px)`;

      const max = Math.max(0, items.length - getItemsPerView());
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= max;
    };

    const handleNext = () => {
      currentIndex = clampIndex(currentIndex + getItemsPerView());
      update();
    };

    const handlePrev = () => {
      currentIndex = clampIndex(currentIndex - getItemsPerView());
      update();
    };

    nextButton.addEventListener('click', handleNext);
    prevButton.addEventListener('click', handlePrev);

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(update, 150);
    });

    window.addEventListener('load', update, { once: true });
    update();
  });
}
