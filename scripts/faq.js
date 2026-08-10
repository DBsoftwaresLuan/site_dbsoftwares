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

  // ── Motor de Busca Inteligente ────────────────────────────────

  // Mapa de sinônimos / ideias relacionadas
  // Chave: termo que o usuário pode digitar → expansão para busca
  var SYNONYMS = {
    'robo': ['automacao', 'rpa', 'bot'],
    'parceiro': ['parceria', 'db partner', 'revenda', 'comissao', 'indicacao'],
    'parceria': ['parceiro', 'db partner', 'revenda', 'comissao'],
    'comissao': ['parceiro', 'parceria', 'receita', 'ganhar dinheiro'],
    'revenda': ['parceiro', 'parceria', 'db partner'],
    'bot': ['automacao', 'rpa', 'hyperautomacao'],
    'automatizar': ['automacao', 'hyperautomacao', 'rpa'],
    'automatizacao': ['automacao', 'hyperautomacao'],
    'ia': ['inteligencia artificial', 'machine learning', 'llm', 'gpt', 'modelo'],
    'inteligencia': ['ia', 'machine learning', 'gpt', 'modelo'],
    'custo': ['roi', 'retorno', 'investimento', 'economizar', 'economia'],
    'preco': ['custo', 'valor', 'investimento', 'roi', 'quanto'],
    'valor': ['preco', 'custo', 'investimento', 'roi'],
    'quanto': ['preco', 'custo', 'valor', 'investimento'],
    'seguranca': ['lgpd', 'privacidade', 'dados', 'etica', 'conformidade'],
    'privacidade': ['lgpd', 'dados', 'seguranca'],
    'lgpd': ['privacidade', 'dados', 'seguranca', 'conformidade'],
    'dados': ['lgpd', 'privacidade', 'seguranca', 'observabilidade'],
    'monitoramento': ['observabilidade', 'rastreabilidade', 'controle', 'noc'],
    'observabilidade': ['monitoramento', 'rastreabilidade', 'controle'],
    'governanca': ['controle', 'gestao', 'processo', 'compliance'],
    'gestao': ['governanca', 'controle', 'processo'],
    'processo': ['governanca', 'fluxo', 'operacao', 'bpm'],
    'erro': ['falha', 'problema', 'bug', 'incidente', 'retrabalho'],
    'falha': ['erro', 'problema', 'incidente', 'bug'],
    'retrabalho': ['erro', 'falha', 'qualidade', 'eficiencia'],
    'eficiencia': ['produtividade', 'desempenho', 'performance', 'otimizacao'],
    'produtividade': ['eficiencia', 'desempenho', 'automacao'],
    'industria': ['industrial', 'manufactura', 'fabricacao', 'producao'],
    'industria': ['fabrica', 'industria', 'chao de fabrica'],
    'administrativo': ['backoffice', 'financeiro', 'contabil', 'rh'],
    'financeiro': ['financas', 'contabil', 'contabilidade', 'roi', 'custo'],
    'rh': ['recursos humanos', 'pessoas', 'colaboradores', 'funcionarios'],
    'saude': ['clinica', 'hospital', 'medico', 'healthcare'],
    'noc': ['suporte', 'sustentacao', 'continuidade', 'operacional'],
    'suporte': ['noc', 'sustentacao', 'continuidade', 'atendimento'],
    'contrato': ['terceirizacao', 'outsourcing', 'parceria', 'servico'],
    'terceirizar': ['outsourcing', 'contrato', 'parceria', 'terceirizacao'],
    'resultado': ['roi', 'retorno', 'beneficio', 'impacto'],
    'tecnologia': ['software', 'plataforma', 'sistema', 'ferramenta'],
    'software': ['sistema', 'plataforma', 'tecnologia', 'ferramenta'],
    'integracao': ['api', 'conector', 'sistema', 'erp', 'crm'],
    'erp': ['sap', 'sistema', 'integracao', 'conector'],
    'crm': ['salesforce', 'cliente', 'vendas', 'integracao'],
    'escalar': ['crescimento', 'expansao', 'escala', 'crescer'],
    'crescimento': ['escalar', 'expansao', 'escala'],
    'confianca': ['etica', 'transparencia', 'seguranca', 'responsabilidade'],
    'etica': ['confianca', 'transparencia', 'responsabilidade', 'bias'],
    'como': ['o que e', 'funciona', 'como funciona'],
    'o que': ['como', 'o que e', 'definicao', 'conceito'],
    'diferenca': ['diferencial', 'comparacao', 'versus', 'vs'],
    'diferencial': ['diferenca', 'vantagem', 'comparacao']
  };

  var selectedSuggestionIndex = -1;
  var currentSuggestions = [];

  function buildSuggestionsList() {
    var items = document.querySelectorAll('.faq-item');
    var list = [];
    items.forEach(function (item) {
      var questionEl = item.querySelector('.faq-item__text');
      var answerEl = item.querySelector('.faq-item__answer p');
      var answerId = item.querySelector('.faq-item__question') &&
        item.querySelector('.faq-item__question').getAttribute('aria-controls');
      if (questionEl && answerId) {
        list.push({
          question: questionEl.textContent.trim(),
          answer: answerEl ? answerEl.textContent.trim() : '',
          answerId: answerId,
          item: item
        });
      }
    });
    return list;
  }

  // Distância de Levenshtein simplificada (máx 2 erros tolerados)
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    // Limita custo da matriz para performance
    var maxLen = Math.max(a.length, b.length);
    if (maxLen > 20) return maxLen; // palavras longas: não calcular
    var prev = [];
    var curr = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (var j2 = 1; j2 <= b.length; j2++) {
        var cost = a[i - 1] === b[j2 - 1] ? 0 : 1;
        curr[j2] = Math.min(curr[j2 - 1] + 1, prev[j2] + 1, prev[j2 - 1] + cost);
      }
      var tmp = prev; prev = curr; curr = tmp;
    }
    return prev[b.length];
  }

  // Verifica se uma palavra tem correspondência fuzzy com alguma palavra do texto
  function fuzzyWordMatch(queryWord, textWords) {
    if (queryWord.length < 3) return textWords.some(function (w) { return w.startsWith(queryWord); });
    var threshold = queryWord.length <= 5 ? 1 : 2;
    for (var i = 0; i < textWords.length; i++) {
      var w = textWords[i];
      // Correspondência por prefixo (sílabas)
      if (w.startsWith(queryWord) || queryWord.startsWith(w.substring(0, Math.floor(w.length * 0.7)))) return true;
      // Correspondência fuzzy
      if (Math.abs(w.length - queryWord.length) <= threshold + 1) {
        if (levenshtein(queryWord, w) <= threshold) return true;
        // Substring de 4+ caracteres dentro de palavra maior
        if (queryWord.length >= 4 && w.includes(queryWord.substring(0, Math.floor(queryWord.length * 0.8)))) return true;
      }
    }
    return false;
  }

  // Expande a query com sinônimos mapeados
  function expandQueryTerms(normalizedQuery) {
    var terms = [normalizedQuery];
    var words = normalizedQuery.split(/\s+/);
    words.forEach(function (word) {
      if (SYNONYMS[word]) {
        SYNONYMS[word].forEach(function (syn) { terms.push(syn); });
      }
      // Verifica prefixos (ex: "automat" encontra "automatizacao")
      Object.keys(SYNONYMS).forEach(function (key) {
        if (key.startsWith(word) || word.startsWith(key)) {
          SYNONYMS[key].forEach(function (syn) { terms.push(syn); });
        }
      });
    });
    return terms;
  }

  // Função principal de score inteligente para uma entrada
  function scoreEntry(entry, query) {
    var normQuery = normalizeStr(query);
    var normQ = normalizeStr(entry.question);
    var normA = normalizeStr(entry.answer);
    var combined = normQ + ' ' + normA;
    var score = 0;

    // 1. Correspondência exata da frase completa (máxima pontuação)
    if (normQ.includes(normQuery)) score += normQ.startsWith(normQuery) ? 100 : 80;
    else if (combined.includes(normQuery)) score += 50;

    // 2. Correspondência por tokens (cada palavra individualmente)
    var queryWords = normQuery.split(/\s+/).filter(function (w) { return w.length >= 2; });
    var combinedWords = combined.split(/\W+/).filter(function (w) { return w.length >= 2; });
    var matchedWords = 0;
    queryWords.forEach(function (qw) {
      if (combined.includes(qw)) {
        matchedWords++;
        score += normQ.includes(qw) ? 20 : 8;
      }
    });
    // Bônus se todas as palavras foram encontradas
    if (queryWords.length > 1 && matchedWords === queryWords.length) score += 30;

    // 3. Correspondência fuzzy por palavra (tolera erros de digitação)
    queryWords.forEach(function (qw) {
      if (qw.length >= 3 && !combined.includes(qw)) {
        if (fuzzyWordMatch(qw, combinedWords)) {
          score += 15;
        }
      }
    });

    // 4. Expansão por sinônimos
    var expanded = expandQueryTerms(normQuery);
    expanded.slice(1).forEach(function (syn) { // slice(1) pula o original
      if (combined.includes(syn)) score += 12;
    });

    // 5. Correspondência parcial por sílaba / início de palavra
    if (score === 0 && normQuery.length >= 3) {
      combinedWords.forEach(function (w) {
        if (w.startsWith(normQuery.substring(0, Math.floor(normQuery.length * 0.75)))) score += 10;
      });
    }

    return score;
  }

  function getAutocompleteSuggestions(query, allQuestions) {
    if (!query || query.length < 2) return [];
    var results = [];

    allQuestions.forEach(function (entry) {
      var score = scoreEntry(entry, query);
      if (score > 0) results.push({ entry: entry, score: score });
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

  // ── Busca em Tempo Real ────────────────��──────────────────────
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
    var items = document.querySelectorAll('.faq-item');
    var groups = document.querySelectorAll('.faq-group');

    clearSearchHighlights();

    if (query === '') {
      resetToAll();
      updateSearchCount('');
      return;
    }

    // Reseta filtro de categoria para "all" durante a busca
    var catBtns = document.querySelectorAll('.faq-cat-btn');
    catBtns.forEach(function (b) {
      b.classList.remove('faq-cat-btn--active');
      b.setAttribute('aria-pressed', 'false');
    });
    var allBtn = document.querySelector('.faq-cat-btn[data-category="all"]');
    if (allBtn) {
      allBtn.classList.add('faq-cat-btn--active');
      allBtn.setAttribute('aria-pressed', 'true');
    }

    groups.forEach(function (g) { g.hidden = false; });

    var visibleCount = 0;

    // Calcula score para cada item usando o motor inteligente
    var scored = [];
    items.forEach(function (item) {
      var questionEl = item.querySelector('.faq-item__text');
      var answerEl = item.querySelector('.faq-item__answer p');
      if (!questionEl) return;

      var entry = {
        question: questionEl.textContent.trim(),
        answer: answerEl ? answerEl.textContent.trim() : '',
        item: item
      };

      var score = scoreEntry(entry, query);
      scored.push({ item: item, questionEl: questionEl, answerEl: answerEl, score: score });
    });

    // Define threshold dinâmico: mostra mesmo scores baixos se não houver nada melhor
    var maxScore = scored.reduce(function (m, s) { return Math.max(m, s.score); }, 0);
    // Threshold: pelo menos 20% do melhor score, mínimo 5
    var threshold = maxScore > 0 ? Math.max(5, maxScore * 0.2) : 0;

    scored.forEach(function (s) {
      if (s.score >= threshold) {
        s.item.hidden = false;
        visibleCount++;
        highlightText(s.questionEl, query);
        if (s.answerEl) highlightText(s.answerEl, query);
      } else {
        s.item.hidden = true;
      }
    });

    // Oculta grupos sem itens visíveis
    groups.forEach(function (g) {
      var visibleItems = g.querySelectorAll('.faq-item:not([hidden])');
      g.hidden = visibleItems.length === 0;
    });

    // Se ainda sem resultado, tenta busca ainda mais tolerante (qualquer score > 0)
    if (visibleCount === 0 && maxScore === 0) {
      // Fallback: busca por cada sílaba de 3+ chars individualmente
      var normQ = normalizeStr(query);
      var syllables = [];
      for (var i = 0; i <= normQ.length - 3; i++) {
        syllables.push(normQ.substring(i, i + 3));
      }

      scored.forEach(function (s) {
        var combined = normalizeStr(s.questionEl.textContent + ' ' + (s.answerEl ? s.answerEl.textContent : ''));
        var hit = syllables.some(function (syl) { return combined.includes(syl); });
        if (hit) {
          s.item.hidden = false;
          visibleCount++;
        }
      });

      groups.forEach(function (g) {
        var visibleItems = g.querySelectorAll('.faq-item:not([hidden])');
        g.hidden = visibleItems.length === 0;
      });
    }

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
