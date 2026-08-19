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

  // Masked line reveals — deliberately reserved for the one shape where they
  // read as real line-by-line motion: a section heading that carries its OWN
  // .rv trigger, has not already been revealed, and has hand-authored <br>
  // line breaks. Everything else (hero h1s, which ship pre-revealed and carry
  // a text-shadow a mask would clip; headings whose trigger is an ancestor)
  // keeps the plain block reveal — so nothing animates twice, and nothing
  // pays for a mask that can never transition.
  if (!reduced) {
    try {
      var heads = document.querySelectorAll('h1.rv, .lead-hd.rv, .ctablock h2.rv, .posn .big.rv');
      Array.prototype.forEach.call(heads, function (el) {
        if (el.classList.contains('split') || el.classList.contains('in')) return;
        var brs = el.getElementsByTagName('br');
        if (!brs.length) return;                            // no authored lines -> plain reveal
        for (var b = 0; b < brs.length; b++) {
          if (brs[b].parentNode !== el) return;             // nested <br>: too risky, skip
        }
        var lines = [[]];
        Array.prototype.forEach.call(el.childNodes, function (n) {
          if (n.nodeName === 'BR') lines.push([]);
          else lines[lines.length - 1].push(n);
        });
        lines = lines.filter(function (l) {                 // drop blanks from stray <br>
          return l.some(function (n) { return n.nodeType !== 3 || n.nodeValue.trim(); });
        });
        if (lines.length < 2) return;                       // nothing to stagger
        el.textContent = '';
        lines.forEach(function (nodeList, i) {
          var mask = document.createElement('span'); mask.className = 'ln';
          var inner = document.createElement('span'); inner.className = 'ln-i';
          inner.style.transitionDelay = (i * 0.07).toFixed(2) + 's';
          nodeList.forEach(function (n) { inner.appendChild(n); });
          mask.appendChild(inner);
          el.appendChild(mask);
        });
        el.classList.add('split');
      });
    } catch (e) { /* heading polish must never take the page reveal down with it */ }
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
