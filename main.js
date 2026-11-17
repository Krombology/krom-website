/* Krom Technology Systems, site behaviour */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* Nav shadow once scrolled */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll reveal, staggered among siblings */
  var reveals = $$('[data-reveal]');
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-reveal'); });
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 70 + 'ms');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Counters */
  function count(el) {
    var target = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    if (reduce) return;
    var t0 = null;
    requestAnimationFrame(function tick(ts) {
      t0 = t0 || ts;
      var p = Math.max(0, Math.min((ts - t0) / 1400, 1));
      if (!p) { requestAnimationFrame(tick); return; }
      el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(tick);
    });
  }
  setTimeout(function () { $$('[data-count]').forEach(count); }, 500);

  /* Hero parallax */
  var stage = document.querySelector('.stage');
  if (stage && !reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      stage.style.setProperty('--px', ((e.clientX / window.innerWidth) - .5).toFixed(3));
      stage.style.setProperty('--py', ((e.clientY / window.innerHeight) - .5).toFixed(3));
    }, { passive: true });
  }

  /* DLP feed cycles */
  var feed = $$('.dlp-feed li');
  if (feed.length) {
    var fi = 0;
    feed[0].classList.add('is-on');
    if (!reduce) setInterval(function () {
      var cur = feed[fi];
      cur.classList.remove('is-on'); cur.classList.add('is-off');
      setTimeout(function () { cur.classList.remove('is-off'); }, 600);
      fi = (fi + 1) % feed.length;
      feed[fi].classList.add('is-on');
    }, 2800);
  }

  /* Headline rotator */
  var rot = document.querySelector('.rotator'), squig = document.querySelector('.squiggle');
  if (rot && !reduce) {
    var words = ['budget.', 'practice.', 'law firm.', 'startup.', 'shop.', 'budget.'], wi = 0;
    setTimeout(function next() {
      wi = (wi + 1) % words.length;
      rot.classList.remove('is-in'); rot.classList.add('is-out');
      setTimeout(function () {
        rot.textContent = words[wi];
        rot.classList.remove('is-out'); rot.classList.add('is-in');
        squig.classList.add('is-redraw'); void squig.offsetWidth; squig.classList.remove('is-redraw');
      }, 350);
      setTimeout(next, wi === words.length - 1 ? 6000 : 2200);
    }, 3200);
  }

  /* Savings calculator */
  var calc = document.querySelector('.calc-ui');
  if (calc) {
    var out = calc.querySelector('.calc-n'), shown = 3000;
    var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    function update() {
      var v = {};
      Array.prototype.forEach.call(calc.querySelectorAll('input[type=range]'), function (r) {
        v[r.name] = +r.value;
        r.style.setProperty('--fill', (r.value - r.min) / (r.max - r.min) * 100 + '%');
      });
      calc.querySelector('[data-for=seats]').textContent = v.seats;
      calc.querySelector('[data-for=price]').textContent = '$' + v.price;
      calc.querySelector('[data-for=unused]').textContent = v.unused + '%';
      var target = v.seats * v.price * 12 * v.unused / 100, from = shown, t0 = null;
      if (reduce) { shown = target; out.textContent = fmt(target); return; }
      out.classList.remove('is-bump'); void out.offsetWidth; out.classList.add('is-bump');
      requestAnimationFrame(function tick(ts) {
        t0 = t0 || ts;
        var p = Math.min((ts - t0) / 450, 1);
        shown = from + (target - from) * (1 - Math.pow(1 - p, 3));
        out.textContent = fmt(shown);
        if (p < 1) requestAnimationFrame(tick);
      });
    }
    calc.addEventListener('input', update);
    update();
  }

  /* Cursor spotlight on tiles */
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', e.clientX - r.left + 'px');
      t.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* Size switcher */
  var sizer = document.querySelector('.sizer'), pillars = document.querySelector('.pillars');
  if (sizer && pillars) {
    var btns = $$('.sizer [data-tier]');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        sizer.style.setProperty('--i', i);
        pillars.setAttribute('data-show', b.getAttribute('data-tier'));
      });
    });
  }

  /* Contact form: prefill industry from ?industry=, submit via Formspree */
  var form = document.querySelector('.form');
  if (form) {
    var ind = new URLSearchParams(location.search).get('industry');
    var sel = form.querySelector('[name="industry"]');
    if (ind && sel && sel.querySelector('option[value="' + ind + '"]')) sel.value = ind;
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      if (!form.checkValidity()) { form.reportValidity(); status.textContent = 'A required field is missing.'; status.classList.add('is-err'); return; }
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) { status.textContent = 'The form is not connected yet. Email dane@krom.systems instead.'; status.classList.add('is-err'); return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; status.textContent = 'Sending';
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); status.textContent = 'Sent. I will reply within one business day.'; status.classList.add('is-ok'); })
        .catch(function () { status.textContent = 'That did not go through. Email dane@krom.systems instead.'; status.classList.add('is-err'); })
        .finally(function () { btn.disabled = false; });
    });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
