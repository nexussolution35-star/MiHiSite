/* Mi-Hi — categorised project gallery (coverflow carousel + lightbox)
   Vanilla reimplementation of the requested coverflow component for this
   static site (no React/Tailwind build). */
(function () {
  'use strict';
  var BASE = 'assets/img/projects/';
  function proj(n) { return BASE + 'project-' + (n < 10 ? '0' + n : n) + '.jpg'; }

  // [category, [ [projectNumber, alt], ... ]]
  var CATS = [
    ['Kitchens', [[19, 'Classic white designer kitchen'], [20, 'Contemporary kitchen island with stone tops'], [21, 'Modern matt-black designer kitchen'], [22, 'White gloss kitchen with mosaic splashback'], [23, 'Solid-wood and white kitchen island'], [47, 'Open-plan designer kitchen with island'], [48, 'Dark open-plan kitchen with island'], [1, 'Solid-wood designer kitchen']]],
    ['Built-In Cupboards', [[24, 'Custom white built-in wardrobe shelving'], [25, 'Mirror sliding-door wardrobes'], [26, 'Dark-wood built-in bedroom cupboards'], [27, 'Walk-in dressing room with glass-door cabinetry'], [51, 'Timber barn-door built-in cupboard'], [16, 'Built-in bedroom cupboards']]],
    ['Bathroom Vanities', [[28, 'Twin-basin timber bathroom vanity'], [29, 'Double timber bathroom vanity'], [30, 'Fluted designer vanity with stone basins'], [49, 'White double vanity with stone top'], [50, 'Timber vanity with framed mirror'], [12, 'Solid-wood bathroom vanity']]],
    ['TV Units', [[35, 'Floating TV unit with timber feature wall'], [36, 'Media wall with slatted feature panel'], [37, 'Stone-clad TV media wall'], [38, 'Solid-wood TV and media unit'], [14, 'TV and wall unit']]],
    ['Bars', [[39, 'Home bar with beverage display'], [40, 'Bespoke bar counter and shelving'], [41, 'Bar and beverage island'], [42, 'Entertainment bar area'], [6, 'Bar and entertainment unit']]],
    ['Office & Study Area', [[43, 'Office reception desk with slatted front'], [44, 'Office bookshelf wall and storage'], [45, 'Executive office desk and credenza'], [46, 'Home-office desk and study'], [32, 'Solid-wood boardroom table'], [13, 'Office and study furniture']]],
    ['Braai Areas', [[31, 'Indoor braai and entertainment area']]]
  ];

  var tabsEl = document.querySelector('.cat-tabs');
  var track = document.querySelector('.cf-track');
  var dotsEl = document.querySelector('.cf-dots');
  var prevBtn = document.querySelector('.cf-prev');
  var nextBtn = document.querySelector('.cf-next');
  if (!track || !tabsEl) return;

  var catIndex = 0, current = 0, slides = [];

  /* ---- lightbox (reuses .lightbox styles from site.css) ---- */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Project image viewer');
  lb.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
    '<figure class="lb-stage"><img alt=""></figure>' +
    '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>';
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(lb); });
  var lbImg = lb.querySelector('img'), lbIdx = 0, lbList = [];
  function lbShow(i) {
    if (!lbList.length) return;
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = proj(lbList[lbIdx][0]);
    lbImg.alt = lbList[lbIdx][1] + ' by Mi-Hi';
  }
  function lbOpen(list, i) { lbList = list; lbShow(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function lbClose() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  lb.querySelector('.lb-close').addEventListener('click', lbClose);
  lb.querySelector('.lb-prev').addEventListener('click', function () { lbShow(lbIdx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
  });

  /* ---- category tabs ---- */
  CATS.forEach(function (c, ci) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cat-tab' + (ci === 0 ? ' active' : '');
    b.textContent = c[0];
    b.setAttribute('role', 'tab');
    b.addEventListener('click', function () {
      if (ci === catIndex) return;
      catIndex = ci; current = 0;
      Array.prototype.forEach.call(tabsEl.children, function (t, ti) { t.classList.toggle('active', ti === ci); });
      buildSlides();
    });
    tabsEl.appendChild(b);
  });

  function buildSlides() {
    var imgs = CATS[catIndex][1], cat = CATS[catIndex][0];
    track.innerHTML = ''; dotsEl.innerHTML = ''; slides = [];
    imgs.forEach(function (im, i) {
      var li = document.createElement('li');
      li.className = 'cf-slide';
      li.innerHTML =
        '<div class="cf-card"><img src="' + proj(im[0]) + '" alt="' + im[1] + ' by Mi-Hi" loading="lazy" decoding="async">' +
        '<div class="cf-cap"><h3>' + cat + '</h3><span class="cf-view">View project</span></div></div>';
      var card = li.querySelector('.cf-card');
      li.addEventListener('click', function () {
        if (i !== current) { current = i; layout(); }
        else { lbOpen(CATS[catIndex][1], i); }
      });
      card.addEventListener('mousemove', function (e) {
        if (i !== current) return;
        var r = card.getBoundingClientRect();
        var rx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 9;
        var ry = -((e.clientY - (r.top + r.height / 2)) / r.height) * 9;
        card.style.transform = 'rotateX(' + ry + 'deg) rotateY(' + rx + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      track.appendChild(li); slides.push(li);

      var d = document.createElement('button');
      d.type = 'button'; d.className = 'cf-dot';
      d.setAttribute('aria-label', 'Go to project ' + (i + 1));
      d.addEventListener('click', function () { current = i; layout(); });
      dotsEl.appendChild(d);
    });
    var single = imgs.length <= 1;
    prevBtn.hidden = single; nextBtn.hidden = single; dotsEl.hidden = single;
    layout();
  }

  function layout() {
    slides.forEach(function (li, i) {
      var off = i - current, abs = Math.abs(off);
      li.querySelector('.cf-card').style.transform = '';
      li.classList.toggle('is-active', off === 0);
      if (abs > 2) {
        li.style.opacity = '0'; li.style.pointerEvents = 'none'; li.style.zIndex = '0';
        li.style.transform = 'translate(-50%,-50%) translateX(' + (off * 46) + '%) scale(0.5)';
        return;
      }
      li.style.pointerEvents = '';
      var scale = off === 0 ? 1 : (abs === 1 ? 0.82 : 0.66);
      var opacity = off === 0 ? 1 : (abs === 1 ? 0.6 : 0.32);
      li.style.opacity = String(opacity);
      li.style.transform = 'translate(-50%,-50%) translateX(' + (off * 46) + '%) scale(' + scale + ') rotateY(' + (-off * 10) + 'deg)';
      li.style.zIndex = String(30 - abs);
    });
    Array.prototype.forEach.call(dotsEl.children, function (d, i) { d.classList.toggle('active', i === current); });
  }

  function go(dir) {
    var n = slides.length; if (!n) return;
    current = Math.max(0, Math.min(n - 1, current + dir));
    layout();
  }
  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });
  window.addEventListener('resize', layout, { passive: true });

  buildSlides();

  /* ---- Portfolio filter grid (below the carousel) ---- */
  (function initGrid() {
    var filtersEl = document.querySelector('.pf-filters');
    var gridEl = document.querySelector('.pf-grid');
    if (!filtersEl || !gridEl) return;

    var ALL = [];
    CATS.forEach(function (c) { c[1].forEach(function (im) { ALL.push({ n: im[0], title: im[1], cat: c[0] }); }); });
    var cats = ['All'].concat(CATS.map(function (c) { return c[0]; }));
    var active = 'All';
    var zoom = '<svg class="pf-zoom" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

    cats.forEach(function (cat) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pf-filter' + (cat === 'All' ? ' active' : '');
      b.textContent = cat;
      b.addEventListener('click', function () {
        active = cat;
        Array.prototype.forEach.call(filtersEl.children, function (x) { x.classList.toggle('active', x.textContent === cat); });
        render();
      });
      filtersEl.appendChild(b);
    });

    function currentList() { return active === 'All' ? ALL : ALL.filter(function (x) { return x.cat === active; }); }

    function render() {
      var list = currentList();
      gridEl.innerHTML = '';
      list.forEach(function (item, idx) {
        var card = document.createElement('article');
        card.className = 'pf-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'View ' + item.title);
        card.innerHTML =
          '<div class="pf-thumb"><img src="' + proj(item.n) + '" alt="' + item.title + ' by Mi-Hi" loading="lazy" decoding="async">' +
          '<div class="pf-overlay">' + zoom + '<h3>' + item.title + '</h3><span class="pf-badge">' + item.cat + '</span></div></div>';
        card.style.animationDelay = (Math.min(idx, 12) * 0.04) + 's';
        function open() { lbOpen(list.map(function (x) { return [x.n, x.title]; }), idx); }
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        gridEl.appendChild(card);
      });
    }
    render();
  })();
})();
