// DB Softwares — efeitos premium das páginas de produto
// Versão otimizada: animações com rAF, pausa fora da tela e menor custo no scroll.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia && window.matchMedia('(min-width: 901px)').matches;

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

  function initTechGrid() {
    // Canvas é bonito, mas é o efeito mais caro. Mantém apenas em desktop.
    if (reduceMotion || !desktop) return;

    var canvases = document.querySelectorAll('.produto-hero__tech-grid');
    canvases.forEach(function (canvas) {
      var ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      var cell = 72;
      var lineColor = '189,208,255';
      var goldColor = '189,160,126';
      var nodes = [];
      var sweepY = -80;
      var running = true;
      var visible = true;
      var lastFrame = 0;
      var resizeTimer = null;

      function buildNodes(width, height) {
        nodes = [];
        var cols = Math.ceil(width / cell) + 1;
        var rows = Math.ceil(height / cell) + 1;
        for (var r = 0; r < rows; r += 1) {
          for (var c = 0; c < cols; c += 1) {
            if (Math.random() < 0.045) {
              nodes.push({
                x: c * cell,
                y: r * cell,
                phase: Math.random() * Math.PI * 2,
                speed: 0.25 + Math.random() * 0.45,
                gold: Math.random() < 0.18
              });
            }
          }
        }
      }

      function resize() {
        var hero = canvas.closest('.produto-hero') || canvas.parentElement;
        if (!hero) return;
        var rect = hero.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildNodes(rect.width, rect.height);
      }

      function draw(ts) {
        if (!running) return;
        requestAnimationFrame(draw);
        if (!visible || document.hidden) return;
        // ~30 FPS para reduzir uso de CPU/GPU.
        if (ts - lastFrame < 33) return;
        lastFrame = ts;

        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var t = ts * 0.001;
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(' + lineColor + ',0.035)';
        ctx.beginPath();
        for (var x = 0; x <= width; x += cell) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (var y = 0; y <= height; y += cell) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();

        sweepY += 0.32;
        if (sweepY > height + 90) sweepY = -90;
        var grad = ctx.createLinearGradient(0, sweepY - 90, 0, sweepY + 90);
        grad.addColorStop(0, 'rgba(' + lineColor + ',0)');
        grad.addColorStop(0.5, 'rgba(' + lineColor + ',0.08)');
        grad.addColorStop(1, 'rgba(' + lineColor + ',0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, sweepY - 90, width, 180);

        nodes.forEach(function (n) {
          var pulse = (Math.sin(t * n.speed + n.phase) + 1) / 2;
          var color = n.gold ? goldColor : lineColor;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1 + pulse * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + color + ',' + (0.10 + pulse * 0.22) + ')';
          ctx.fill();
        });
      }

      resize();
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 140);
      }, { passive: true });

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          visible = entries[0] && entries[0].isIntersecting;
        }, { threshold: 0.01 });
        io.observe(canvas);
      }

      document.addEventListener('visibilitychange', function () {
        visible = !document.hidden;
      });

      requestAnimationFrame(draw);
    });
  }

  function initHeroParallax() {
    if (reduceMotion || !finePointer || !desktop) return;
    var hero = document.querySelector('.produto-hero');
    var visual = document.querySelector('.produto-hero__img-wrapper');
    if (!hero || !visual) return;

    var onMove = rafThrottle(function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      visual.style.transform = 'perspective(1200px) rotateY(' + (x * 2.4).toFixed(2) + 'deg) rotateX(' + (-y * 2.4).toFixed(2) + 'deg) translate3d(0,-3px,0)';
    });

    hero.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', function () { visual.style.transform = ''; }, { passive: true });
  }

  function initScrollMotion() {
    document.body.classList.add('produto-page');

    var selectors = [
      '.produto-oque__label', '.produto-oque__title', '.produto-oque__text', '.produto-oque__bullet', '.produto-oque__card',
      '.produto-cap__label', '.produto-cap__title', '.produto-cap__subtitle', '.produto-cap__card',
      '.produto-how__label', '.produto-how__title', '.produto-how__intro', '.produto-how__step', '.produto-how__cta-inline',
      '.produto-resultado__label', '.produto-resultado__title', '.produto-resultado__text', '.produto-resultado__item', '.produto-resultado__panel-card', '.produto-resultado__stat',
      '.produto-cta__eyebrow', '.produto-cta__title', '.produto-cta__text', '.produto-cta__group', '.produto-cta__outros',
      '.produto-compare__header', '.produto-compare__col', '.produto-compare__divider',
      '.produto-metrics__item'
    ];

    var elements = Array.prototype.slice.call(document.querySelectorAll(selectors.join(',')));

    elements.forEach(function (el) {
      if (el.classList.contains('reveal') || el.classList.contains('reveal--from-left') || el.classList.contains('reveal--from-right') || el.classList.contains('reveal--scale')) return;

      el.classList.add('motion-reveal');
      if (el.matches('.produto-oque__card, .produto-resultado__panel-card, .produto-cap__card, .produto-resultado__stat, .produto-metrics__item')) {
        el.classList.add('motion-reveal--scale');
      }

      var parent = el.parentElement;
      var sameGroup = parent ? Array.prototype.filter.call(parent.children, function (child) {
        return child.matches && child.matches(selectors.join(','));
      }) : [];
      var index = Math.max(0, sameGroup.indexOf(el));
      var delay = Math.min(index * 45, 260);
      el.style.setProperty('--motion-delay', delay + 'ms');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('motion-in'); });
      // Também ativa reveal--stagger imediatamente
      document.querySelectorAll('.reveal--stagger').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elements.forEach(function (el) {
      if (el.classList.contains('motion-reveal')) observer.observe(el);
    });

    // Observer para reveal--stagger (grupos de filhos)
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        staggerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -4% 0px' });

    document.querySelectorAll('.reveal--stagger').forEach(function (el) {
      staggerObserver.observe(el);
    });

    // Observer para reveal--fade
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal--fade').forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  function initSectionMouseLight() {
    if (reduceMotion || !finePointer || !desktop) return;
    var sections = document.querySelectorAll('.produto-oque, .produto-cap, .produto-how, .produto-resultado');
    sections.forEach(function (section) {
      var onMove = rafThrottle(function (event) {
        var rect = section.getBoundingClientRect();
        section.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        section.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
      section.addEventListener('mousemove', onMove, { passive: true });
    });
  }

  function initCardTilt() {
    if (reduceMotion || !finePointer || !desktop) return;
    var cards = document.querySelectorAll('.produto-cap__card, .produto-resultado__stat, .produto-oque__card, .produto-resultado__panel-card');
    cards.forEach(function (card) {
      var onMove = rafThrottle(function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 2.2).toFixed(2) + 'deg) rotateX(' + (-y * 2.2).toFixed(2) + 'deg) translate3d(0,-3px,0)';
      });
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; }, { passive: true });
    });
  }

  function initCardLightPosition() {
    if (reduceMotion || !finePointer || !desktop) return;
    var cards = document.querySelectorAll('.produto-cap__card, .produto-how__step');
    cards.forEach(function (card) {
      var onMove = rafThrottle(function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        card.style.setProperty('--card-y', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
      card.addEventListener('mousemove', onMove, { passive: true });
    });
  }

  function init() {
    initScrollMotion();
    initTechGrid();
    initHeroParallax();
    initSectionMouseLight();
    initCardTilt();
    initCardLightPosition();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
