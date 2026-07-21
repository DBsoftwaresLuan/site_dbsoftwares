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

  // ── Autocomplete ──────────────────────────────────────────────
  var selectedSuggestionIndex = -1;
  var currentSuggestions = [];

  function buildSuggestionsList() {
    var items = document.querySelectorAll('.faq-item');
    var list = [];
    items.forEach(function (item) {
      var questionEl = item.querySelector('.faq-item__text');
      var answerId = item.querySelector('.faq-item__question') &&
        item.querySelector('.faq-item__question').getAttribute('aria-controls');
      if (questionEl && answerId) {
        list.push({
          question: questionEl.textContent.trim(),
          answerId: answerId,
          item: item
        });
      }
    });
    return list;
  }

  function getAutocompleteSuggestions(query, allQuestions) {
    if (!query || query.length < 2) return [];
    var normalized = normalizeStr(query);
    var results = [];

    allQuestions.forEach(function (entry) {
      var normQ = normalizeStr(entry.question);
      if (normQ.includes(normalized)) {
        var score = normQ.startsWith(normalized) ? 2 : 1;
        results.push({ entry: entry, score: score });
      }
    });

    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 6).map(function (r) { return r.entry; });
  }

  function normalizeStr(str) {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function createSuggestionsDropdown() {
    var dropdown = document.createElement('ul');
    dropdown.id = 'faqSuggestionsDropdown';
    dropdown.className = 'faq-suggestions';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Sugestoes de perguntas');
    dropdown.hidden = true;
    return dropdown;
  }

  function renderSuggestions(suggestions, query, dropdown) {
    dropdown.innerHTML = '';
    selectedSuggestionIndex = -1;

    if (!suggestions.length) {
      dropdown.hidden = true;
      return;
    }

    suggestions.forEach(function (entry, idx) {
      var li = document.createElement('li');
      li.className = 'faq-suggestions__item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.setAttribute('data-idx', idx);

      var icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
      var highlighted = highlightSuggestion(entry.question, query);
      li.innerHTML = icon + '<span>' + highlighted + '</span>';

      li.addEventListener('mousedown', function (e) {
        e.preventDefault();
        selectSuggestion(entry, dropdown);
      });

      dropdown.appendChild(li);
    });

    dropdown.hidden = false;
  }

  function highlightSuggestion(text, query) {
    var escaped = escapeRegex(query);
    var regex = new RegExp('(' + escaped + ')', 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  function selectSuggestion(entry, dropdown) {
    var input = document.getElementById('faqSearchInput');
    var clearBtn = document.getElementById('faqSearchClear');
    if (input) {
      input.value = entry.question;
      if (clearBtn) clearBtn.hidden = false;
    }
    dropdown.hidden = true;
    selectedSuggestionIndex = -1;
    navigateToQuestion(entry);
  }

  function navigateToQuestion(entry) {
    // Mostra todos os grupos e itens primeiro
    resetToAll();

    var item = entry.item;
    var btn = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    // Garante que o item esteja visível e aberto
    if (btn && answer) {
      item.classList.add('faq-item--open');
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }

    // Rola suavemente até a pergunta
    setTimeout(function () {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      item.classList.add('faq-item--highlighted');
      setTimeout(function () {
        item.classList.remove('faq-item--highlighted');
      }, 2000);
    }, 80);

    // Atualiza contagem
    updateSearchCount(entry.question, 1);
  }

  function moveSuggestionFocus(direction, suggestions, dropdown) {
    var items = dropdown.querySelectorAll('.faq-suggestions__item');
    if (!items.length) return;

    if (selectedSuggestionIndex >= 0) {
      items[selectedSuggestionIndex].classList.remove('faq-suggestions__item--active');
      items[selectedSuggestionIndex].setAttribute('aria-selected', 'false');
    }

    selectedSuggestionIndex += direction;

    if (selectedSuggestionIndex < 0) selectedSuggestionIndex = items.length - 1;
    if (selectedSuggestionIndex >= items.length) selectedSuggestionIndex = 0;

    items[selectedSuggestionIndex].classList.add('faq-suggestions__item--active');
    items[selectedSuggestionIndex].setAttribute('aria-selected', 'true');
  }

  // ── Busca em Tempo Real ───────────────────────────────────────
  function initSearch() {
    var input = document.getElementById('faqSearchInput');
    var clearBtn = document.getElementById('faqSearchClear');
    var resetBtn = document.getElementById('faqResetBtn');

    if (!input) return;

    var allQuestions = buildSuggestionsList();
    var searchWrap = input.closest('.faq-search__wrap');
    var dropdown = createSuggestionsDropdown();
    if (searchWrap) searchWrap.appendChild(dropdown);

    input.addEventListener('input', function () {
      var query = input.value.trim();
      clearBtn.hidden = query === '';
      performSearch(query);

      currentSuggestions = getAutocompleteSuggestions(query, allQuestions);
      renderSuggestions(currentSuggestions, query, dropdown);
    });

    input.addEventListener('keydown', function (e) {
      if (e.nativeEvent && e.nativeEvent.isComposing) return;
      if (e.keyCode === 229) return;

      if (!dropdown.hidden && currentSuggestions.length) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveSuggestionFocus(1, currentSuggestions, dropdown);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveSuggestionFocus(-1, currentSuggestions, dropdown);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
            selectSuggestion(currentSuggestions[selectedSuggestionIndex], dropdown);
          } else if (currentSuggestions.length > 0) {
            // Enter sem seleção navega para a melhor correspondência
            selectSuggestion(currentSuggestions[0], dropdown);
          }
          return;
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Sem dropdown: navega para primeiro resultado da busca atual
        var query = input.value.trim();
        if (query) {
          var matches = getAutocompleteSuggestions(query, allQuestions);
          if (matches.length > 0) {
            navigateToQuestion(matches[0]);
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        dropdown.hidden = true;
        selectedSuggestionIndex = -1;
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(function () {
        dropdown.hidden = true;
        selectedSuggestionIndex = -1;
      }, 150);
    });

    input.addEventListener('focus', function () {
      var query = input.value.trim();
      if (query.length >= 2) {
        currentSuggestions = getAutocompleteSuggestions(query, allQuestions);
        renderSuggestions(currentSuggestions, query, dropdown);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.hidden = true;
        dropdown.hidden = true;
        currentSuggestions = [];
        selectedSuggestionIndex = -1;
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
        dropdown.hidden = true;
        currentSuggestions = [];
        selectedSuggestionIndex = -1;
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
