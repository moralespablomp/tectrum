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

// Contact form handling (con redirección a MS Forms con datos prellenados)
(function () {
  const form = document.getElementById('tectrum-contact-form');
  if (!form) return;

  const nameEl = document.getElementById('cf-name');
  const emailEl = document.getElementById('cf-email');
  const reqContactEl = document.getElementById('cf-req-contact');
  const reqPlaybookEl = document.getElementById('cf-req-playbook');
  const companyEl = document.getElementById('cf-company');
  const challengeEl = document.getElementById('cf-challenge');
  const availabilityEl = document.getElementById('cf-availability');
  const successEl = document.getElementById('cf-success');
  const msIframe = document.getElementById('ms-form');

  const getErrorBox = (inputId) => document.querySelector(`.error-msg[data-error-for="${inputId}"]`);

  const setError = (inputEl, message) => {
    if (!inputEl) return false;
    inputEl.classList.add('is-invalid');
    const box = getErrorBox(inputEl.id);
    if (box) box.textContent = message || '';
    return false;
  };

  const clearError = (inputEl) => {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    const box = getErrorBox(inputEl.id);
    if (box) box.textContent = '';
  };

  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  const validate = () => {
    let ok = true;
    clearError(nameEl);
    clearError(emailEl);
    clearError(companyEl);
    clearError(challengeEl);
    clearError(availabilityEl);
    const requestErrorBox = document.querySelector('.error-msg[data-error-for="cf-request"]');
    if (requestErrorBox) requestErrorBox.textContent = '';

    if (!nameEl.value.trim()) ok = setError(nameEl, 'Este campo es obligatorio.');
    if (!emailEl.value.trim()) {
      ok = setError(emailEl, 'Este campo es obligatorio.');
    } else if (!validEmail(emailEl.value)) {
      ok = setError(emailEl, 'Ingresá un correo válido.');
    }
    if (!companyEl.value.trim()) ok = setError(companyEl, 'Este campo es obligatorio.');
    if (!challengeEl.value.trim()) ok = setError(challengeEl, 'Este campo es obligatorio.');
    if (!availabilityEl.value.trim()) ok = setError(availabilityEl, 'Este campo es obligatorio.');
    if (!reqContactEl.checked && !reqPlaybookEl.checked) {
      if (requestErrorBox) requestErrorBox.textContent = 'Seleccioná al menos una opción.';
      ok = false;
    }
    return ok;
  };

  [nameEl, emailEl, companyEl, challengeEl, availabilityEl].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('blur', () => {
      if (el.value.trim()) clearError(el);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      request_contact: reqContactEl.checked,
      request_playbook: reqPlaybookEl.checked,
      company: companyEl.value.trim(),
      challenge: challengeEl.value.trim(),
      availability: availabilityEl.value.trim(),
    };

    // Claves de prellenado: usar config global si existe, sino defaults
    const defaultMap = {
      name: 'Nombre',
      email: 'Correo',
      company: 'Empresa',
      challenge: 'Desafio',
      availability: 'Horario',
      request_contact: 'QuieroContactar',
      request_playbook: 'QuieroPlaybook',
    };
    const prefillMap = Object.assign({}, defaultMap, (window.MS_FORMS_PREFILL || {}));

    // Base del MS Form desde el iframe oculto (o fallback genérico)
    let baseUrl = 'https://forms.office.com/Pages/ResponsePage.aspx?id=XXXX';
    try {
      const src = msIframe && msIframe.getAttribute('src');
      if (src) baseUrl = src;
    } catch (_) {}

    const url = new URL(baseUrl);
    Object.entries(payload).forEach(([key, value]) => {
      const mapped = prefillMap[key];
      if (!mapped) return;
      const v = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value);
      url.searchParams.set(mapped, v);
    });

    // Feedback y redirección
    if (successEl) {
      successEl.hidden = false;
      successEl.textContent = 'Gracias por tu solicitud, te contactaremos pronto.';
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    setTimeout(() => {
      window.location.assign(url.toString());
    }, 900);
  });
})();

// Reescritura de enlaces/botones de "Contacto" y eliminación de sección de contacto
// - Elimina la sección visible de contacto y cualquier iframe/formulario asociado
// - Fuerza que todos los enlaces/botones de Contacto abran el Microsoft Form en nueva pestaña
(function () {
  const CONTACT_URL = 'https://forms.office.com/pages/responsepage.aspx?id=lgEthFu5DUGUZ8cnYw1BVSXCktbALEVEtFEHpv6pkQhUNEYxUU83TVdESU1NRVQ3ODQxMTdIOExQNi4u&origin=lprLink&route=shorturl';

  const removeContactSection = () => {
    // Eliminar contenedores conocidos
    ['#contacto', '.contact-form', '.contacto-form', '.section-contacto', '#ms-form', '#ms-form-wrapper', '#ms-form-iframe']
      .forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      });
  };

  const normalize = (str) => (str || '').toString().toLowerCase().trim();

  const shouldRewrite = (el) => {
    const text = normalize(el.textContent);
    const title = normalize(el.getAttribute && el.getAttribute('title'));
    const aria = normalize(el.getAttribute && el.getAttribute('aria-label'));
    const alt = normalize(el.getAttribute && el.getAttribute('alt'));
    const id = normalize(el.id || '');
    const cls = normalize(el.className || '');
    const href = normalize(el.getAttribute && el.getAttribute('href'));

    const containsContacto = (s) => s.includes('contacto') || s.includes('contact');

    return (
      containsContacto(text) ||
      containsContacto(title) ||
      containsContacto(aria) ||
      containsContacto(alt) ||
      containsContacto(id) ||
      containsContacto(cls) ||
      (href && (href.includes('#contacto') || href.includes('#contact')))
    );
  };

  const rewriteElements = () => {
    document.querySelectorAll('a, button').forEach((el) => {
      if (!shouldRewrite(el)) return;

      if (el.tagName.toLowerCase() === 'a') {
        el.setAttribute('href', CONTACT_URL);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        el.removeAttribute('data-scroll');
      } else {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(CONTACT_URL, '_blank', 'noopener');
        });
      }
    });
  };

  // Ejecutar al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeContactSection();
      rewriteElements();
    });
  } else {
    removeContactSection();
    rewriteElements();
  }
})();

