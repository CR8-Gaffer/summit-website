/* Summit — shared site behaviour: nav state, scroll reveals, hero video. */
(function () {
  var reduced = document.documentElement.classList.contains('reduced');

  // nav goes solid past the fold
  var nav = document.getElementById('nav');
  if (nav) {
    var always = nav.classList.contains('solid'); // inner pages author 'solid'; never strip it
    var onScroll = function () { nav.classList.toggle('solid', always || window.scrollY > 40); };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  // hero video (home): fade in once it can play
  var v = document.getElementById('herovideo');
  if (v && !reduced) {
    var p = v.play();
    if (p && p.then) p.then(function () { v.classList.add('on'); }).catch(function () {});
    else v.classList.add('on');
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
