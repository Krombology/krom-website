/* Krom Technology Systems, site behaviour
   Runbook scenarios, size switcher, scroll reveal, counters, service cards, case filter, timeline reveal,
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

  /* Runbook: cycles through example clients, one per sector and size */
  var scenarios = [
    { tab: 'Enterprise', title: 'Engineering firm, 300 people', time: 'Sat 02:00 ET', end: 'Mon 08:00 ET', result: '0 tickets',
      steps: ['Final delta sync, 148 mailboxes', 'MX cut to Exchange Online', 'Autodiscover, SPF, DKIM, DMARC verified', 'Conditional Access enforced', 'Drive delta check, 0 files missing', 'Old tenant set to read only'] },
    { tab: 'Dental', title: 'Dental practice, 12 people', time: 'Fri 18:00 ET', end: 'Mon 08:00 ET', result: 'Audit ready',
      steps: ['MFA on every account', 'DLP rule holds unencrypted PHI', 'Encrypted email for patient records', 'Laptops encrypted, remote wipe on', 'Nightly backup, restore tested', 'Evidence pack filed'] },
    { tab: 'Law firm', title: 'Law firm, 40 people', time: 'Sat 09:00 ET', end: 'Mon 08:00 ET', result: 'Hold verified',
      steps: ['Litigation hold on all mailboxes', 'Matter folders locked to the team', 'External sharing reviewed', 'Sign-in only from managed devices', 'Immutable offsite backups', 'Retention policy published'] },
    { tab: 'Startup', title: 'Startup, 8 people', time: 'Day 1', end: 'Day 5', result: 'Ready to hire',
      steps: ['Tenant and domain set up', 'SPF, DKIM, DMARC on day one', 'Laptops enrolled zero-touch', 'Password manager rolled out', 'Backups on before the first file', 'Onboarding checklist written'] }
  ];
  var rb = document.querySelector('.runbook');
  if (rb) {
    var rbTitle = rb.querySelector('.runbook-title'), rbTime = rb.querySelector('.runbook-time');
    var rbList = rb.querySelector('.runbook-steps'), rbFoot = rb.querySelector('[data-final]');
    var rbEnd = rb.querySelector('.runbook-end'), rbResult = rb.querySelector('.runbook-result');
    var rbTabs = rb.querySelector('.runbook-tabs');
    var timers = [], auto = !reduceMotion, hovering = false, cur = 0;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    var tabBtns = scenarios.map(function (sc, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rb-tab'; b.textContent = sc.tab;
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', function () { auto = false; play(i); });
      rbTabs.appendChild(b);
      return b;
    });
    function render(i) {
      var sc = scenarios[i];
      cur = i;
      rbTitle.textContent = sc.title; rbTime.textContent = sc.time;
      rbEnd.textContent = sc.end; rbResult.textContent = sc.result;
      rbFoot.classList.remove('is-done');
      rbList.textContent = '';
      sc.steps.forEach(function (t, k) {
        var li = document.createElement('li');
        li.style.setProperty('--k', k);
        var tick = document.createElement('span'); tick.className = 'tick'; tick.setAttribute('aria-hidden', 'true');
        var txt = document.createElement('span'); txt.textContent = t;
        li.appendChild(tick); li.appendChild(txt);
        rbList.appendChild(li);
      });
      tabBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
    }
    function tickThrough() {
      var lis = Array.prototype.slice.call(rbList.children);
      if (reduceMotion) { lis.forEach(function (li) { li.classList.add('is-done'); }); rbFoot.classList.add('is-done'); return; }
      lis.forEach(function (li, k) { later(function () { li.classList.add('is-done'); }, 500 + k * 380); });
      var doneAt = 500 + lis.length * 380 + 250;
      later(function () { rbFoot.classList.add('is-done'); }, doneAt);
      later(next, doneAt + 3400);
    }
    function next() {
      if (!auto) return;
      if (hovering) { later(next, 1200); return; }
      play((cur + 1) % scenarios.length);
    }
    function play(i) {
      timers.forEach(clearTimeout); timers = [];
      rb.classList.add('is-swapping');
      later(function () { render(i); rb.classList.remove('is-swapping'); tickThrough(); }, reduceMotion ? 0 : 260);
    }
    rb.addEventListener('mouseenter', function () { hovering = true; });
    rb.addEventListener('mouseleave', function () { hovering = false; });
    rb.addEventListener('focusin', function () { hovering = true; });
    rb.addEventListener('focusout', function () { hovering = false; });
    render(0);
    later(tickThrough, reduceMotion ? 0 : 400);
  }

  /* Protection band: size switcher */
  var sizer = document.querySelector('.sizer');
  var pillars = document.querySelector('.pillars');
  if (sizer && pillars) {
    var sizeBtns = Array.prototype.slice.call(sizer.querySelectorAll('[data-tier]'));
    sizeBtns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        sizeBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        sizer.style.setProperty('--i', i);
        pillars.setAttribute('data-show', b.getAttribute('data-tier'));
      });
    });
  }

  /* Scroll reveal, staggered among siblings */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  reveals.forEach(function (el) {
    if (el.style.getPropertyValue('--d')) return;
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-reveal'); });
    el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 5) * 70) + 'ms');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Nav shadow once scrolled */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Case card spotlight follows the cursor */
  document.querySelectorAll('.case').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

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
