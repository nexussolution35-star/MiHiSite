/* Mi-Hi — site interactions (no analytics, no third-party backend)
   Progressive enhancement: everything here is optional polish; the
   static HTML works without it. */
(function () {
  'use strict';

  var WA_NUMBER = '27726561328';               // 072 656 1328 (WhatsApp)
  var EMAIL = 'designs@mihi.co.za';

  /* ---- Mobile nav: close when tapping outside or on a link ---- */
  document.addEventListener('click', function (e) {
    var links = document.getElementById('navLinks');
    if (!links || !links.classList.contains('open')) return;
    if (e.target.closest('#navLinks a') ||
        (!e.target.closest('#navLinks') && !e.target.closest('.nav-toggle'))) {
      links.classList.remove('open');
    }
  });

  /* ---- Floating WhatsApp button (injected on every page) ---- */
  function whatsappUrl(text) {
    return 'https://wa.me/' + WA_NUMBER +
      (text ? '?text=' + encodeURIComponent(text) : '');
  }
  var wa = document.createElement('a');
  wa.className = 'wa-float';
  wa.href = whatsappUrl("Hi Mi-Hi, I'd like to chat about a project.");
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'Chat with Mi-Hi on WhatsApp');
  wa.innerHTML =
    '<svg viewBox="0 0 32 32" aria-hidden="true" width="28" height="28">' +
    '<path fill="currentColor" d="M16 3C9 3 3.5 8.6 3.5 15.5c0 2.4.7 4.6 1.9 6.6L3 29l7.2-2.3c1.9 1 4 1.6 6.3 1.6 6.9 0 12.5-5.6 12.5-12.5S22.9 3 16 3zm0 22.8c-2 0-4-.5-5.7-1.6l-.4-.2-4.3 1.3 1.4-4.1-.3-.4a10.3 10.3 0 01-1.6-5.6C5.2 9.7 10 5 16 5s10.8 4.7 10.8 10.5S22 25.8 16 25.8zm5.9-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.4 8.4 0 01-2.5-1.5 9.3 9.3 0 01-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5s.1-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5s-.3-.2-.6-.4z"/>' +
    '</svg>';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(wa);
  });

  /* ---- Back-to-top button ---- */
  var top = document.createElement('button');
  top.className = 'to-top';
  top.type = 'button';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '&#8593;';
  top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(top);
  });
  window.addEventListener('scroll', function () {
    top.classList.toggle('show', window.pageYOffset > 600);
  }, { passive: true });

  /* ---- Contact / estimate forms → WhatsApp with e-mail fallback ---- */
  document.querySelectorAll('form.form-card, form.quote-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [];
      form.querySelectorAll('.field').forEach(function (f) {
        var label = f.querySelector('label');
        var ctrl = f.querySelector('input, select, textarea');
        if (label && ctrl && ctrl.value && ctrl.value.trim()) {
          lines.push(label.textContent.trim() + ': ' + ctrl.value.trim());
        }
      });
      if (!lines.length) {
        alert('Please add a few details so we can help — at least your name and what you have in mind.');
        return;
      }
      var body = "Hi Mi-Hi, I'd like a free design estimate.\n\n" + lines.join('\n');
      window.open(whatsappUrl(body), '_blank', 'noopener');
      var note = form.querySelector('.form-note');
      if (note) {
        note.innerHTML = 'Opening WhatsApp… If nothing happens, ' +
          '<a href="mailto:' + EMAIL + '?subject=' +
          encodeURIComponent('Free design estimate request') +
          '&body=' + encodeURIComponent(body) +
          '" style="color:var(--accent)">email us instead</a>.';
        note.style.display = 'block';
      }
    });
  });

  /* ---- Gallery lightbox ---- */
  var grid = document.querySelector('.gallery-grid');
  if (grid) {
    // Only enhance placeholder thumbnails (href="#"); leave real links
    // (e.g. the homepage "Our work" strip linking to gallery.html) alone.
    var imgs = Array.prototype.slice.call(grid.querySelectorAll('img'))
      .filter(function (img) {
        var a = img.closest('a');
        if (!a) return true;
        var href = a.getAttribute('href');
        return !href || href === '#' || href === '';
      });
    if (imgs.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Gallery image viewer');
      lb.innerHTML =
        '<button class="lb-close" aria-label="Close">&times;</button>' +
        '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
        '<figure class="lb-stage"><img alt=""></figure>' +
        '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>';
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(lb);
      });
      var stageImg = lb.querySelector('.lb-stage img');
      var idx = 0;
      function show(i) {
        idx = (i + imgs.length) % imgs.length;
        var src = imgs[idx];
        stageImg.src = src.currentSrc || src.src;
        stageImg.alt = src.alt || '';
      }
      function open(i) {
        show(i);
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function close() {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      }
      imgs.forEach(function (img, i) {
        var a = img.closest('a') || img;
        a.style.cursor = 'zoom-in';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          open(i);
        });
      });
      lb.querySelector('.lb-close').addEventListener('click', close);
      lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
      lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
      });
    }
  }

  /* ---- Reviews carousel ---- */
  document.querySelectorAll('.rev-carousel').forEach(function (car) {
    var track = car.querySelector('.rev-track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.rev-card'));
    var prev = car.querySelector('.rev-prev');
    var next = car.querySelector('.rev-next');
    var section = car.closest('.reviews-section') || car.parentNode;
    var dotsWrap = section.querySelector('.rev-dots');
    if (!cards.length) return;

    function step() {
      return cards.length > 1
        ? (cards[1].offsetLeft - cards[0].offsetLeft)
        : cards[0].offsetWidth;
    }
    function overflowing() {
      return track.scrollWidth > track.clientWidth + 4;
    }

    // build dots (one per card)
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      cards.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'rev-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to review ' + (i + 1));
        d.addEventListener('click', function () {
          track.scrollTo({ left: i * step(), behavior: 'smooth' });
        });
        dotsWrap.appendChild(d);
      });
    }

    function refresh() {
      var over = overflowing();
      track.classList.toggle('is-centered', !over);
      if (prev) prev.hidden = !over;
      if (next) next.hidden = !over;
      if (dotsWrap) dotsWrap.hidden = !over;
      if (!over) return;
      var active = Math.round(track.scrollLeft / step());
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle('active', i === active);
        });
      }
    }

    if (next) next.addEventListener('click', function () {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      }
    });
    if (prev) prev.addEventListener('click', function () {
      if (track.scrollLeft <= 2) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      }
    });

    var raf;
    track.addEventListener('scroll', function () {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(refresh);
    }, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('load', refresh);
    refresh();
  });

  /* ---- Lazy-load non-hero images (best-effort) ---- */
  document.querySelectorAll('img').forEach(function (img) {
    if (img.closest('.hero__bg')) return;         // keep hero eager
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  /* ---- Keep footer copyright year current ---- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.footer-bottom span').forEach(function (el) {
      el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
    });
  });

  /* ---- Count-up stats when scrolled into view (once) ---- */
  (function () {
    var section = document.querySelector('.stats');
    if (!section) return;
    var items = Array.prototype.slice.call(section.querySelectorAll('.stat b'))
      .map(function (el) {
        var m = /^(\D*)([\d.,]+)(\D*)$/.exec(el.textContent.trim());
        if (!m) return null;
        return { el: el, pre: m[1], suf: m[3], raw: el.textContent.trim(), target: parseFloat(m[2].replace(/,/g, '')) };
      }).filter(Boolean);
    if (!items.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return; // leave final values as-is

    items.forEach(function (it) { it.el.textContent = it.pre + '0' + it.suf; });

    function animate(it) {
      var dur = 1600, start = null;
      function frame(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
        if (p < 1) {
          it.el.textContent = it.pre + Math.round(it.target * eased) + it.suf;
          requestAnimationFrame(frame);
        } else {
          it.el.textContent = it.raw;                  // exact original value
        }
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); items.forEach(animate); }
      });
    }, { threshold: 0.4 });
    io.observe(section);
  })();
})();
