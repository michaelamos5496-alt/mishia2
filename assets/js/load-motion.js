/* Loads GSAP + ScrollTrigger (+ Lenis smooth scrolling on mouse computers) after the page has finished loading,
   then motion.js. Skipped on data-saver, 2G and "reduce motion". The page works fine without any of it. */
(function () {
  var m = window.matchMedia, c = navigator.connection || {};
  if ((m && m('(prefers-reduced-motion: reduce)').matches) || c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) return;
  var fine = m && m('(hover: hover) and (pointer: fine)').matches;
  function load(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = no;
      document.head.appendChild(s);
    });
  }
  function go() {
    load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
      .then(function () { return load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'); })
      .then(function () { return fine ? load('https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js').catch(function () {}) : null; })
      .then(function () { return load('assets/js/motion.js'); })
      .catch(function () {});
  }
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();
