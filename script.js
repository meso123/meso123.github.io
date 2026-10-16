const root = document.documentElement;
const body = document.body;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('.theme-label');
const savedTheme = localStorage.getItem('mazen-portfolio-theme');

function setTheme(theme) {
  body.dataset.theme = theme;
  themeLabel.textContent = theme === 'light' ? 'Dark' : 'Light';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
  localStorage.setItem('mazen-portfolio-theme', theme);
}

setTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

themeToggle.addEventListener('click', () => {
  setTheme(body.dataset.theme === 'light' ? 'dark' : 'light');
});

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const progressBar = document.querySelector('.scroll-progress span');
const header = document.querySelector('[data-header]');

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  header.classList.toggle('is-scrolled', window.scrollY > 40);
}

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

const navLinks = [...document.querySelectorAll('.site-header nav a')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { threshold: [0.12, 0.32, 0.58], rootMargin: '-18% 0px -55% 0px' });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const dialog = document.getElementById('posecoach-dialog');
const dialogVideo = dialog.querySelector('video');

document.querySelectorAll('[data-open-dialog]').forEach((button) => {
  button.addEventListener('click', () => {
    dialog.showModal();
    dialogVideo.focus();
  });
});

function closeDialog() {
  dialogVideo.pause();
  dialog.close();
}

dialog.querySelector('[data-close-dialog]').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) closeDialog();
});
dialog.addEventListener('close', () => dialogVideo.pause());

const projectRows = [...document.querySelectorAll('.project-row')];
projectRows.forEach((row) => {
  row.addEventListener('toggle', () => {
    if (!row.open) return;
    projectRows.forEach((other) => {
      if (other !== row) other.open = false;
    });
  });
});

function formatMetric(value, target, original) {
  if (original.includes('%')) {
    return `${target % 1 === 0 ? Math.round(value) : value.toFixed(1)}%`;
  }
  return Math.round(value).toLocaleString('en-US');
}

const countItems = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && !reducedMotion) {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const original = element.textContent;
      const duration = 1100;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        element.textContent = formatMetric(target * eased, target, original);
        if (elapsed < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(element);
    });
  }, { threshold: 0.55 });

  countItems.forEach((item) => countObserver.observe(item));
}

const visionStage = document.querySelector('.vision-stage');
if (visionStage && window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
  visionStage.addEventListener('pointermove', (event) => {
    const rect = visionStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visionStage.style.setProperty('--tilt-x', `${x * 8}px`);
    visionStage.style.setProperty('--tilt-y', `${y * 8}px`);
    visionStage.querySelector('.pose-map').style.transform = `translateX(calc(-50% + ${x * 8}px)) translateY(${y * 8}px)`;
  });

  visionStage.addEventListener('pointerleave', () => {
    visionStage.querySelector('.pose-map').style.transform = 'translateX(-50%)';
  });
}

root.classList.add('js-ready');
