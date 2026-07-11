/* ============================================================
   Summit — KES scroll-scrub engine (exhaust page)
   Lenis + GSAP ScrollTrigger scrub a canvas frame sequence.
   Frames are re-graded DARK at draw time so the studio backdrop
   matches the site's near-black; the exact graded backdrop colour
   is sampled and published to --kesbg so every section on the page
   shares it and the whole thing scrolls with no visible seam.
   ============================================================ */
(function () {
  'use strict';
  var reduced = document.documentElement.classList.contains('reduced');

  var canvas  = document.getElementById('kes');
  var ctx     = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  var loader  = document.getElementById('loader');
  var bar     = document.getElementById('lbar');
  var pct     = document.getElementById('lpct');
  var nav     = document.getElementById('nav');
  var heroIn  = document.querySelector('.kes-hero .inner');
  var cue     = document.getElementById('cue');
  var pillars = Array.prototype.slice.call(document.querySelectorAll('.pillar'));

  // grade that pulls the grey studio backdrop down to near-black while the
  // brushed-steel object stays legible (moody, matches the dark site).
  var GRADE = 'contrast(1.62) brightness(0.76) saturate(0.72)';

  var SCRUB_START = 0.15, SCRUB_END = 0.86, FALLBACK_COUNT = 120;
  var frames = [], FRAME_COUNT = FALLBACK_COUNT, EXT = 'webp', cur = -1;
  var bgColor = '#141A1F';
  // frame stepper: scroll sets a TARGET frame; a ticker walks the drawn frame
  // toward it a step at a time, so the sequence always plays through in order
  // instead of bulk-jumping on fast wheel deltas.
  var pos = 0, targetPos = 0, stepping = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function url(i) { return 'frames/frame_' + String(i + 1).padStart(4, '0') + '.' + EXT; }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  }

  function draw(i) {
    var img = frames[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var vw = canvas.clientWidth, vh = canvas.clientHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.filter = 'none';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, vw, vh);
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var margin = vw < 820 ? 0.98 : 0.9;
    var scale = Math.min(vw / iw, vh / ih) * margin;
    var dw = iw * scale, dh = ih * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = GRADE;                       // darken the frame to match the site
    ctx.drawImage(img, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
    ctx.filter = 'none';
  }

  function redraw() { if (cur >= 0) draw(cur); }
  function refit() { sizeCanvas(); redraw(); }

  // Sample the GRADED backdrop band that actually meets the letterbox fill.
  // The object is centred, so the top strip of the frame is pure backdrop —
  // grading it and using THAT as the fill + --kesbg makes the frame edge and
  // every page section the same colour, so there's no visible frame rectangle.
  function sampleBg(img) {
    try {
      var W = 64, H = 36;
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var cx = c.getContext('2d');
      cx.filter = GRADE;
      cx.drawImage(img, 0, 0, W, H);
      cx.filter = 'none';
      var d = cx.getImageData(0, 0, W, 5).data, r = 0, g = 0, b = 0, n = 0; // top backdrop band
      for (var p = 0; p < d.length; p += 4) { r += d[p]; g += d[p + 1]; b += d[p + 2]; n++; }
      bgColor = 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
      document.documentElement.style.setProperty('--kesbg', bgColor);
    } catch (e) { /* keep fallback + CSS fallback */ }
  }

  function hideLoader() { if (loader) loader.classList.add('done'); }

  function poster() {
    var img = new Image();
    img.onload = function () { frames[0] = img; sampleBg(img); sizeCanvas(); cur = 0; draw(0); hideLoader(); };
    img.onerror = hideLoader;
    img.src = url(0);
    window.addEventListener('resize', refit, { passive: true });
  }

  function preload() {
    return new Promise(function (resolve) {
      var loaded = 0;
      function done() {
        loaded++;
        var f = loaded / FRAME_COUNT;
        if (bar) bar.style.width = (f * 100) + '%';
        if (pct) pct.textContent = Math.round(f * 100) + '%';
        if (loaded >= FRAME_COUNT) resolve();
      }
      for (var i = 0; i < FRAME_COUNT; i++) {
        (function (idx) {
          var img = new Image();
          img.onload = function () {
            if (idx === 0) { sampleBg(img); sizeCanvas(); cur = 0; draw(0); }
            done();
          };
          img.onerror = done;
          img.src = url(idx);
          frames[idx] = img;
        })(i);
      }
    });
  }

  function render(p, immediate) {
    var t = clamp((p - SCRUB_START) / (SCRUB_END - SCRUB_START), 0, 1);
    targetPos = t * (FRAME_COUNT - 1);
    if (immediate || !stepping) {
      pos = targetPos;
      var idx = Math.min(FRAME_COUNT - 1, Math.round(pos));
      if (idx !== cur) { cur = idx; draw(idx); }
    }
    var h = clamp((p - 0.02) / 0.12, 0, 1);
    if (heroIn) {
      heroIn.style.opacity = (1 - h).toFixed(3);
      heroIn.style.transform = 'translateY(' + (-46 * h).toFixed(1) + 'px)';
    }
    if (cue) cue.style.opacity = p > 0.03 ? '0' : '1';
    if (nav) nav.classList.toggle('solid', p > 0.012);
    for (var i = 0; i < pillars.length; i++) {
      var pil = pillars[i], inP = parseFloat(pil.dataset.in), outP = parseFloat(pil.dataset.out);
      var on = p >= inP && p <= outP;
      if (on !== pil.classList.contains('show')) pil.classList.toggle('show', on);
    }
  }

  // one tick of the stepper: near the target it moves <1 frame per tick
  // (strictly sequential draws); far away it accelerates, capped at ~2.4
  // frames per 60Hz-normalised tick so a full-page jump catches up in about
  // a second regardless of display refresh rate.
  function stepFrames(time, deltaTime) {
    var diff = targetPos - pos;
    if (diff !== 0) {
      var mag = Math.abs(diff);
      if (mag < 0.05) {
        pos = targetPos;
      } else {
        var k = Math.min((deltaTime || 16.67) / 16.67, 3);
        var step = Math.min(mag, Math.max(0.9 * k, mag * 0.11 * k), 2.4 * k);
        pos += (diff > 0 ? step : -step);
      }
    }
    var idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(pos)));
    if (idx !== cur) { cur = idx; draw(idx); }
  }

  function initScroll() {
    sizeCanvas(); // never depend on frame 0's load success for canvas sizing
    if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
      cur = 0; draw(0); window.addEventListener('resize', refit, { passive: true }); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    var lenis = new Lenis({ duration: 1.15, easing: function (x) { return Math.min(1, 1.001 - Math.pow(2, -10 * x)); }, smoothWheel: true, touchMultiplier: 1.5 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    // stepper registered AFTER lenis.raf so each tick steps toward the
    // targetPos computed from that same tick's scroll update (no added lag)
    stepping = true;
    gsap.ticker.add(stepFrames);
    gsap.ticker.lagSmoothing(0);
    var st = ScrollTrigger.create({ trigger: '.kes-exp', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: function (self) { render(self.progress); } });
    window.addEventListener('resize', function () { refit(); ScrollTrigger.refresh(); }, { passive: true });
    render(st.progress, true); // honour scroll restoration / mid-page anchors
  }

  function snapshot(p) { document.body.classList.add('snap'); sizeCanvas(); render(p, true); }

  function start() {
    if (reduced) { poster(); return; }
    var shot = /[?&]shot=([0-9.]+)/.exec(location.search);
    fetch('frames/manifest.json').then(function (r) { return r.json(); })
      .then(function (m) { if (m && m.count) FRAME_COUNT = m.count; if (m && m.ext) EXT = m.ext; })
      .catch(function () {})
      .then(function () { return preload(); })
      .then(function () { hideLoader(); if (shot) snapshot(clamp(parseFloat(shot[1]), 0, 1)); else initScroll(); });
  }

  if (!canvas) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
