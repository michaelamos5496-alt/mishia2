/* =====================================================================
   SETTINGS THE OWNER CAN CHANGE
   DONATE_URL: when Mi Shia has a real payment / donation page, paste its web address
   between the quotes. Every button marked data-donate then goes straight to it.
   Until then those buttons open an email to the foundation.
   ===================================================================== */
var DONATE_URL = '';
var CONTACT_EMAIL = 'info@mishiafoundation.org';

// Scroll to an element: uses Lenis when it is running, the browser's own smooth scroll otherwise
function scrollToEl(el) {
  if (!el) return;
  if (window.__lenis) {
    var nav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
    window.__lenis.scrollTo(el, { offset: -nav, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.__scrollToEl = scrollToEl;

// Donate buttons
(function () {
  if (!DONATE_URL) return;
  document.querySelectorAll('[data-donate]').forEach(function (a) {
    a.href = DONATE_URL; a.target = '_blank'; a.rel = 'noopener';
  });
})();

// Nav shadow on scroll + reveal on scroll
(function () {
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var counts = new Map();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  items.forEach(function (el) {
    var g = el.parentElement, n = counts.get(g) || 0; counts.set(g, n + 1);
    if (n) el.style.transitionDelay = Math.min(n, 4) * 90 + 'ms';
    io.observe(el);
  });
})();

// Founder: "Read more" on phones
(function () {
  var btn = document.getElementById('founder-more'), s = document.getElementById('founder');
  if (!btn || !s) return;
  btn.addEventListener('click', function () {
    var open = s.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Show less' : 'Read more';
  });
})();

// Media: tabs, picture viewer, article reader
(function () {
  var section = document.getElementById('media');
  if (!section) return;
  var tabs = Array.prototype.slice.call(section.querySelectorAll('[role="tab"]'));
  var panels = {};
  tabs.forEach(function (t) { panels[t.dataset.tab] = document.getElementById(t.getAttribute('aria-controls')); });
  function showTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      showTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].dataset.tab, true);
    });
  });
  section.querySelectorAll('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.goto); }); });
  var h = (location.hash || '').replace('#', '');
  if (panels[h]) showTab(h);

  var box = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(section.querySelectorAll('.gal-item'));
  var cur = 0, opener = null;
  function showPic(i) {
    cur = (i + items.length) % items.length;
    var it = items[cur], img = document.getElementById('lb-img');
    img.src = it.dataset.full; img.alt = it.dataset.caption;
    document.getElementById('lb-cap').textContent = it.dataset.caption + '  (' + (cur + 1) + ' of ' + items.length + ')';
  }
  if (box && box.showModal) {
    items.forEach(function (it, i) { it.addEventListener('click', function () { opener = it; showPic(i); box.showModal(); }); });
    box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
    box.querySelector('.lb-prev').addEventListener('click', function () { showPic(cur - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { showPic(cur + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('close', function () { if (opener) opener.focus(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') showPic(cur - 1); if (e.key === 'ArrowRight') showPic(cur + 1); });
    var tx = null;
    box.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) showPic(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  var reader = document.getElementById('reader');
  if (reader && reader.showModal) {
    section.querySelectorAll('[data-article]').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = b.closest('.news-card');
        document.getElementById('reader-tag').innerHTML = card.querySelector('.news-tag').innerHTML;
        document.getElementById('reader-title').textContent = card.querySelector('h3').textContent;
        document.getElementById('reader-body').innerHTML = document.getElementById(b.dataset.article).innerHTML;
        reader.showModal(); reader.scrollTop = 0;
      });
    });
    reader.querySelector('.lb-close').addEventListener('click', function () { reader.close(); });
    reader.addEventListener('click', function (e) { if (e.target === reader) reader.close(); });
  }
})();

// Contact form: opens the visitor's email app with the message ready (there is no server yet)
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('f-status');

  // buttons elsewhere can pre-select the topic ("Partner with us" -> Partnership or grant)
  document.querySelectorAll('[data-enquiry]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = form.querySelector('input[name="enquiry"][value="' + a.dataset.enquiry + '"]');
      if (r) r.checked = true;
    });
  });

  function check(f) {
    var v = f.value.trim();
    var ok = !!v && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
    f.classList.toggle('bad', !ok);
    f.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, bad = null;
    ['name', 'email', 'message'].forEach(function (n) { if (!check(f[n]) && !bad) bad = f[n]; });
    if (bad) {
      status.classList.add('err');
      status.textContent = bad.type === 'email' ? 'Please enter a valid email address.' : 'Please fill in your name, email and message.';
      bad.focus(); return;
    }
    status.classList.remove('err');
    var enq = form.querySelector('input[name="enquiry"]:checked').value;
    var body = 'Name: ' + f.name.value.trim() + '\nEmail: ' + f.email.value.trim() +
      '\nOrganisation: ' + (f.org.value.trim() || '-') + '\nPhone: ' + (f.phone.value.trim() || '-') +
      '\nTopic: ' + enq + '\n\n' + f.message.value.trim();
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(enq + ' from ' + f.name.value.trim()) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your email app should open with your message ready. If it does not, write to ' + CONTACT_EMAIL + '.';
  });
})();

// Hero video: pause it while it is off screen to save battery
(function () {
  var v = document.getElementById('hero-video');
  if (!v || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!v.getAttribute('src')) return;
      if (e.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else { v.pause(); }
    });
  }, { threshold: 0.05 }).observe(v);
})();

// Phones: card rows swipe sideways; dots show which card you are on
(function () {
  var rows = document.querySelectorAll('.proj-grid, .ways, .band-grid, .news-grid');
  rows.forEach(function (track) {
    var cards = Array.prototype.slice.call(track.children);
    if (cards.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', 'Choose a card');
    var btns = cards.map(function (card, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show card ' + (n + 1) + ' of ' + cards.length);
      b.addEventListener('click', function () {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseInt(getComputedStyle(track).paddingLeft, 10), behavior: 'smooth' });
      });
      dots.appendChild(b);
      return b;
    });
    track.parentNode.insertBefore(dots, track.nextSibling);
    function sync() {
      var max = track.scrollWidth - track.clientWidth, i = 0;
      if (max > 0) {
        if (track.scrollLeft >= max - 4) i = cards.length - 1;
        else { var best = 1e9; cards.forEach(function (c, n) { var d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft - parseInt(getComputedStyle(track).paddingLeft, 10)); if (d < best) { best = d; i = n; } }); }
      }
      btns.forEach(function (b, n) { b.classList.toggle('on', n === i); if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });
})();
