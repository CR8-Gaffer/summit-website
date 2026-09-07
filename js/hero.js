/* Summit — home hero (Concept A): one staged entrance, the certificate prints, then a bounded pointer tilt.
   Runs after the vendored GSAP core (deferred). Four nets: no GSAP → the CSS pre-hide lifts at once; reduced motion →
   final state, no timeline; hero.js never runs → the head watchdog lifts the pre-hide at 2.8s (it stands down once the
   timeline is live); the timeline starts but never completes → this file's own 3.4s fallback prints the final state.
   `hero-late` is the single "final state" signal — CSS restores EVERYTHING the timeline pre-hides, not just the copy. */
(function () {
  var d = document.documentElement, hero = document.querySelector('.hero-a');
  if (!hero) return;
  if (!window.gsap) { d.classList.remove('js'); return; }
  if (d.classList.contains('reduced')) { d.classList.add('hero-late'); return; }
  // re-entry guard: if the final state has already been printed (watchdog fired first, or this file ran twice),
  // never re-hide what the reader can already see — arm the tilt and stop
  if (d.classList.contains('hero-late')) { enableTiltLate(); return; }

  var obj = hero.querySelector('.hspec'), tilt = document.getElementById('htilt'), paper = hero.querySelector('.cert-hero');
  if (!obj || !paper) { d.classList.add('hero-late'); return; }
  var fine = false;
  try { fine = matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}

  // initial states — opacity / transform / clip-path only, never layout
  gsap.set('.hero-a .hfloor', { opacity: 0 });
  gsap.set(obj, { opacity: 0, y: 28, rotateX: 6, transformPerspective: 1600 });
  gsap.set('.hero-a [data-hx]:not([data-hx="obj"])', { opacity: 0, y: 14 });
  gsap.set(paper, { '--rule': 0 });
  gsap.set('.cert-hero .creg-read tbody tr, .cert-hero .attr, .cert-hero .creg-reg tbody tr', { opacity: 0, y: 6 });
  gsap.set('.cert-hero .pr', { clipPath: 'inset(0 100% 0 0)' });
  gsap.set('.cert-hero td.st, .cert-hero td.fl', { opacity: 0 });
  gsap.set('.cert-hero .seal', { opacity: 0, scale: 1.15, transformOrigin: '50% 50%' });
  gsap.set('.cert-hero .wm-spec', { opacity: 0 });

  d.classList.add('hero-live');                                                          // the head watchdog stands down
  var done = false;
  function finish() { if (done) return; done = true; d.classList.add('hero-late'); enableTilt(); }
  setTimeout(finish, 3400);                                                                // timeline ends at 2.5s; a stalled one never leaves the sheet blank
  var tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: finish
  });
  tl.to('.hero-a .hfloor', { opacity: .9, duration: 1.4, ease: 'power1.out' }, 0)
    .to(obj, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'expo.out' }, .05)   // the protagonist moves most
    .to('.hero-a h1', { opacity: 1, y: 0, duration: .7 }, .05)                          // H1 early: it is the LCP element
    .to('.hero-a .hloc', { opacity: 1, y: 0, duration: .5 }, .20)
    .to('.hero-a .hchips', { opacity: 1, y: 0, duration: .5 }, .35)
    .to('.hero-a .sub', { opacity: 1, y: 0, duration: .6 }, .45)
    .to('.hero-a .cta-row', { opacity: 1, y: 0, duration: .5 }, .55)
    // print: header rule, rows, numerals wipe, status, attribution, register, seal stamps, watermark last
    .to(paper, { '--rule': 1, duration: .5 }, .55)
    .to('.cert-hero .creg-read tbody tr', { opacity: 1, y: 0, duration: .35, stagger: .06 }, .80)
    .to('.cert-hero .creg-read .pr', { clipPath: 'inset(0 0% 0 0)', duration: .3, ease: 'power2.out', stagger: .05 }, .85)
    .to('.cert-hero .creg-read td.st, .cert-hero .creg-read td.fl', { opacity: 1, duration: .3, stagger: .06 }, 1.0)
    .to('.cert-hero .attr', { opacity: 1, y: 0, duration: .4 }, 1.35)
    .to('.cert-hero .creg-reg tbody tr', { opacity: 1, y: 0, duration: .35, stagger: .08 }, 1.5)
    .to('.cert-hero .seal', { opacity: 1, scale: 1, duration: .18, ease: 'power2.out' }, 1.75)
    .to('.cert-hero .wm-spec', { opacity: 1, duration: .6 }, 1.9);                        // ends 2.5s; nothing after

  // pointer tilt: fine pointers only, ≤4° / 6px, lerp .10, specular follows the cursor, springs back on leave
  function enableTiltLate() { obj = hero.querySelector('.hspec'); tilt = document.getElementById('htilt'); paper = hero.querySelector('.cert-hero');
    try { fine = matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {} if (obj && paper) enableTilt(); }
  function enableTilt() {
    if (!tilt || !fine) return;
    var MAX = 4, tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, inside = false;
    function frame() {
      cx += (tx - cx) * .10; cy += (ty - cy) * .10;
      tilt.style.setProperty('--ry', (cx * MAX).toFixed(2) + 'deg');
      tilt.style.setProperty('--rx', (-cy * MAX).toFixed(2) + 'deg');
      tilt.style.setProperty('--tx', (cx * 6).toFixed(1) + 'px');
      tilt.style.setProperty('--ty', (cy * 6).toFixed(1) + 'px');
      paper.style.setProperty('--gx', (50 + cx * 35).toFixed(1) + '%');
      paper.style.setProperty('--gy', (35 + cy * 35).toFixed(1) + '%');
      paper.style.setProperty('--go', inside ? '.9' : '0');
      raf = (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) ? requestAnimationFrame(frame) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    obj.addEventListener('pointermove', function (e) {
      var r = obj.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
      inside = true; tilt.classList.add('is-live'); kick();
    });
    obj.addEventListener('pointerleave', function () {
      tx = 0; ty = 0; inside = false; tilt.classList.remove('is-live'); kick();
    });
  }

  // drift: the sheet eases up 24px over the hero's height — fine pointers only, passive rAF, its own property (translate),
  // so it never touches GSAP's transform or the tilt's
  if (fine) {
    var t = 0;
    addEventListener('scroll', function () {
      if (t) return;
      t = requestAnimationFrame(function () {
        t = 0;
        var h = hero.offsetHeight || 1, p = Math.min(1, Math.max(0, scrollY / h));
        obj.style.setProperty('--drift', (-24 * p).toFixed(1) + 'px');
      });
    }, { passive: true });
  }
})();
