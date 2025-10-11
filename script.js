const scrollLinks = document.querySelectorAll('[data-scroll="true"]');
const headerEl = document.querySelector('.top-bar');

function scrollToWithOffset(target) {
  const rect = target.getBoundingClientRect();
  const headerH = headerEl ? headerEl.offsetHeight : 0;
  const topOffset = (headerH || 0) + 16; // leave space so titles aren’t hidden
  const scrollTop = window.pageYOffset + rect.top - topOffset;
  window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
}

scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        scrollToWithOffset(target);
      }
    }
  });
});

// Ensure initial hash lands below the sticky header
window.addEventListener('load', () => {
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      setTimeout(() => scrollToWithOffset(target), 0);
    }
  }
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

const dropdownToggles = document.querySelectorAll('[data-dropdown-target]');

if (dropdownToggles.length) {
  const dropdowns = Array.from(dropdownToggles)
    .map((button) => {
      const parent = button.closest('.nav-dropdown');
      const menuId = button.getAttribute('data-dropdown-target');
      const menu = menuId ? document.getElementById(menuId) : null;
      return parent && menu
        ? {
            button,
            parent,
            menu,
          }
        : null;
    })
    .filter(Boolean);

  const closeAllDropdowns = () => {
    dropdowns.forEach(({ button, parent }) => {
      parent.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  dropdowns.forEach(({ button, parent, menu }) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = parent.classList.contains('is-open');
      closeAllDropdowns();
      if (!isOpen) {
        parent.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeAllDropdowns();
      });
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

