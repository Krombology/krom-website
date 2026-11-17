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

  /* Hero cards: each [data-cycle] card steps through its faces, staggered */
  $$('[data-cycle]').forEach(function (card, ci) {
    var faces = Array.prototype.slice.call(card.querySelectorAll('.face')), i = 0;
    if (reduce || faces.length < 2) return;
    setTimeout(function () {
      setInterval(function () {
        faces[i].classList.remove('is-on');
        i = (i + 1) % faces.length;
        faces[i].classList.add('is-on');
      }, 5200);
    }, 2600 + ci * 1700);
  });

  /* Security feed cycles */
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
    }, 2600);
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

  /* Savings calculator: one row per licence, typed seats and prices */
  var calc = document.querySelector('.calc-ui');
  if (calc) {
    var rows = calc.querySelector('.calc-rows'), tpl = document.getElementById('calc-row-tpl');
    var out = calc.querySelector('.calc-n'), totalEl = calc.querySelector('.calc-total');
    var range = calc.querySelector('[name=unused]'), unusedN = calc.querySelector('[name=unused-n]');
    var bill = 1, shown = 0;
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var num = function (el, max) { var v = parseFloat(el.value); return isFinite(v) ? Math.min(Math.max(v, 0), max) : 0; };

    function compute() {
      var total = 0;
      Array.prototype.forEach.call(rows.querySelectorAll('.calc-row'), function (r) {
        total += num(r.querySelector('[name=seats]'), 100000) * num(r.querySelector('[name=price]'), 1000) * 12 * bill;
      });
      var pct = num(unusedN, 90);
      range.style.setProperty('--fill', pct / 90 * 100 + '%');
      totalEl.textContent = money(total);
      var target = total * pct / 100, from = shown, t0 = null;
      shown = target;
      if (reduce) { out.textContent = money(target); return; }
      out.classList.remove('is-bump'); void out.offsetWidth; out.classList.add('is-bump');
      requestAnimationFrame(function tick(ts) {
        t0 = t0 || ts;
        var p = Math.min((ts - t0) / 450, 1);
        out.textContent = money(from + (target - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      });
    }
    function syncDel() {
      var all = rows.querySelectorAll('.calc-row');
      Array.prototype.forEach.call(all, function (r) { r.querySelector('.cr-del').hidden = all.length < 2; });
    }
    calc.addEventListener('submit', function (e) { e.preventDefault(); });
    calc.addEventListener('input', function (e) {
      if (e.target === range) unusedN.value = range.value;
      if (e.target === unusedN) range.value = num(unusedN, 90);
      compute();
    });
    calc.addEventListener('change', function (e) {
      if (e.target.name === 'plan') {
        var price = +e.target.selectedOptions[0].getAttribute('data-price');
        var priceIn = e.target.closest('.calc-row').querySelector('[name=price]');
        priceIn.value = price || '';
        if (!price) priceIn.focus();
        compute();
      }
    });
    calc.addEventListener('click', function (e) {
      var del = e.target.closest('.cr-del');
      if (del) { del.closest('.calc-row').remove(); syncDel(); compute(); }
      var b = e.target.closest('[data-bill]');
      if (b) {
        bill = +b.getAttribute('data-bill');
        Array.prototype.forEach.call(calc.querySelectorAll('[data-bill]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        compute();
      }
    });
    calc.querySelector('.calc-add').addEventListener('click', function () {
      if (rows.children.length >= 8) return;
      var row = tpl.content.firstElementChild.cloneNode(true);
      rows.appendChild(row); syncDel(); compute();
      row.querySelector('select').focus();
    });
    syncDel(); compute();
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

  /* Email address assembled in the browser so scrapers reading the HTML do not get it */
  var mail = ['dane', 'krom.systems'].join('@');
  $$('.js-mail').forEach(function (a) {
    a.textContent = a.getAttribute('data-u') + '@' + a.getAttribute('data-d');
    a.href = 'mailto:' + a.textContent;
  });

  /* Contact form: prefill industry, then bot checks before anything is sent.
     Honeypot field, a minimum time on page, a real interaction, link spam check,
     and a one-minute cooldown. Bots that trip a check get a fake success. */
  var form = document.querySelector('.form');
  if (form) {
    var ind = new URLSearchParams(location.search).get('industry');
    var sel = form.querySelector('[name="industry"]');
    if (ind && sel && sel.querySelector('option[value="' + ind + '"]')) sel.value = ind;
    var status = form.querySelector('.form-status'), loaded = Date.now(), human = false;
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { form.addEventListener(ev, function () { human = true; }, { once: true, passive: true }); });
    function say(msg, cls) { status.className = 'form-status ' + (cls || ''); status.textContent = msg; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); say('A required field is missing.', 'is-err'); return; }
      var data = new FormData(form), msg = String(data.get('message') || '');
      var bot = data.get('_gotcha') || Date.now() - loaded < 4000 || !human || (msg.match(/https?:\/\//g) || []).length > 2;
      if (bot) { form.reset(); say('Sent. I will reply within one business day.', 'is-ok'); return; }
      var last = 0;
      try { last = +localStorage.getItem('krom-sent') || 0; } catch (err) {}
      if (Date.now() - last < 60000) { say('Already sent. Give it a minute before sending another.', 'is-err'); return; }
      if (form.action.indexOf('YOUR_FORM_ID') !== -1) { say('The form is not connected yet. Email ' + mail + ' instead.', 'is-err'); return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('Sending');
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: data })
        .then(function (r) {
          if (!r.ok) throw 0;
          try { localStorage.setItem('krom-sent', Date.now()); } catch (err) {}
          form.reset(); say('Sent. I will reply within one business day.', 'is-ok');
        })
        .catch(function () { say('That did not go through. Email ' + mail + ' instead.', 'is-err'); })
        .finally(function () { btn.disabled = false; });
    });
  }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
