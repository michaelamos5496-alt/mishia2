// Mobile menu: button opens / closes the drawer; a link, Escape or a tap outside closes it
(function () {
  var nav = document.getElementById('nav');
  var btn = document.querySelector('.menu-toggle');
  if (!nav || !btn) return;
  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  nav.querySelectorAll('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function () { setOpen(false); });
})();
