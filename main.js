/* Krom Technology Systems, site behaviour
   Runbook animation, counters, service cards, case filter, timeline reveal,
   theme toggle, mobile nav, contact form */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  var themeBtn = document.querySelector('.theme-toggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('krom-theme', t); } catch (e) {}
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* Mobile nav */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      navLinks.classList.toggle('is-open', !open);
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      }
    });
  }

  /* Runbook: the one page-load moment */
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var finalRow = document.querySelector('[data-final]');
  function finishRunbook() {
    steps.forEach(function (s) { s.classList.add('is-done'); });
    if (finalRow) finalRow.classList.add('is-done');
  }
  if (reduceMotion) {
    finishRunbook();
  } else {
    steps.forEach(function (s, i) {
      setTimeout(function () { s.classList.add('is-done'); }, 700 + i * 420);
    });
    setTimeout(function () { if (finalRow) finalRow.classList.add('is-done'); }, 700 + steps.length * 420 + 300);
  }

  /* Counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function fmt(n) { return n.toLocaleString('en-US'); }
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion || target === 0) { el.textContent = prefix + fmt(target) + suffix; return; }
    var dur = 1100, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var seen = false;
    var cio = new IntersectionObserver(function (entries) {
      if (seen) return;
      if (entries.some(function (e) { return e.isIntersecting; })) {
        seen = true;
        counters.forEach(runCounter);
        cio.disconnect();
      }
    }, { threshold: 0.4 });
    cio.observe(counters[0].closest('.proof') || counters[0]);
  }

  /* Service cards */
  document.querySelectorAll('.card-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.card');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      card.classList.toggle('is-open', !open);
    });
  });

  /* Case study filter */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var cases = Array.prototype.slice.call(document.querySelectorAll('.case'));
  var empty = document.querySelector('.cases-empty');
  function applyFilter(key) {
    var shown = 0;
    cases.forEach(function (c) {
      var match = key === 'all' || (c.getAttribute('data-sectors') || '').split(/\s+/).indexOf(key) !== -1;
      if (match) {
        c.classList.remove('is-hidden');
        c.classList.remove('is-leaving');
        shown++;
      } else if (reduceMotion) {
        c.classList.add('is-hidden');
      } else {
        c.classList.add('is-leaving');
        setTimeout(function () { c.classList.add('is-hidden'); }, 220);
      }
    });
    if (empty) empty.hidden = shown > 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      applyFilter(chip.getAttribute('data-filter'));
    });
  });

  /* Timeline reveal */
  var stepEls = Array.prototype.slice.call(document.querySelectorAll('.step'));
  if ('IntersectionObserver' in window && stepEls.length && !reduceMotion) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); sio.unobserve(e.target); }
      });
    }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
    stepEls.forEach(function (s) { sio.observe(s); });
  } else {
    stepEls.forEach(function (s) { s.classList.add('is-in'); });
  }

  /* Contact form */
  var form = document.querySelector('.form');
  var status = document.querySelector('.form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = 'A required field is missing.';
        status.classList.add('is-err');
        return;
      }
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        status.textContent = 'The form is not connected yet. Email dane@krom.systems and it will reach me directly.';
        status.classList.add('is-err');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.textContent = 'Sending';
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        status.textContent = 'Sent. I will reply within one business day.';
        status.classList.add('is-ok');
      }).catch(function () {
        status.textContent = 'That did not go through. Email dane@krom.systems instead.';
        status.classList.add('is-err');
      }).finally(function () { btn.disabled = false; });
    });
  }

  /* Footer year */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
