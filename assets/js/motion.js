/* GSAP + ScrollTrigger effects (and Lenis smooth scrolling on mouse computers).
   Loaded after the page, never on data-saver / 2G / reduced motion. The page works fine without this file. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (window.Lenis && fine) {
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('dialog').forEach(function (d) { d.setAttribute('data-lenis-prevent', ''); });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (id === '#home') lenis.scrollTo(0, { duration: 1.3 }); else window.__scrollToEl(t);
    });
  }
  ['[role="tab"]', '#founder-more'].forEach(function (s) { $$(s).forEach(function (b) { b.addEventListener('click', function () { setTimeout(function () { ScrollTrigger.refresh(); }, 90); }); }); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  // scroll progress line
  var bar = document.createElement('div'); bar.className = 'scroll-progress'; document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.15 } });

  // hero text rises in
  gsap.from('.hero-copy > *', { y: 34, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.1, clearProps: 'all' });
  gsap.from('.hero-card', { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.5, clearProps: 'all' });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    // computers only: the hero picture drifts slower than the page, photos ease in
    gsap.to('.hero-media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.proj img, .feature img, .about-photo img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'center center', scrub: true } });
    });
    $$('.band-grid strong').forEach(function (el) {
      var txt = el.textContent, num = parseInt(txt, 10), suffix = txt.replace(/[0-9]/g, '');
      if (!num || num > 1000) return;
      var o = { n: 0 };
      gsap.to(o, { n: num, duration: 1.6, ease: 'power2.out', snap: { n: 1 }, onUpdate: function () { el.textContent = o.n + suffix; },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  });
})();
