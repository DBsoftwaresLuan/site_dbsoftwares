/**
 * FAQ – DB Softwares
 * Funcionalidades: acordeão, filtro por categoria, busca em tempo real
 */

(function () {
  'use strict';

  // ── Acordeão ──────────────────────────────────────────────────
  function initAccordion() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach(function (item) {
      const btn = item.querySelector('.faq-item__question');
      const answer = item.querySelector('.faq-item__answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        const isOpen = item.classList.contains('faq-item--open');

        // Fecha todos os outros itens abertos
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('faq-item--open')) {
            other.classList.remove('faq-item--open');
            const otherBtn = other.querySelector('.faq-item__question');
            const otherAnswer = other.querySelector('.faq-item__answer');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.hidden = true;
          }
        });

        // Alterna o item atual
        if (isOpen) {
          item.classList.remove('faq-item--open');
          btn.setAttribute('aria-expanded', 'false');
          answer.hidden = true;
        } else {
          item.classList.add('faq-item--open');
          btn.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  }

  // ── Filtro por Categoria ──────────────────────────────────────
  function initCategoryFilter() {
    const catBtns = document.querySelectorAll('.faq-cat-btn');
    const groups = document.querySelectorAll('.faq-group');
    const items = document.querySelectorAll('.faq-item');

    catBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const category = btn.dataset.category;

        // Atualiza estado dos botões
        catBtns.forEach(function (b) {
          b.classList.remove('faq-cat-btn--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('faq-cat-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        // Mostra/oculta grupos e itens conforme categoria
        if (category === 'all') {
          groups.forEach(function (g) { g.hidden = false; });
          items.forEach(function (i) { i.hidden = false; });
        } else {
          groups.forEach(function (g) {
            g.hidden = g.dataset.category !== category;
          });
          items.forEach(function (i) {
            i.hidden = i.dataset.category !== category;
          });
        }

        // Limpa a busca ao trocar de categoria
        const searchInput = document.getElementById('faqSearchInput');
        if (searchInput && searchInput.value.trim() !== '') {
          searchInput.value = '';
          clearSearchHighlights();
          updateSearchCount('');
        }

        // Fecha todos os itens abertos
        closeAllItems();

        // Oculta mensagem "sem resultados"
        setEmptyState(false);
      });
    });
  }

  // ── Busca em Tempo Real ───────────────────────────────────────
  function initSearch() {
    const input = document.getElementById('faqSearchInput');
    const clearBtn = document.getElementById('faqSearchClear');
    const resetBtn = document.getElementById('faqResetBtn');

    if (!input) return;

    input.addEventListener('input', function () {
      const query = input.value.trim();
      clearBtn.hidden = query === '';
      performSearch(query);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.hidden = true;
        clearSearchHighlights();
        updateSearchCount('');
        resetToAll();
        input.focus();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        input.value = '';
        if (clearBtn) clearBtn.hidden = true;
        clearSearchHighlights();
        updateSearchCount('');
        resetToAll();
      });
    }
  }

  function performSearch(query) {
    const items = document.querySelectorAll('.faq-item');
    const groups = document.querySelectorAll('.faq-group');

    clearSearchHighlights();

    if (query === '') {
      resetToAll();
      updateSearchCount('');
      return;
    }

    // Reseta filtro de categoria para "all" durante a busca
    const catBtns = document.querySelectorAll('.faq-cat-btn');
    catBtns.forEach(function (b) {
      b.classList.remove('faq-cat-btn--active');
      b.setAttribute('aria-pressed', 'false');
    });
    const allBtn = document.querySelector('.faq-cat-btn[data-category="all"]');
    if (allBtn) {
      allBtn.classList.add('faq-cat-btn--active');
      allBtn.setAttribute('aria-pressed', 'true');
    }

    groups.forEach(function (g) { g.hidden = false; });

    const normalized = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    let visibleCount = 0;

    items.forEach(function (item) {
      const questionEl = item.querySelector('.faq-item__text');
      const answerEl = item.querySelector('.faq-item__answer p');
      if (!questionEl) return;

      const questionText = questionEl.textContent || '';
      const answerText = answerEl ? (answerEl.textContent || '') : '';
      const combined = (questionText + ' ' + answerText)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (combined.includes(normalized)) {
        item.hidden = false;
        visibleCount++;
        highlightText(questionEl, query);
        if (answerEl) highlightText(answerEl, query);
      } else {
        item.hidden = true;
      }
    });

    // Oculta grupos sem itens visíveis
    groups.forEach(function (g) {
      const visibleItems = g.querySelectorAll('.faq-item:not([hidden])');
      g.hidden = visibleItems.length === 0;
    });

    setEmptyState(visibleCount === 0);
    updateSearchCount(query, visibleCount);
  }

  function highlightText(el, query) {
    const original = el.innerHTML;
    const normalized = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Faz o highlight direto no texto visível
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(function (textNode) {
      const text = textNode.textContent;
      const textNorm = text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (!textNorm.includes(normalized)) return;

      const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
      const highlighted = text.replace(regex, '<mark class="faq-highlight">$1</mark>');
      const span = document.createElement('span');
      span.innerHTML = highlighted;
      textNode.parentNode.replaceChild(span, textNode);
    });
  }

  function clearSearchHighlights() {
    document.querySelectorAll('.faq-highlight').forEach(function (mark) {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
    // Remove spans vazios que possam ter ficado
    document.querySelectorAll('.faq-item span:empty').forEach(function (s) {
      s.remove();
    });
  }

  function updateSearchCount(query, count) {
    const el = document.getElementById('faqSearchCount');
    if (!el) return;
    if (query === '') {
      el.textContent = '';
    } else {
      el.textContent = count === 1
        ? '1 pergunta encontrada'
        : count + ' perguntas encontradas';
    }
  }

  function resetToAll() {
    const groups = document.querySelectorAll('.faq-group');
    const items = document.querySelectorAll('.faq-item');

    groups.forEach(function (g) { g.hidden = false; });
    items.forEach(function (i) { i.hidden = false; });
    setEmptyState(false);

    const catBtns = document.querySelectorAll('.faq-cat-btn');
    catBtns.forEach(function (b) {
      b.classList.remove('faq-cat-btn--active');
      b.setAttribute('aria-pressed', 'false');
    });
    const allBtn = document.querySelector('.faq-cat-btn[data-category="all"]');
    if (allBtn) {
      allBtn.classList.add('faq-cat-btn--active');
      allBtn.setAttribute('aria-pressed', 'true');
    }
  }

  function closeAllItems() {
    document.querySelectorAll('.faq-item--open').forEach(function (item) {
      item.classList.remove('faq-item--open');
      const btn = item.querySelector('.faq-item__question');
      const answer = item.querySelector('.faq-item__answer');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (answer) answer.hidden = true;
    });
  }

  function setEmptyState(show) {
    const empty = document.getElementById('faqEmpty');
    if (empty) empty.hidden = !show;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Ano do rodapé ──────────────────────────────────────────────
  function initFooterYear() {
    const el = document.getElementById('ftYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ── Reveal on Scroll ───────────────────────────────────────────
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initAccordion();
    initCategoryFilter();
    initSearch();
    initFooterYear();
    initReveal();
  });
})();
