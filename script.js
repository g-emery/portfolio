'use strict';

/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 950);
});

/* ─── PARTICLE CANVAS ─── */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

class Particle {
  constructor() { this.init(); }

  init() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.6 + 0.4;
    this.a  = Math.random() * 0.5 + 0.08;
    this.col = Math.random() > 0.5 ? '124,58,237' : '6,182,212';
  }

  update() {
    const dx   = this.x - mouse.x;
    const dy   = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 130) {
      const f = (130 - dist) / 130;
      this.vx += (dx / dist) * f * 0.028;
      this.vy += (dy / dist) * f * 0.028;
    }

    this.vx *= 0.978;
    this.vy *= 0.978;
    this.x  += this.vx;
    this.y  += this.vy;

    if (this.x < 0)             this.x = canvas.width;
    if (this.x > canvas.width)  this.x = 0;
    if (this.y < 0)             this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.col},${this.a})`;
    ctx.fill();
  }
}

function buildParticles() {
  particles = [];
  const n = Math.min(90, Math.floor((canvas.width * canvas.height) / 14000));
  for (let i = 0; i < n; i++) particles.push(new Particle());
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 115) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 115) * 0.13})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }
}

let heroActive = true;

function animateParticles() {
  if (heroActive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
  }
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
buildParticles();
animateParticles();

window.addEventListener('resize', () => { resizeCanvas(); buildParticles(); });
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

/* ─── TYPED TEXT ─── */
const phrases = [
  'Full Stack Developer.',
  'UI / UX Enthusiast.',
  'Problem Solver.',
  'Creative Coder.',
  'Open Source Contributor.',
];

let pi = 0, ci = 0, deleting = false;
const typedEl = document.querySelector('.typed-text');

function typeLoop() {
  const phrase = phrases[pi];

  if (!deleting) {
    ci++;
    typedEl.textContent = phrase.slice(0, ci);
    if (ci === phrase.length) {
      deleting = true;
      setTimeout(typeLoop, 2400);
      return;
    }
    setTimeout(typeLoop, 80);
  } else {
    ci--;
    typedEl.textContent = phrase.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(typeLoop, 380);
      return;
    }
    setTimeout(typeLoop, 45);
  }
}
setTimeout(typeLoop, 1200);

/* ─── SCROLL CONTAINER HELPERS ─── */
const scroller = document.getElementById('scrollContainer');

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) scroller.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
}

/* ─── HEADER SCROLL STYLE ─── */
const header = document.getElementById('header');
scroller.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scroller.scrollTop > 60);
}, { passive: true });

/* ─── NAV DOTS ─── */
const sectionIds = ['hero', 'about', 'projects', 'skills', 'contact'];
const dots       = document.querySelectorAll('.nav-dot');

dots.forEach(dot => {
  dot.addEventListener('click', () => scrollTo(dot.dataset.target));
});

/* ─── STAT COUNTER ─── */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const dur    = 1800;
  const start  = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);        // easeOutCubic
    el.textContent = Math.round(e * target);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─── INTERSECTION OBSERVER (scroll-reveal) ─── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('on');

    // Skill bars
    el.querySelectorAll('.skill-fill[data-w]').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 250);
    });

    // Stat counters
    el.querySelectorAll('[data-count]').forEach(countEl => {
      setTimeout(() => countUp(countEl), 400);
    });

    revealObs.unobserve(el);
  });
}, {
  root: scroller,
  rootMargin: '-8% 0px -8% 0px',
  threshold: 0.05,
});

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── NAV DOTS ACTIVE + HERO PARTICLE PAUSE ─── */
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio < 0.5) return;
    const id    = entry.target.id;
    const index = sectionIds.indexOf(id);
    heroActive  = id === 'hero';

    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  });
}, {
  root: scroller,
  threshold: 0.5,
});

document.querySelectorAll('.section').forEach(s => sectionObs.observe(s));

/* ─── HEADER NAV SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    scrollTo(id);
  });
});

/* ─── 3D TILT ON PROJECT CARDS ─── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  let raf = null;

  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const cx = r.width  / 2;
    const cy = r.height / 2;
    const rx = ((e.clientY - r.top)  - cy) / cy * -7;
    const ry = ((e.clientX - r.left) - cx) / cx *  7;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    });
  });

  card.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
});

/* ─── SPOTLIGHT CURSOR GLOW ─── */
const spotlight = document.createElement('div');
Object.assign(spotlight.style, {
  position:       'fixed',
  width:          '480px',
  height:         '480px',
  borderRadius:   '50%',
  background:     'radial-gradient(circle, rgba(124,58,237,0.045) 0%, transparent 65%)',
  pointerEvents:  'none',
  zIndex:         '0',
  transform:      'translate(-50%,-50%)',
  transition:     'opacity 0.4s ease',
  willChange:     'left, top',
});
document.body.appendChild(spotlight);

let spotX = 0, spotY = 0, spotRaf = null;
document.addEventListener('mousemove', e => {
  spotX = e.clientX;
  spotY = e.clientY;
  if (!spotRaf) {
    spotRaf = requestAnimationFrame(() => {
      spotlight.style.left = spotX + 'px';
      spotlight.style.top  = spotY + 'px';
      spotRaf = null;
    });
  }
});
