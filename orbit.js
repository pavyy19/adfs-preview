/* AD Financial Services — 3D services carousel, ported from the PMA website (assets/orbit.js).
   [data-orbit] stage > [data-orbit-ring] > [data-orbit-card] x n; [data-orbit-prev] / [data-orbit-next] buttons.
   Spins slowly by itself, steers with the pointer, drags on touch, and the arrows step one card. */
(function () {
  if (window.__adfsOrbit) return;
  window.__adfsOrbit = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(stage) {
    if (stage.__orbit) return;
    var ring = stage.querySelector('[data-orbit-ring]');
    if (!ring) return;
    var cards = ring.querySelectorAll('[data-orbit-card]');
    if (cards.length < 3) return;
    stage.__orbit = true;

    var n = cards.length, step = 360 / n, R = 300, angle = 0, target = null;
    var AUTO = reduce ? 0 : -8, MAXS = 28, last = performance.now(), speed = AUTO, steer = null, drag = null, moved = 0, vel = 0, pause = 0;

    function layout() {
      var w = stage.clientWidth, vh = window.innerHeight || 800;
      var hdr = 0; document.querySelectorAll('header, [data-section-bar]').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < 140) hdr = Math.max(hdr, r.bottom); });
      var budget = Math.max(150, vh - hdr - 300);
      var cw = Math.max(170, Math.min(250, w * 0.2, (budget - 70) / 0.86));
      var ch = Math.round(cw * 0.86);
      R = Math.round((cw * 1.45 * n) / (2 * Math.PI));
      ring.style.width = cw + 'px';
      ring.style.height = ch + 'px';
      stage.style.height = Math.round(ch + 110) + 'px';
    }

    function paint() {
      ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + angle + 'deg)';
      for (var i = 0; i < n; i++) {
        var f = Math.cos(((i * step + angle) * Math.PI) / 180);
        var lift = Math.max(0, (f - 0.82) / 0.18) * 30;
        cards[i].style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + (R + lift) + 'px)';
        var op = f <= 0.02 ? 0 : 0.28 + 0.72 * f * f;
        cards[i].style.opacity = op.toFixed(3);
        cards[i].style.visibility = op ? 'visible' : 'hidden';
        cards[i].style.pointerEvents = f > 0.55 ? 'auto' : 'none';
        cards[i].style.zIndex = String(Math.round((f + 1) * 50));
      }
    }

    function tick() {
      var now = performance.now(), dt = Math.min(0.05, (now - last) / 1000), k = 1 - Math.pow(0.0015, dt);
      last = now;
      if (!drag) {
        if (target !== null) {
          var d = ((target - angle + 540) % 360) - 180;
          angle += d * Math.min(1, dt * 7);
          if (Math.abs(d) < 0.15) { angle = target; target = null; pause = performance.now() + 2500; }
        } else {
          var want = AUTO;
          if (steer !== null) want = Math.abs(steer) < 0.3 ? 0 : -((steer - Math.sign(steer) * 0.3) / 0.7) * MAXS;
          if (now < pause) want = 0;
          speed += (want - speed) * k;
          vel *= Math.pow(0.02, dt);
          angle += (speed + vel) * dt;
        }
      }
      paint();
      requestAnimationFrame(tick);
    }

    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = stage.getBoundingClientRect();
      steer = ((e.clientX - r.left) / r.width) * 2 - 1;
    });
    stage.addEventListener('pointerleave', function () { steer = null; });
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('[data-orbit-prev],[data-orbit-next]')) return;
      drag = { x: e.clientX, a: angle }; moved = 0; target = null; vel = 0; speed = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      moved = Math.max(moved, Math.abs(dx));
      var na = drag.a + dx * 0.3;
      vel = Math.max(-120, Math.min(120, (na - angle) * 30));
      angle = na;
    });
    window.addEventListener('pointerup', function () { if (drag) { drag = null; pause = performance.now() + 1500; } });
    stage.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);

    function nearest() { return Math.round(-angle / step); }
    function go(dir) {
      var base = target !== null ? Math.round(-target / step) : nearest();
      target = -(base + dir) * step;
      speed = 0; vel = 0;
    }
    var prev = stage.querySelector('[data-orbit-prev]'), next = stage.querySelector('[data-orbit-next]');
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    for (var k = 0; k < n; k++) (function (i) {
      cards[i].addEventListener('focus', function () { target = -i * step; });
    })(k);

    layout(); paint();
    window.addEventListener('resize', layout);
    requestAnimationFrame(tick);
  }

  function scan() { document.querySelectorAll('[data-orbit]').forEach(init); }
  if (document.readyState !== 'loading') scan();
  document.addEventListener('DOMContentLoaded', scan);
  new MutationObserver(function () { setTimeout(scan, 60); }).observe(document.documentElement, { childList: true, subtree: true });
})();
