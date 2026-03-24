/* mastery.js — shared logic for all week pages */
(function () {

  /* ── Fade-in observer ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  /* ── Accordion ── */
  window.accToggle = function (trigger) {
    const panel = trigger.nextElementSibling;
    const open = trigger.classList.contains('open');
    trigger.classList.toggle('open', !open);
    panel.classList.toggle('open', !open);
  };

  /* ── Challenge checklist ── */
  // Uses sessionStorage so state persists while browsing but resets fresh each visit
  // (No login needed — athlete just uses same session)
  const WEEK_KEY = document.body.dataset.week || 'w0';

  function loadChecks() {
    try { return JSON.parse(sessionStorage.getItem('checks-' + WEEK_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveChecks(checks) {
    try { sessionStorage.setItem('checks-' + WEEK_KEY, JSON.stringify(checks)); }
    catch (e) {}
  }

  window.initChecklist = function () {
    const checks = loadChecks();
    const items = document.querySelectorAll('.ch-item');
    items.forEach((item, i) => {
      if (checks[i]) item.classList.add('done');
      item.addEventListener('click', () => {
        item.classList.toggle('done');
        checks[i] = item.classList.contains('done');
        saveChecks(checks);
        updateRing(items);
      });
    });
    updateRing(items);
  };

  function updateRing(items) {
    const done = [...items].filter(i => i.classList.contains('done')).length;
    const total = items.length;
    const ring = document.getElementById('ring');
    const countEl = document.getElementById('ring-count');
    const banner = document.getElementById('complete-bar');
    const hint = document.getElementById('ch-hint');
    if (ring) {
      ring.style.strokeDashoffset = 126 - (done / total) * 126;
      ring.classList.toggle('complete', done === total);
    }
    if (countEl) countEl.textContent = done + '/' + total;
    if (banner) banner.classList.toggle('show', done === total);
    if (hint) hint.style.display = done === total ? 'none' : 'block';
    // Update sidebar progress too
    const fill = document.getElementById('sidebar-progress');
    const lbl = document.getElementById('sidebar-progress-label');
    if (fill) fill.style.width = Math.round(done / total * 100) + '%';
    if (lbl) lbl.textContent = done + ' of ' + total + ' complete';
  }

  /* ── Week pill active state ── */
  const currentWeek = parseInt(document.body.dataset.week?.replace('w', '') || '0');
  document.querySelectorAll('.week-pill').forEach(pill => {
    const n = parseInt(pill.dataset.week || '0');
    if (n === currentWeek) pill.classList.add('active');
    // Mark previous weeks as done (simple heuristic — week < current)
    if (n < currentWeek && n > 0) pill.classList.add('done');
    // Lock future weeks
    if (n > currentWeek) pill.classList.add('locked');
  });

  /* ── Run on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initChecklist);
  } else {
    window.initChecklist();
  }

})();
