/**
 * DB Softwares — Global JavaScript
 * Funcionalidades compartilhadas: reveal animations, smooth scroll, etc.
 */

(function() {
  'use strict';

  /* ── Reveal on Scroll (IntersectionObserver) ─────────────────── */
  function initReveal() {
    var REVEAL_SELECTOR = '.reveal, .reveal--from-left, .reveal--from-right, .reveal--scale';

    // Fallback para browsers sem IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(function(el) {
        el.classList.add('is-visible', 'visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll(REVEAL_SELECTOR).forEach(function(el) {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  }

  /* ── Smooth Scroll for Anchor Links ──────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var hash = link.getAttribute('href');
      if (hash === '#' || hash === '#avaliar') return;

      var target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 24;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Atualizar hash na URL
      history.pushState(null, null, hash);
    });
  }

  /* ── Scroll to hash on page load ─────────────────────────────── */
  function scrollToHashOnLoad() {
    if (!window.location.hash) return;

    var target = document.querySelector(window.location.hash);
    if (!target) return;

    // Pequeno delay para garantir que o layout esta pronto
    setTimeout(function() {
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 24;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }, 100);
  }

  /* ── Parallax Effect (subtle) ────────────────────────────────── */
  function initParallax() {
    var parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    var ticking = false;

    function updateParallax() {
      var scrollY = window.pageYOffset;

      parallaxElements.forEach(function(el) {
        var speed = parseFloat(el.dataset.parallax) || 0.1;
        var offset = scrollY * speed;
        el.style.transform = 'translateY(' + offset + 'px)';
      });

      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Counter Animation ───────────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.counter, 10);
    var duration = parseInt(el.dataset.duration, 10) || 2000;
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var start = 0;
    var startTime = null;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = Math.floor(easedProgress * target);

      el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ── Tabs Component ──────────────────────────────────────────── */
  function initTabs() {
    var tabContainers = document.querySelectorAll('[data-tabs]');
    
    tabContainers.forEach(function(container) {
      var triggers = container.querySelectorAll('[data-tab-trigger]');
      var panels = container.querySelectorAll('[data-tab-panel]');

      triggers.forEach(function(trigger) {
        trigger.addEventListener('click', function() {
          var targetId = trigger.dataset.tabTrigger;

          // Desativar todos
          triggers.forEach(function(t) {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
          });
          
          panels.forEach(function(p) {
            p.classList.remove('is-active');
            p.setAttribute('aria-hidden', 'true');
          });

          // Ativar o selecionado
          trigger.classList.add('is-active');
          trigger.setAttribute('aria-selected', 'true');

          var targetPanel = container.querySelector('[data-tab-panel="' + targetId + '"]');
          if (targetPanel) {
            targetPanel.classList.add('is-active');
            targetPanel.setAttribute('aria-hidden', 'false');
          }
        });
      });
    });
  }

  /* ── Prefers Reduced Motion ──────────────────────────────────── */
  function checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
      
      // Desativar animacoes
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('is-visible', 'visible');
      });
    }
  }

  /* ── Initialize ──────────────────────────────────────────────── */
  function init() {
    checkReducedMotion();
    initReveal();
    initSmoothScroll();
    initParallax();
    initCounters();
    initTabs();
    scrollToHashOnLoad();
  }

  // Aguardar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expor funcoes globalmente se necessario
  window.DBSoftwares = {
    initReveal: initReveal,
    initCounters: initCounters,
    initTabs: initTabs
  };
})();

/* ── Header/Footer estáticos ───────��─────────────────────────── */
(function() {
  'use strict';

  function initStaticHeaderFooter() {
    var year = document.getElementById('ftYear');
    if (year) year.textContent = new Date().getFullYear();

    var navbar = document.getElementById('navbar');
    if (navbar && !navbar.dataset.staticReady) {
      navbar.dataset.staticReady = 'true';

      function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      document.querySelectorAll('.nav-item').forEach(function(item) {
        var btn = item.querySelector('.nav-link[aria-haspopup]');
        if (!btn) return;

        item.addEventListener('mouseenter', function() {
          btn.setAttribute('aria-expanded', 'true');
        });

        item.addEventListener('mouseleave', function() {
          btn.setAttribute('aria-expanded', 'false');
        });

        btn.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var exp = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!exp));
          }
          if (e.key === 'Escape') {
            btn.setAttribute('aria-expanded', 'false');
            btn.focus();
          }
        });
      });

      document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item')) {
          document.querySelectorAll('.nav-link[aria-haspopup]').forEach(function(b) {
            b.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

    var hamburger = document.getElementById('navHamburger');
    var mobileMenu = document.getElementById('navMobile');
    if (hamburger && mobileMenu && !hamburger.dataset.staticReady) {
      hamburger.dataset.staticReady = 'true';

      function toggleMobile(close) {
        var isOpen = hamburger.classList.contains('open');
        if (close || isOpen) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        } else {
          hamburger.classList.add('open');
          mobileMenu.classList.add('open');
          hamburger.setAttribute('aria-expanded', 'true');
          mobileMenu.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      }

      hamburger.addEventListener('click', function() { toggleMobile(); });
      mobileMenu.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { toggleMobile(true); });
      });
      document.addEventListener('click', function(e) {
        var navbar = document.getElementById('navbar');
        if (navbar && !navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
          toggleMobile(true);
        }
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          toggleMobile(true);
          hamburger.focus();
        }
      });
      var mq = window.matchMedia('(min-width:901px)');
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function(e) {
          if (e.matches && mobileMenu.classList.contains('open')) toggleMobile(true);
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStaticHeaderFooter);
  } else {
    initStaticHeaderFooter();
  }
})();




