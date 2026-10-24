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
      addEventListener('resize', function () { if (innerWidth > 1024) setMenu(false); });
    }
  }
  // system explainer (home): highlight the chosen part, show its panel; without this script every panel is visible
  var sysx = document.querySelector('.sysx');
  if (sysx) {
    document.documentElement.classList.add('sysx-on');
    var btns = sysx.querySelectorAll('.sysx-btn');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        sysx.setAttribute('data-sel', b.getAttribute('data-key'));
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  }
  // table scroll cue only where a table really overflows
  var cue = function () {
    document.querySelectorAll('.tscroll').forEach(function (t) { t.classList.toggle('can-scroll', t.scrollWidth > t.clientWidth + 1); });
  };
  cue(); addEventListener('resize', cue);
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
