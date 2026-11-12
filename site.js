// AD Financial Services — shared site behaviour: scroll reveals, counters, magnetic buttons,
// parallax, 3D tilt and pointer depth (ported from the capravinmali.in motion set via the AMD site).
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PHONE = '+91 98608 34230';
export const TEL = 'tel:+919860834230';
export const WA = 'https://wa.me/919860834230';
export const EMAIL = 'ajaydange084@gmail.com';

/* Reveal: hides [data-reveal] then transitions them in on intersect. */
window.__adfsObservers = window.__adfsObservers || [];

export function initReveal(root) {
  const nodes = [...(root || document).querySelectorAll('[data-reveal]')].filter((n) => !n.__adfsSeen);
  if (!nodes.length) return;
  if (reduce()) return;
  const hide = (el) => {
    const kind = el.getAttribute('data-reveal');
    const d = parseInt(el.getAttribute('data-delay') || '0', 10);
    el.style.willChange = 'transform, opacity, clip-path';
    el.style.transition = `transform 1.05s cubic-bezier(.16,.84,.26,1) ${d}ms, opacity .9s ease ${d}ms, clip-path 1.15s cubic-bezier(.16,.84,.26,1) ${d}ms`;
    if (kind === 'clip') { el.style.clipPath = 'inset(0 0 100% 0)'; }
    else if (kind === 'tilt') { el.style.opacity = '0'; el.style.transformOrigin = '50% 100%'; el.style.transform = 'perspective(1400px) rotateX(16deg) translate3d(0,56px,-40px)'; }
    else if (kind === 'wipe') { el.style.clipPath = 'inset(0 100% 0 0)'; }
    else if (kind === 'line') { el.style.transform = 'scaleX(0)'; el.style.transformOrigin = 'left center'; }
    else if (kind === 'fade') { el.style.opacity = '0'; }
    else { el.style.opacity = '0'; el.style.transform = 'translate3d(0,' + (kind === 'up-lg' ? 48 : 22) + 'px,0)'; }
  };
  const show = (el) => {
    if (el.__adfsShown) return;
    el.__adfsShown = true;
    el.style.clipPath = 'inset(0 0 0 0)';
    el.style.opacity = '1';
    el.style.transform = 'none';
    setTimeout(() => { el.style.willChange = 'auto'; el.style.clipPath = ''; }, 1600);
  };
  nodes.forEach((n) => { n.__adfsSeen = true; hide(n); });

  // Deterministic rAF polling — no IntersectionObserver edge cases, and it
  // self-terminates once every node has been revealed.
  let pending = nodes.slice();
  const t0 = performance.now();
  const tick = () => {
    const vh = window.innerHeight;
    const hardStop = performance.now() - t0 > 20000;
    pending = pending.filter((n) => {
      const r = n.getBoundingClientRect();
      const inView = r.top < vh * 0.94 && r.bottom > -40;
      if (inView || hardStop) { show(n); return false; }
      return true;
    });
    if (pending.length) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* Counters: [data-count] counts up to its numeric value. */
export function initCounters(root) {
  const nodes = [...(root || document).querySelectorAll('[data-count]')].filter((n) => !n.__adfsCounted);
  if (!nodes.length) return;
  nodes.forEach((n) => { n.__adfsCounted = true; });
  const run = (el) => {
    const to = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    const fmt = (v) => Number(v.toFixed(dec)).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce()) { el.textContent = fmt(to) + suffix; return; }
    const dur = 1500, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  nodes.forEach((n) => io.observe(n));
  window.__adfsObservers.push(io);
}

/* Scroll progress bar width driver. */
export function initProgress(el) {
  if (!el) return;
  let raf = 0;
  const upd = () => {
    raf = 0;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    el.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
  window.addEventListener('scroll', on, { passive: true });
  window.addEventListener('resize', on);
  upd();
  return () => window.removeEventListener('scroll', on);
}

/* Magnetic buttons: subtle pull toward cursor. */
export function initMagnetic(root) {
  if (reduce() || window.matchMedia('(pointer: coarse)').matches) return;
  [...(root || document).querySelectorAll('[data-magnetic]')].forEach((el) => {
    el.style.transition = 'transform .35s cubic-bezier(.2,.8,.3,1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.transform = `translate3d(${x * 10}px,${y * 6}px,0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = 'none'; });
  });
}

/* Parallax: [data-parallax="0.15"] shifts on scroll. */
export function initParallax(root) {
  if (reduce()) return;
  const nodes = [...(root || document).querySelectorAll('[data-parallax]')];
  if (!nodes.length) return;
  let raf = 0;
  const upd = () => {
    raf = 0;
    const vh = window.innerHeight;
    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const amt = parseFloat(el.getAttribute('data-parallax')) || 0.12;
      const mid = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-mid * amt).toFixed(2)}px,0) scale(1.12)`;
    });
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
  window.addEventListener('scroll', on, { passive: true });
  window.addEventListener('resize', on);
  upd();
}

/* 3D tilt: [data-tilt] cards lean toward the pointer with depth + moving sheen. */
export function initTilt(root) {
  if (reduce() || !window.matchMedia('(pointer: fine)').matches) return;
  [...(root || document).querySelectorAll('[data-tilt]')].forEach((el) => {
    if (el.__adfsTilt) return;
    el.__adfsTilt = true;
    const max = parseFloat(el.getAttribute('data-tilt')) || 7;
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';
    const base = el.style.transition ? el.style.transition + ', ' : '';
    el.style.transition = base + 'transform .5s cubic-bezier(.2,.8,.3,1), box-shadow .5s ease';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const sheen = document.createElement('span');
    sheen.setAttribute('aria-hidden', 'true');
    sheen.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s ease;background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.55),transparent 55%);mix-blend-mode:soft-light';
    el.appendChild(sheen);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transition = 'transform .12s linear, box-shadow .3s ease';
      el.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * max).toFixed(2) + 'deg) rotateY(' + ((px - .5) * max).toFixed(2) + 'deg) translateZ(14px)';
      el.style.boxShadow = ((.5 - px) * 26).toFixed(1) + 'px ' + (18 + (.5 - py) * 18).toFixed(1) + 'px 44px rgba(10,26,58,.16)';
      sheen.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      sheen.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      sheen.style.opacity = '1';
      el.style.zIndex = '2';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.2,.8,.3,1), box-shadow .7s ease';
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
      el.style.boxShadow = 'none';
      sheen.style.opacity = '0';
      el.style.zIndex = '';
    });
  });
}

/* Depth: [data-depth-scene] shifts [data-depth="n"] layers with the pointer for a parallax-3D feel. */
export function initDepth(root) {
  if (reduce() || !window.matchMedia('(pointer: fine)').matches) return;
  [...(root || document).querySelectorAll('[data-depth-scene]')].forEach((scene) => {
    if (scene.__adfsDepth) return;
    scene.__adfsDepth = true;
    const layers = [...scene.querySelectorAll('[data-depth]')];
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      layers.forEach((l) => {
        const d = parseFloat(l.getAttribute('data-depth')) || 0;
        l.style.translate = (cx * d).toFixed(2) + 'px ' + (cy * d).toFixed(2) + 'px';
        if (l.hasAttribute('data-depth-rotate')) l.style.rotate = 'x ' + (-cy * 0.12).toFixed(2) + 'deg';
      });
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : 0;
    };
    scene.addEventListener('pointermove', (e) => {
      const r = scene.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 2 * 14;
      ty = ((e.clientY - r.top) / r.height - .5) * 2 * 10;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    scene.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  });
}


/* EMI maths: P principal, annual rate in %, n months. */
export function emi(P, rate, n) {
  const r = rate / 1200;
  if (!r) return P / n;
  const k = Math.pow(1 + r, n);
  return (P * r * k) / (k - 1);
}

export function inr(n) {
  return '₹' + Math.round(Number(n)).toLocaleString('en-IN');
}

/* Send a form to the ADFS Apps Script (emails ajaydange084@gmail.com and logs to the sheet).
   Resolves true when posted, false when no endpoint is configured yet. A simple no-cors form POST
   avoids the browser preflight that Apps Script cannot answer. */
export function send(type, fields) {
  const url = (window.ADFS && window.ADFS.endpoint) || '';
  if (!url) return Promise.resolve(false);
  const body = new URLSearchParams({ page: location.pathname, ...fields, type });
  return fetch(url, { method: 'POST', mode: 'no-cors', body }).then(() => true);
}

/* Financial year (April to March) of a date, as '2026-27'. */
export function finYear(d = new Date()) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return y + '-' + String((y + 1) % 100).padStart(2, '0');
}

/* Next EMI computation reference, e.g. ADFS/EMI/2026-27/001. The Google Sheet script keeps the running number
   for each financial year, so references are unique across all visitors. Without the script (or if it cannot be
   reached) the browser keeps its own running number, which is unique on that device only. */
export function nextRef() {
  const fy = finYear(), url = (window.ADFS && window.ADFS.endpoint) || '';
  const local = () => {
    let n = 0;
    try { n = (parseInt(localStorage.getItem('adfs-emi-seq-' + fy), 10) || 0) + 1; localStorage.setItem('adfs-emi-seq-' + fy, String(n)); } catch (e) { n = 1; }
    return 'ADFS/EMI/' + fy + 'index.html' + String(n).padStart(3, '0');
  };
  if (!url) return Promise.resolve(local());
  const ctl = 'AbortController' in window ? new AbortController() : null;
  const timer = setTimeout(() => ctl && ctl.abort(), 8000);
  return fetch(url + '?nextref=1&t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
    .then((r) => r.json())
    .then((j) => (j && j.ok && /^ADFS\/EMI\/\d{4}-\d{2}\/\d{3,}$/.test(j.ref) ? j.ref : local()))
    .catch(local)
    .finally(() => clearTimeout(timer));
}

export const consentStamp = (what) => 'Yes: ticked the unticked consent box (' + what + ', Privacy Notice v2026-11) at ' + new Date().toISOString();
export const validMobile = (v) => /^[6-9]\d{9}$/.test(String(v).replace(/\D/g, ''));
export const validEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
