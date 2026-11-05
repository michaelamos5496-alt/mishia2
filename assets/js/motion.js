/* =====================================================================
   Mi Shia Foundation: GSAP scroll animations and effects
   Loaded by load-motion.js after the page, and only for visitors who have not asked
   for less motion or a data saver. Needs gsap + ScrollTrigger; Lenis is optional.
   Computers get the full set, phones a lighter one (no scrubbed parallax, no magnets).
   ===================================================================== */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.documentElement.classList.add('gsap-on');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- smooth scrolling (Lenis) on computers with a mouse ---- */
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
  /* things that change the page height need ScrollTrigger to measure again */
  $$('[role="tab"], #founder-more, .faq-list summary').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(function () { ScrollTrigger.refresh(); }, 120); });
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

  /* ---- helpers ---- */
  // hand an element over from the plain CSS fade-in (.reveal) to GSAP
  function take(list) {
    [].concat(list).forEach(function (el) { if (el) { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; } });
  }
  // wrap every word in a mask so it can rise out of it (keeps child tags such as the highlighter)
  function splitWords(root) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var m = document.createElement('span'); m.className = 'w-mask'; m.setAttribute('aria-hidden', 'true');
            var w = document.createElement('span'); w.className = 'w'; w.textContent = p;
            m.appendChild(w); frag.appendChild(m); out.push(w);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && !ch.classList.contains('w-mask')) { walk(ch); }
      });
    })(root);
    return out;
  }
  // words rise out of their masks; the highlighter strokes draw themselves afterwards
  function headline(el, onScroll, delay) {
    if (!el) return null;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var words = splitWords(el), marks = $$('.mark', el);
    var tl = gsap.timeline({ scrollTrigger: onScroll ? { trigger: el, start: 'top 88%', once: true } : null, delay: delay || 0 });
    tl.from(words, { yPercent: 115, rotate: 3, transformOrigin: '0% 100%', duration: 1, ease: 'power4.out', stagger: 0.06 });
    if (marks.length) tl.from(marks, { backgroundSize: '0% 100%', duration: 0.9, ease: 'power2.inOut', stagger: 0.2 }, '-=0.45');
    return tl;
  }
  // the rest of a text block (everything but the headline) fades up
  function fadeKids(box, trigger) {
    var kids = Array.prototype.slice.call(box.children).filter(function (k) { return !/^H[12]$/.test(k.tagName); });
    if (!kids.length) return;
    gsap.from(kids, { y: 34, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'all',
      scrollTrigger: { trigger: trigger || box, start: 'top 85%', once: true } });
  }

  /* ---- 1. scroll progress line ---- */
  var bar = document.createElement('div'); bar.className = 'scroll-progress'; document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.15 } });

  /* ---- 2. hero intro (home) ---- */
  var hero = $('.hero');
  if (hero) {
    headline($('.hero h1'), false, 0.1);
    gsap.from('.hero-copy .kicker', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' });
    gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.55, clearProps: 'all' });
    gsap.from('.hero-cta .btn', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.75, clearProps: 'all' });
    gsap.from('.strip-facts, .strip-give', { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.95, clearProps: 'all' });
    gsap.from('.hero-media', { scale: 1.12, duration: 2.2, ease: 'power2.out', clearProps: 'transform' });
    var cta = $('.hero-cta .btn-cta');
    if (cta) gsap.fromTo(cta, { boxShadow: '0 0 0 0 rgba(214,63,40,.55)' }, { boxShadow: '0 0 0 16px rgba(214,63,40,0)', duration: 1.5, repeat: 2, delay: 2.2, ease: 'power2.out', clearProps: 'boxShadow' });
  }
  /* projects page header */
  if ($('.phero')) {
    headline($('.phero h1'), false, 0.1);
    gsap.from('.phero .crumbs, .phero .kicker, .phero-sub, .phero .row-cta', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.3, clearProps: 'all' });
    gsap.from('.jump a', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.8, clearProps: 'all' });
  }

  /* ---- 3. section headlines + the text blocks around them ---- */
  $$('.section-head h2, .about-copy h2, .vision-copy h2, .founder-copy h2, .faq-intro h2, .band-title, .sf-intro h2, .contact-copy h2')
    .forEach(function (el) { headline(el, true); });
  $$('.section-head, .about-copy, .vision-copy, .founder-copy, .faq-intro, .contact-copy, .sf-intro').forEach(function (box) {
    take(box); fadeKids(box);
  });

  /* ---- 4. cards deal in (staggered), replacing the plain fade ---- */
  [['.proj-grid .proj', '.proj-grid'], ['.ways .way', '.ways'], ['.band-grid li', '.band-grid'], ['.hexcards .hexcard', '.hexcards'], ['.join-card', '.join-grid'], ['.tri-grid > *', '.tri-grid'], ['.polaroids li', '.polaroids'],
   ['.news-grid .news-card', '.news-grid'], ['.faq-list details', '.faq-list'], ['.objectives li', '.objectives']].forEach(function (pair) {
    var els = $$(pair[0]); if (!els.length) return;
    take(els); take($(pair[1]));
    gsap.from(els, { y: 60, opacity: 0, scale: 0.96, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'all',
      scrollTrigger: { trigger: pair[1], start: 'top 88%', once: true } });
  });

  /* ---- 5. feature blocks: photo curtain + text rises ---- */
  $$('.feature, .pj').forEach(function (box) {
    take(box);
    var img = $('img', box), body = $('.feature-body, .pj-body', box);
    if (img) gsap.from(img, { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath',
      scrollTrigger: { trigger: box, start: 'top 82%', once: true } });
    if (body) gsap.from(Array.prototype.slice.call(body.children), { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'all',
      scrollTrigger: { trigger: box, start: 'top 72%', once: true } });
  });
  $$('.about-cluster, .donate-photo, .donate-card, .founder-photos, .vision-side, .map-card, .form').forEach(function (el) {
    take(el);
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ---- 6. numbers count up; the "Since 2019" badge pops ---- */
  $$('.band-grid strong').forEach(function (el) {
    var txt = el.textContent, num = parseInt(txt, 10), suffix = txt.replace(/[0-9]/g, '');
    if (!num || num > 1000) return;
    var o = { n: 0 };
    gsap.to(o, { n: num, duration: 1.6, ease: 'power2.out', snap: { n: 1 }, delay: 0.2,
      onStart: function () { el.textContent = '0' + suffix; },
      onUpdate: function () { el.textContent = o.n + suffix; },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('.about-badge').forEach(function (b) {
    gsap.from(b, { scale: 0.6, rotate: -8, opacity: 0, duration: 1, ease: 'back.out(2)', delay: 0.3, clearProps: 'all', scrollTrigger: { trigger: b, start: 'top 92%', once: true } });
  });

  /* ---- 7. computers: parallax, zooms, magnetic buttons ---- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    if (hero) {
      gsap.to('.hero-media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-copy', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true } });
    }
    $$('.proj img, .feature img, .pj img, .vision-side img, .fp-main').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'center center', scrub: true } });
    });
    if ($('.fp-small')) gsap.fromTo('.fp-small', { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.founder', start: 'top bottom', end: 'bottom top', scrub: true } });
    if ($('.foot-word')) gsap.fromTo('.foot-word span', { yPercent: -45 }, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    if ($('.tilebox')) gsap.fromTo('.tilebox', { y: -30 }, { y: 30, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
    if (fine) {
      $$('.btn, .link-arrow').forEach(function (el) {
        el.classList.add('mag');
        var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        var qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          qx((e.clientX - (r.left + r.width / 2)) * 0.25);
          qy((e.clientY - (r.top + r.height / 2)) * 0.35);
        });
        el.addEventListener('pointerleave', function () { qx(0); qy(0); });
      });
    }
  });

  ScrollTrigger.refresh();
})();
