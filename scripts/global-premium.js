/**
 * DB Softwares — Premium Global Effects
 * Leve: usa requestAnimationFrame e só roda brilho em dispositivos com mouse.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function rafThrottle(fn) {
    var ticking = false;
    var lastArgs = null;
    return function () {
      lastArgs = arguments;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        fn.apply(null, lastArgs);
      });
    };
  }

  function initScrollProgress() {
    var bar = document.querySelector('.db-scroll-progress__bar');
    if (!bar) return;

    var update = rafThrottle(function () {
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      var progress = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = progress.toFixed(2) + '%';
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  function initDynamicCardGlow() {
    if (reduceMotion || !finePointer) return;

    var selectors = [
      '.card',
      '[class*="card"]',
      '.produto-cap__card',
      '.produto-how__step',
      '.produto-oque__card',
      '.produto-resultado__panel-card',
      '.produto-resultado__stat',
      '.case-card',
      '.service-card',
      '.profile-card',
      '.feature-card',
      '.cap-card',
      '.pillar-card',
      '.metric-card'
    ];

    var skipSelectors = [
      '.navbar', '.nav-dropdown', '.mobile-menu', '.footer', '.cookie-banner',
      '.calc-input', 'input', 'textarea', 'select', 'button', '.btn', '.produto-page-nav'
    ];

    var candidates = Array.prototype.slice.call(document.querySelectorAll(selectors.join(',')));
    var cards = [];

    candidates.forEach(function (el) {
      if (!el || el === document.body || el === document.documentElement) return;
      if (skipSelectors.some(function (selector) { return el.matches(selector) || el.closest(selector); })) return;
      var rect = el.getBoundingClientRect();
      if (rect.width < 90 || rect.height < 55) return;
      if (cards.indexOf(el) !== -1) return;
      cards.push(el);
    });

    cards.forEach(function (card) {
      card.classList.add('db-glow-card');
      var onMove = rafThrottle(function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--db-glow-x', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        card.style.setProperty('--db-glow-y', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
      card.addEventListener('mousemove', onMove, { passive: true });
    });
  }


  function normalizePathname(pathname) {
    var path = (pathname || '/').replace(/\\/g, '/');
    path = path.replace(/\/+$/, '');
    if (path === '') path = '/index.html';
    if (path === '/') path = '/index.html';
    return path;
  }

  function initCurrentPageScrollToTop() {
    var currentPath = normalizePathname(window.location.pathname);
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href]'));

    links.forEach(function (link) {
      var href = (link.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (e) {
        return;
      }

      var linkPath = normalizePathname(url.pathname);
      var isSamePage = url.origin === window.location.origin && linkPath === currentPath && !url.hash;
      if (!isSamePage) return;

      link.addEventListener('click', function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

        // Remove hashes/query leftovers without reloading the page.
        try { history.replaceState(null, '', window.location.pathname); } catch (e) {}

        // Fecha o menu mobile, caso esteja aberto.
        var menu = document.querySelector('.nav-mobile, .mobile-menu');
        var toggle = document.querySelector('.nav-toggle, .mobile-toggle');
        if (menu) menu.classList.remove('open', 'is-open', 'active');
        if (toggle) {
          toggle.classList.remove('open', 'is-open', 'active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function init() {
    initScrollProgress();
    initDynamicCardGlow();
    initCurrentPageScrollToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
