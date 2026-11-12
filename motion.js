/* AD Financial Services — site-wide motion, ported from the PMA website (assets/reveal.js):
   custom cursor (ring + dot + click ripple), touch ripple, Home load curtain, page-exit veil,
   floating contact dock that shows only mid-page, and glow / sheen / ripple on [data-pill] buttons.
   Scroll reveals, counters, tilt and parallax stay in site.js. Self-contained, no dependencies. */
(function () {
  if (window.__adfsMotion) return;
  window.__adfsMotion = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var me = document.currentScript;
  var wantsIntro = !!(me && me.hasAttribute('data-intro'));

  /* ---------- injected keyframes / cursor styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '@keyframes adfsRipple{from{transform:translate(-50%,-50%) scale(.2);opacity:.5}to{transform:translate(-50%,-50%) scale(1);opacity:0}}',
    '@keyframes adfsIntro{0%{transform:translateY(0)}60%{transform:translateY(0)}100%{transform:translateY(-101%);visibility:hidden}}',
    '@keyframes adfsIntroMark{0%{opacity:0;transform:translateY(12px)}22%{opacity:1;transform:translateY(0)}50%{opacity:1;transform:translateY(0)}60%{opacity:0;transform:translateY(-8px)}100%{opacity:0;transform:translateY(-8px)}}',
    '@keyframes adfsIntroLine{0%{transform:scaleX(0)}18%{transform:scaleX(0)}52%{transform:scaleX(1)}100%{transform:scaleX(1)}}',
    '@keyframes adfsPillRipple{from{transform:translate(-50%,-50%) scale(0);opacity:.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}}',
    '.adfs-cursor{position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;border:1.5px solid currentColor;border-radius:50%;pointer-events:none;z-index:2147483000;mix-blend-mode:difference;color:#fff;opacity:0;transition:width .25s ease, height .25s ease, margin .25s ease, border-width .25s ease, opacity .25s ease;will-change:transform}',
    '.adfs-dot{position:fixed;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:currentColor;pointer-events:none;z-index:2147483001;mix-blend-mode:difference;color:#fff;opacity:0;transition:opacity .25s ease;will-change:transform}',
    '.adfs-ripple{position:fixed;width:150px;height:150px;border:1.5px solid currentColor;border-radius:50%;pointer-events:none;z-index:2147482999;mix-blend-mode:difference;color:#fff;animation:adfsRipple .8s cubic-bezier(.22,.61,.36,1) forwards}',
    '@media (pointer: fine){html.adfs-cursor-on, html.adfs-cursor-on *{cursor:none !important}}',
    '[data-pill]{position:relative;overflow:hidden;isolation:isolate}',
    '[data-pill] > .adfs-pill-glow{pointer-events:none;position:absolute;inset:0;z-index:-1;background:radial-gradient(90px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.34), transparent 70%);opacity:var(--glow,0);transition:opacity .3s ease}',
    '[data-pill] > .adfs-pill-sheen{pointer-events:none;position:absolute;top:0;bottom:0;left:0;width:40%;z-index:-1;background:linear-gradient(105deg, transparent, rgba(255,255,255,.38), transparent);transform:translateX(var(--sx,-160%)) skewX(-18deg);transition:transform .8s cubic-bezier(.22,.61,.36,1)}',
    '[data-pill] > [data-line]{transition:width .4s cubic-bezier(.22,.61,.36,1)}',
    '[data-pill]:hover > [data-line]{width:34px !important}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- load curtain (Home only: <script src="motion.js" data-intro>) ---------- */
  function curtain() {
    if (reduce || !wantsIntro) return;
    if (document.visibilityState !== 'visible') {
      document.addEventListener('visibilitychange', function once() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', once);
        curtain();
      });
      return;
    }
    var c = document.createElement('div');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;z-index:2147482000;background:#0A2347;pointer-events:none;display:flex;align-items:center;justify-content:center';
    c.style.animation = 'adfsIntro 2.1s cubic-bezier(.76,0,.24,1) forwards';
    var mark = document.createElement('div');
    mark.style.cssText = 'text-align:center;opacity:0;transform:translateY(12px);animation:adfsIntroMark 2.1s cubic-bezier(.22,.61,.36,1) forwards';
    var n = document.createElement('div');
    n.style.cssText = "font-family:Spectral,Georgia,serif;font-weight:300;font-size:clamp(32px,5.6vw,68px);letter-spacing:-.02em;line-height:1;color:#F6F4EF";
    n.innerHTML = 'AD <em style="font-style:italic;color:#9DC0EE">Financial</em> Services';
    var line = document.createElement('div');
    line.style.cssText = 'margin:22px auto 0;width:min(220px,46vw);height:2px;background:#D3222A;transform-origin:left center;transform:scaleX(0);animation:adfsIntroLine 2.1s cubic-bezier(.22,.61,.36,1) forwards';
    var d = document.createElement('div');
    d.style.cssText = "margin-top:18px;font-family:Archivo,system-ui,sans-serif;font-size:clamp(9px,1vw,11px);letter-spacing:.34em;text-transform:uppercase;color:rgba(244,243,241,.72)";
    d.textContent = '‘ स्वप्ने तुमची पूर्तता आमची ’'; d.lang = 'mr'; d.style.letterSpacing = '.06em'; d.style.textTransform = 'none'; d.style.fontSize = 'clamp(13px,1.5vw,17px)';
    mark.appendChild(n); mark.appendChild(line); mark.appendChild(d);
    c.appendChild(mark);
    document.documentElement.appendChild(c);
    c.addEventListener('animationend', function (e) { if (e.target === c && c.parentNode) c.remove(); });
    var frozen = function () {
      try {
        var a = c.getAnimations()[0];
        return !a || (a.currentTime === 0 && document.timeline.currentTime === 0);
      } catch (err) { return true; }
    };
    if (frozen()) { c.remove(); return; }
    setTimeout(function () { if (c.parentNode) c.remove(); }, 2600);
  }
  curtain();

  /* ---------- touch tap ripple (coarse pointers) ---------- */
  function ripple(e) {
    var r = document.createElement('div');
    r.className = 'adfs-ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.documentElement.appendChild(r);
    setTimeout(function () { r.remove(); }, 800);
  }
  if (!finePointer && !reduce) document.addEventListener('pointerdown', ripple, { passive: true });

  /* ---------- custom cursor: thin ring + dot + click ripple ---------- */
  if (finePointer && !reduce) {
    document.documentElement.classList.add('adfs-cursor-on');
    var ring = document.createElement('div'); ring.className = 'adfs-cursor';
    var dot = document.createElement('div'); dot.className = 'adfs-dot';
    document.documentElement.appendChild(ring);
    document.documentElement.appendChild(dot);

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, rx = tx, ry = ty;
    (function loop() {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      ring.style.opacity = '1'; dot.style.opacity = '1';
      var interactive = e.target && e.target.closest && e.target.closest('a,button,input,select,textarea,label,[role="button"],[data-col],[data-tilt]');
      if (interactive) {
        ring.style.width = '52px'; ring.style.height = '52px'; ring.style.margin = '-26px 0 0 -26px'; ring.style.borderWidth = '2px';
      } else {
        ring.style.width = '26px'; ring.style.height = '26px'; ring.style.margin = '-13px 0 0 -13px'; ring.style.borderWidth = '1.5px';
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { ring.style.opacity = '0'; dot.style.opacity = '0'; });
    window.addEventListener('blur', function () { ring.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('pointerdown', ripple, { passive: true });
  }

  /* ---------- floating contact dock: only visible in the scrolled middle of the page ---------- */
  function dock() {
    var d = document.querySelector('[data-adfs-dock]');
    if (!d) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight;
    var narrow = window.innerWidth <= 820;
    var pastHero = y > vh * (narrow ? 0.18 : 0.35);
    var f = document.querySelector('footer');
    var footerTop = f ? f.getBoundingClientRect().top : Infinity;
    var nearFooter = narrow ? footerTop < vh * 0.42 : (y + vh > docH - vh * 0.55);
    var on = pastHero && !nearFooter;
    d.style.opacity = on ? '1' : '0';
    d.style.visibility = on ? 'visible' : 'hidden';
    d.style.transform = on ? 'translateY(0)' : 'translateY(26px)';
  }
  window.addEventListener('resize', dock);
  window.addEventListener('scroll', dock, { passive: true });
  document.addEventListener('DOMContentLoaded', dock);
  window.addEventListener('load', dock);
  [300, 900, 1800, 3000].forEach(function (t) { setTimeout(dock, t); });

  /* ---------- page exit veil ---------- */
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || href.charAt(0) === '#' || /^(mailto:|tel:|https?:|blob:|data:|javascript:|whatsapp:|sms:)/i.test(href)) return;
      if (a.hasAttribute('download') || a.hasAttribute('data-no-veil')) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
      // same page, different section: let the browser scroll
      var u = new URL(href, location.href);
      if (u.pathname === location.pathname && u.search === location.search && u.hash) return;
      e.preventDefault();
      var veil = document.createElement('div');
      veil.setAttribute('aria-hidden', 'true');
      veil.setAttribute('data-adfs-veil', '');
      veil.style.cssText = 'position:fixed;inset:0;z-index:2147481000;background:#0A2347;opacity:0;transition:opacity .42s ease;pointer-events:none';
      var bar = document.createElement('div');
      bar.style.cssText = 'position:absolute;left:0;right:0;top:0;height:2px;background:#D3222A;transform-origin:left center;transform:scaleX(0);transition:transform .42s cubic-bezier(.22,.61,.36,1)';
      veil.appendChild(bar);
      document.documentElement.appendChild(veil);
      requestAnimationFrame(function () { veil.style.opacity = '1'; bar.style.transform = 'scaleX(1)'; });
      setTimeout(function () { window.location.href = href; }, 430);
      setTimeout(function () { if (veil.parentNode) veil.remove(); }, 1500);
    });
  }
  // Back/forward restores the page from cache with the veil still on — clear it.
  function clearVeils() { document.querySelectorAll('[data-adfs-veil]').forEach(function (v) { v.remove(); }); }
  window.addEventListener('pageshow', clearVeils);
  window.addEventListener('pagehide', function () { setTimeout(clearVeils, 0); });
  window.addEventListener('popstate', clearVeils);
  document.addEventListener('visibilitychange', clearVeils);

  /* ---------- [data-pill] buttons: pointer glow, one sheen sweep, click ripple ---------- */
  function pill(e) { return e.target && e.target.closest && e.target.closest('[data-pill]'); }
  function dress(el) {
    if (el.__adfsPill) return;
    el.__adfsPill = true;
    var g = document.createElement('span'); g.className = 'adfs-pill-glow'; g.setAttribute('aria-hidden', 'true');
    var s = document.createElement('span'); s.className = 'adfs-pill-sheen'; s.setAttribute('aria-hidden', 'true');
    el.insertBefore(s, el.firstChild); el.insertBefore(g, el.firstChild);
  }
  document.addEventListener('mouseover', function (e) { var el = pill(e); if (el) dress(el); });
  document.addEventListener('mousemove', function (e) {
    var el = pill(e); if (!el) return;
    dress(el);
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    el.style.setProperty('--glow', '1');
    if (!el.__sh && !reduce) { el.__sh = true; el.style.setProperty('--sx', '360%'); }
  });
  document.addEventListener('mouseout', function (e) {
    var el = pill(e);
    if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    el.__sh = false;
    ['--glow', '--sx'].forEach(function (p) { el.style.removeProperty(p); });
  });
  document.addEventListener('click', function (e) {
    var el = pill(e); if (!el || reduce) return;
    var r = el.getBoundingClientRect(), d = document.createElement('span'), z = Math.max(r.width, r.height) * 2.4;
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;z-index:-1;left:' + (e.clientX - r.left) + 'px;top:' + (e.clientY - r.top) + 'px;width:' + z + 'px;height:' + z + 'px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, rgba(255,255,255,.5), rgba(157,192,238,.2) 50%, transparent 70%);animation:adfsPillRipple .7s cubic-bezier(.22,.61,.36,1) forwards';
    el.appendChild(d);
    setTimeout(function () { d.remove(); }, 720);
  }, true);
})();
