// Projects page: "Support this project" buttons pre-select the project in the form; the form opens the visitor's email app
(function () {
  var form = document.getElementById('project-form');
  if (!form) return;
  var CONTACT_EMAIL = 'info@mishiafoundation.org';
  var status = document.getElementById('p-status');

  function pick(name) {
    var found = null;
    form.querySelectorAll('input[name="project"]').forEach(function (r) { if (r.value === name) found = r; });
    if (found) found.checked = true;
    return !!found;
  }
  document.querySelectorAll('[data-project]').forEach(function (b) {
    b.addEventListener('click', function () {
      pick(b.dataset.project);
      var target = document.getElementById('support-form');
      if (window.__scrollToEl) window.__scrollToEl(target); else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { var n = document.getElementById('p-name'); if (n) n.focus({ preventScroll: true }); }, 700);
    });
  });
  // ?project=... in the address (for links from other pages)
  var q = new URLSearchParams(location.search).get('project');
  if (q) pick(q);

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
    ['name', 'email'].forEach(function (n) { if (!check(f[n]) && !bad) bad = f[n]; });
    if (bad) {
      status.classList.add('err');
      status.textContent = bad.type === 'email' ? 'Please enter a valid email address.' : 'Please add your name and email so we can reply.';
      bad.focus(); return;
    }
    status.classList.remove('err');
    var project = form.querySelector('input[name="project"]:checked').value;
    var how = form.querySelector('input[name="how"]:checked').value;
    var body = 'Project: ' + project + '\nHow I would like to help: ' + how +
      '\n\nName: ' + f.name.value.trim() + '\nEmail: ' + f.email.value.trim() +
      '\nOrganisation: ' + (f.org.value.trim() || '-') + '\nPhone: ' + (f.phone.value.trim() || '-') +
      '\n\n' + (f.message.value.trim() || '(no message)');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(how + ': ' + project) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your email app should open with your request ready to send. If it does not, write to ' + CONTACT_EMAIL + '.';
  });
})();
