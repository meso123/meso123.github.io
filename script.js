const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const savedTheme = localStorage.getItem('mazen-theme');
if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;

const themeToggle = document.querySelector('[data-theme-toggle]');
themeToggle?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('mazen-theme', next);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#11120f' : '#f4f0e7');
});

const progress = document.querySelector('.page-progress span');
const nav = document.querySelector('[data-nav]');
let lastY = 0;
const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  if (nav && window.scrollY > 160) nav.classList.toggle('is-hidden', window.scrollY > lastY && window.scrollY - lastY > 5);
  else nav?.classList.remove('is-hidden');
  lastY = Math.max(window.scrollY, 0);
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu?.classList.toggle('open', !open);
});
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelector('[data-flip-card]')?.addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('flipped');
});

const attachTilt = (surface, strength = 8) => {
  if (!surface || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  const target = surface.querySelector('.portrait-card') || surface;
  surface.addEventListener('pointermove', (event) => {
    const rect = surface.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    target.style.transform = `rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
  });
  surface.addEventListener('pointerleave', () => { target.style.transform = ''; });
};
attachTilt(document.querySelector('[data-tilt-card]'), 9);
document.querySelectorAll('[data-parallax-card]').forEach((card) => attachTilt(card, 4));

const filters = document.querySelector('[data-skill-filters]');
const skillTiles = [...document.querySelectorAll('.skill-tile')];
const skillName = document.querySelector('[data-skill-name]');
const skillNote = document.querySelector('[data-skill-note]');
const selectSkill = (tile) => {
  skillTiles.forEach((item) => item.classList.toggle('selected', item === tile));
  if (skillName) skillName.textContent = tile.querySelector('span')?.textContent || '';
  if (skillNote) skillNote.textContent = tile.dataset.note || '';
};
skillTiles.forEach((tile) => {
  tile.addEventListener('mouseenter', () => selectSkill(tile));
  tile.addEventListener('focus', () => selectSkill(tile));
  tile.addEventListener('click', () => selectSkill(tile));
});
if (skillTiles[0]) selectSkill(skillTiles[0]);
filters?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filters.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  const filter = button.dataset.filter;
  skillTiles.forEach((tile) => tile.classList.toggle('filtered-out', filter !== 'all' && tile.dataset.family !== filter));
});

document.querySelectorAll('.project-panel').forEach((panel) => {
  const button = panel.querySelector('.project-summary');
  const bodyPanel = panel.querySelector('.project-body');
  const symbol = panel.querySelector('.project-plus');
  button?.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    panel.classList.toggle('active', !isOpen);
    if (bodyPanel) bodyPanel.hidden = isOpen;
    if (symbol) symbol.textContent = isOpen ? '+' : '−';
  });
});

const toast = document.querySelector('[data-toast]');
let toastTimer;
document.querySelectorAll('[data-copy-email]').forEach((button) => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('mazens543210@gmail.com');
    if (toast) {
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
    }
  } catch {
    window.location.href = 'mailto:mazens543210@gmail.com';
  }
}));

document.querySelectorAll('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.openDialog);
  dialog?.showModal();
}));
document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
  const dialog = button.closest('dialog');
  const video = dialog?.querySelector('video');
  video?.pause();
  dialog?.close();
}));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    dialog.querySelector('video')?.pause();
    dialog.close();
  }
}));

const recruiterToggle = document.querySelector('[data-recruiter-toggle]');
recruiterToggle?.addEventListener('click', () => {
  const active = body.classList.toggle('recruiter-mode');
  recruiterToggle.setAttribute('aria-pressed', String(active));
  recruiterToggle.textContent = active ? 'Full story' : '30-sec mode';
  if (active) document.querySelector('#work')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});

const facts = [
  'PoseCoach evaluated 792 real exercise repetitions.',
  'Five lightweight models add only 127 KB to PoseCoach.',
  'Mazen tuned Hough output from 1,075 lines to 13 useful detections.',
  'Interval reached a highest usability score of 90.',
  'The mascot is named MZ—17 after MoveNet’s 17 body keypoints.',
  'Mazen works natively in both Arabic and English.'
];
let factIndex = 0;
const mascot = document.querySelector('[data-mascot]');
const factBubble = document.querySelector('[data-fact-bubble]');
let factTimer;
mascot?.addEventListener('click', () => {
  if (!factBubble) return;
  factBubble.textContent = facts[factIndex % facts.length];
  factIndex += 1;
  factBubble.hidden = false;
  clearTimeout(factTimer);
  factTimer = setTimeout(() => { factBubble.hidden = true; }, 5200);
});

document.querySelectorAll('.magnetic').forEach((button) => {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.1}px, ${(event.clientY - rect.top - rect.height / 2) * 0.1}px)`;
  });
  button.addEventListener('pointerleave', () => { button.style.transform = ''; });
});
