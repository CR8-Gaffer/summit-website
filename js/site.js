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
