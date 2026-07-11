/* Summit — shared site behaviour: nav state, scroll reveals, hero video. */
(function () {
  var reduced = document.documentElement.classList.contains('reduced');

  // nav goes solid past the fold
  var nav = document.getElementById('nav');
  if (nav) {
    var always = nav.classList.contains('solid'); // inner pages author 'solid'; never strip it
    var lastY = window.scrollY;
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle('solid', always || y > 40);
      // slip away scrolling down, return on scroll-up or near the top;
      // a small delta gate stops trackpad micro-jitter from flickering it
      if (Math.abs(y - lastY) > 6) {
        nav.classList.toggle('hide', y > lastY && y > 160);
        lastY = y;
      }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    nav.addEventListener('focusin', function () { nav.classList.remove('hide'); }); // keyboard users always reach it
  }

  // hero video (home): fade in once it's actually playing; retry politely if
  // the first autoplay attempt is deferred (visibility, power saving, policy).
  var v = document.getElementById('herovideo');
  if (v && !reduced) {
    v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
    if (!v.paused && v.readyState >= 3) v.classList.add('on');
    var tryPlay = function () {
      if (!v.paused) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    };
    tryPlay();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tryPlay(); });
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      addEventListener(ev, tryPlay, { once: true, passive: true });
    });
  }

  // scroll reveals
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv:not(.in)').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }
})();
