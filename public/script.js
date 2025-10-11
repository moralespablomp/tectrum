const scrollLinks = document.querySelectorAll('[data-scroll="true"]');
const headerEl = document.querySelector('.top-bar');

function scrollToWithOffset(target) {
  const rect = target.getBoundingClientRect();
  const headerH = headerEl ? headerEl.offsetHeight : 0;
  const topOffset = (headerH || 0) + 16;
  const scrollTop = window.pageYOffset + rect.top - topOffset;
  window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
}

scrollLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) scrollToWithOffset(target);
    }
  });
});

window.addEventListener('load', () => {
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => scrollToWithOffset(target), 0);
  }
});

// Reveal on view
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
revealElements.forEach((el) => observer.observe(el));

// Dropdown behavior
const dropdownToggles = document.querySelectorAll('[data-dropdown-target]');
if (dropdownToggles.length) {
  const dropdowns = Array.from(dropdownToggles)
    .map((button) => {
      const parent = button.closest('.nav-dropdown');
      const menuId = button.getAttribute('data-dropdown-target');
      const menu = menuId ? document.getElementById(menuId) : null;
      return parent && menu ? { button, parent, menu } : null;
    }).filter(Boolean);

  const closeAll = () => dropdowns.forEach(({ button, parent }) => { parent.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); });

  dropdowns.forEach(({ button, parent, menu }) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const open = parent.classList.contains('is-open');
      closeAll();
      if (!open) { parent.classList.add('is-open'); button.setAttribute('aria-expanded', 'true'); }
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeAll));
  });

  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-dropdown')) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
}

