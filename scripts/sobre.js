/* ============================================================
   DB Softwares — Sobre a DB
   ============================================================ */

(function () {
  'use strict';

  function initReveal() {
    document.querySelectorAll('.hero .reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      observer.observe(el);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 24;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  function initPillars() {
    document.querySelectorAll('.pillar').forEach(function (p) {
      p.setAttribute('tabindex', '0');
    });
  }

  function init() {
    initReveal();
    initSmoothScroll();
    initPillars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
