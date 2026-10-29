/* Summit — shared site behaviour v2: mobile menu, scroll reveals, enquiry-source tagging. No libraries. */
(function () {
  var reduced = document.documentElement.classList.contains('reduced');
  var nav = document.getElementById('nav');
  if (nav) {
    var burger = nav.querySelector('.navtoggle'), panel = nav.querySelector('.navpanel');
    if (burger && panel) {
      var setMenu = function (open) {
        nav.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
      panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });
      document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false); });
      nav.addEventListener('focusout', function (e) { if (nav.classList.contains('open') && (!e.relatedTarget || !nav.contains(e.relatedTarget))) setMenu(false); });
      addEventListener('resize', function () { if (innerWidth > 1024) setMenu(false); });
    }
  }
  // system explainer (home): highlight the chosen part, show its panel; without this script every panel is visible
  var sysx = document.querySelector('.sysx');
  if (sysx) {
    document.documentElement.classList.add('sysx-on');
    var btns = sysx.querySelectorAll('.sysx-btn');
    var pick = function (key) {
      var hit = false;
      btns.forEach(function (x) { var on = x.getAttribute('data-key') === key; x.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) hit = true; });
      if (hit) sysx.setAttribute('data-sel', key);
      return hit;
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (pick(b.getAttribute('data-key')) && history.replaceState) history.replaceState(null, '', '#scope-' + b.getAttribute('data-key'));
      });
    });
    var m = /^#scope-([a-z]+)$/.exec(location.hash);
    if (m && pick(m[1])) sysx.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }
  // phone action bar: hidden while the hero's own survey button is on screen
  var heroCta = document.querySelector('.hero .cta-row .btn');
  if (heroCta) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        document.body.classList.toggle('cta-inview', es[0].isIntersecting);
      }, { rootMargin: '0px 0px -72px 0px' }).observe(heroCta);
    } else {
      var ticking = false;
      var ctaCheck = function () {
        ticking = false;
        var r = heroCta.getBoundingClientRect();
        document.body.classList.toggle('cta-inview', r.bottom > 0 && r.top < innerHeight - 72);
      };
      ctaCheck();
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(ctaCheck); } }, { passive: true });
    }
  }
  // table scroll cue only where a table really overflows
  var tables = Array.prototype.slice.call(document.querySelectorAll('.tscroll')), cueTimer;
  var cue = function () {
    var over = tables.map(function (t) { return t.scrollWidth > t.clientWidth + 1; });   // all reads first
    tables.forEach(function (t, i) {                                                      // then all writes
      t.classList.toggle('can-scroll', over[i]);
      if (over[i]) t.setAttribute('tabindex', '0'); else t.removeAttribute('tabindex');
    });
  };
  cue(); addEventListener('resize', function () { clearTimeout(cueTimer); cueTimer = setTimeout(cue, 150); });
  // guide FAQ: a link to a question opens it
  var openFaq = function () {
    var id = location.hash.slice(1); if (!id || id.indexOf('faq-') !== 0) return;
    var d = document.getElementById(id); if (d && d.tagName === 'DETAILS') { d.open = true; }
  };
  openFaq(); addEventListener('hashchange', openFaq);
  // hero footage: sources are attached here, never in the markup, so reduced-motion and no-script visitors fetch no video
  var motionPaused = false;
  try { motionPaused = localStorage.getItem('sam-footage') === 'paused'; } catch (e) {}
  var attach = function (v) {
    if (!v || v.dataset.on) return;
    if (v.dataset.poster && !v.getAttribute('poster')) v.setAttribute('poster', v.dataset.poster);
    v.src = v.dataset.src; v.dataset.on = '1';
  };
  var playIf = function (v) { if (!v || reduced || motionPaused) return; attach(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
  var pauseBtns = Array.prototype.slice.call(document.querySelectorAll('.hpause,.vpause'));
  var paintPause = function () { pauseBtns.forEach(function (b) { b.setAttribute('aria-pressed', motionPaused ? 'true' : 'false'); b.textContent = motionPaused ? 'Play footage' : 'Pause footage'; }); };
  var setPaused = function (p) {
    motionPaused = p;
    try { localStorage.setItem('sam-footage', p ? 'paused' : 'playing'); } catch (e) {}
    paintPause();
    document.querySelectorAll('video[data-src]').forEach(function (v) {
      var panel = v.closest('.hpanel');
      if (p) { if (!v.paused) v.pause(); }
      else if (!panel || !panel.hasAttribute('inert')) playIf(v);
    });
  };
  pauseBtns.forEach(function (b) { b.addEventListener('click', function () { setPaused(!motionPaused); }); });
  paintPause();
  document.querySelectorAll('.vhero video[data-src]').forEach(playIf);
  // home hero: swipeable service panels. Arrows, dots, keyboard and touch; never advances on its own.
  var car = document.querySelector('.hcar');
  if (car) {
    var panels = Array.prototype.slice.call(car.querySelectorAll('.hpanel'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hnav .hdot'));
    var prevB = document.querySelector('.hnav .hprev'), nextB = document.querySelector('.hnav .hnext');
    var label = document.querySelector('.hnav .hlabel'), count = document.querySelector('.hnav .hcount');
    var cur = 0, pad = function (k) { return (k < 10 ? '0' : '') + k; };
    var vids = panels.map(function (p) { return p.querySelector('video'); });
    var goTimer;
    var go = function (i) {
      i = Math.max(0, Math.min(panels.length - 1, i));
      cur = i;   // keyboard repeats must step from the target, not from wherever the scroll has got to
      var left = panels[i].offsetLeft;
      if (reduced) { car.scrollTo({ left: left }); return; }
      // a smooth programmatic scroll inside a mandatory-snap container is sometimes cancelled by the snap itself
      // (seen on fresh loads): lift the snap for the duration, then land it exactly if it did not arrive
      car.style.scrollSnapType = 'none';
      car.scrollTo({ left: left, behavior: 'smooth' });
      clearTimeout(goTimer);
      goTimer = setTimeout(function () { car.style.scrollSnapType = ''; if (Math.abs(car.scrollLeft - left) > 8) car.scrollTo({ left: left }); }, 900);
    };
    var mark = function (i) {
      cur = i;
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      // aria-disabled, not disabled: a disabled button drops keyboard focus, and the arrow keys with it
      if (prevB) prevB.setAttribute('aria-disabled', i === 0 ? 'true' : 'false');
      if (nextB) nextB.setAttribute('aria-disabled', i === panels.length - 1 ? 'true' : 'false');
      if (label && dots[i]) label.textContent = dots[i].getAttribute('aria-label');
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(panels.length);
      // panels out of view are inert: Tab cannot land in them (which would drag the scroller and start their clips)
      panels.forEach(function (p, k) {
        p.classList.toggle('cur', k === i);
        // tabindex mirrors inert for the scanners that do not honour it
        var focusables = p.querySelectorAll('a, button');
        if (k === i) { p.removeAttribute('inert'); p.removeAttribute('aria-hidden'); focusables.forEach(function (f) { f.removeAttribute('tabindex'); }); }
        else { p.setAttribute('inert', ''); p.setAttribute('aria-hidden', 'true'); focusables.forEach(function (f) { f.setAttribute('tabindex', '-1'); }); }
      });
      // only the panel in view plays; the others hold their poster
      vids.forEach(function (v, k) { if (!v) return; if (k === i) playIf(v); else if (!v.paused) v.pause(); });
    };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    if (prevB) prevB.addEventListener('click', function () { go(cur - 1); });
    if (nextB) nextB.addEventListener('click', function () { go(cur + 1); });
    car.parentNode.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
    });
    if ('IntersectionObserver' in window) {
      // mark from the real scroll position, not from the entry: on a slow first paint several panels can
      // report as intersecting at once and the last one would win, leaving the wrong dot lit and two clips playing
      var cio = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) mark(Math.round(car.scrollLeft / car.clientWidth));
      }, { root: car, threshold: 0.6 });
      panels.forEach(function (p) { cio.observe(p); });
    } else {
      car.addEventListener('scroll', function () { mark(Math.round(car.scrollLeft / car.clientWidth)); }, { passive: true });
    }
    mark(0);
    if (!reduced) addEventListener('load', function () { vids.forEach(function (v) { if (v && v.dataset.poster && !v.getAttribute('poster')) v.setAttribute('poster', v.dataset.poster); }); });
  }
  // scroll reveals — fail open: nothing is hidden until this script is running and can observe
  var els = document.querySelectorAll('.rv:not(.in)');
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
})();

/* ---- carry the enquiry-source tag to the contact form (no cookies, no storage) -------------------
   A link such as /site-survey.html?src=gbp keeps its tag when the visitor clicks through to contact.html. */
(function () {
  try {
    var p = new URLSearchParams(location.search), keep = ['src', 'utm_source', 'utm_medium', 'utm_campaign'], carry = [];
    keep.forEach(function (k) { var v = p.get(k); if (v) carry.push([k, v]); });
    if (!carry.length) return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (/^(mailto:|tel:|#|https?:|\/\/)/i.test(h)) return;
      var hash = '', i = h.indexOf('#'); if (i > -1) { hash = h.slice(i); h = h.slice(0, i); }
      var q = '', j = h.indexOf('?'); if (j > -1) { q = h.slice(j + 1); h = h.slice(0, j); }
      if (!/\.html$/i.test(h)) return;
      var dest = new URLSearchParams(q);                 // destination parameters win; carried ones fill the gaps
      carry.forEach(function (kv) { if (!dest.has(kv[0])) dest.set(kv[0], kv[1]); });
      a.setAttribute('href', h + '?' + dest.toString() + hash);
    });
  } catch (e) { /* tagging must never break a page */ }
})();
