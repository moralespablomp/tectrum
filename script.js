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
    threshold: 0.15,
  }
);

revealElements.forEach((el) => observer.observe(el));
