const scrollLinks = document.querySelectorAll('[data-scroll="true"]');

scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealElements.forEach((el) => observer.observe(el));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const liquidViewport = document.querySelector('[data-liquid-viewport]');

if (liquidViewport) {
  const liquidTrack = liquidViewport.querySelector('[data-liquid-track]');
  if (liquidTrack) {
    // Duplicate chips to allow a seamless loop.
    liquidTrack.innerHTML = liquidTrack.innerHTML + liquidTrack.innerHTML;

    const autoSpeed = prefersReducedMotion ? 0 : 0.6;
    let speed = autoSpeed;
    let isPointerDown = false;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let pointerStartTime = 0;

    const updateScrollLoop = () => {
      const halfWidth = liquidTrack.scrollWidth / 2;
      if (liquidViewport.scrollLeft >= halfWidth) {
        liquidViewport.scrollLeft -= halfWidth;
      } else if (liquidViewport.scrollLeft < 0) {
        liquidViewport.scrollLeft += halfWidth;
      }
    };

    liquidViewport.scrollLeft = liquidTrack.scrollWidth / 4;

    const animate = () => {
      if (!prefersReducedMotion && !isPointerDown) {
        liquidViewport.scrollLeft += speed;
        updateScrollLoop();
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const releasePointer = (event) => {
      if (!isPointerDown || (pointerId !== null && event.pointerId !== pointerId)) {
        return;
      }

      isPointerDown = false;
      if (pointerId !== null && liquidViewport.hasPointerCapture(pointerId)) {
        liquidViewport.releasePointerCapture(pointerId);
      }

      if (!prefersReducedMotion) {
        const elapsed = Math.max(1, performance.now() - pointerStartTime);
        const delta = startScroll - liquidViewport.scrollLeft;
        const projectedSpeed = Math.max(-1.8, Math.min(1.8, (delta / elapsed) * 20));
        if (Math.abs(projectedSpeed) > 0.2) {
          speed = projectedSpeed;
        } else {
          const direction = projectedSpeed < 0 ? -1 : 1;
          speed = autoSpeed * (direction === 0 ? 1 : direction);
        }
      }

      pointerId = null;
    };

    liquidViewport.addEventListener('pointerdown', (event) => {
      isPointerDown = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = liquidViewport.scrollLeft;
      pointerStartTime = performance.now();
      speed = 0;
      liquidViewport.setPointerCapture(pointerId);
    });

    liquidViewport.addEventListener('pointermove', (event) => {
      if (!isPointerDown || (pointerId !== null && event.pointerId !== pointerId)) {
        return;
      }

      const dx = event.clientX - startX;
      liquidViewport.scrollLeft = startScroll - dx;
      updateScrollLoop();
    });

    liquidViewport.addEventListener('pointerup', releasePointer);
    liquidViewport.addEventListener('pointercancel', releasePointer);
  }
}
