/**
 * mini-form.js
 * Gerencia o envio de todos os mini formulários de contato
 * das páginas internas (sobre, atuacao, capacidades, produtos, cases).
 * Reutiliza o modal de confirmação definido em index.html —
 * aqui cria uma versão leve inline para as outras páginas.
 */
(function () {
  'use strict';

  /* ── Modal leve para páginas sem o modal do index ── */
  function createModal() {
    if (document.getElementById('miniFormModal')) return;

    var modal = document.createElement('div');
    modal.id = 'miniFormModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'miniFormModalTitle');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="form-success-modal__backdrop" id="miniFormBackdrop"></div>',
      '<div class="form-success-modal__box">',
        '<button class="form-success-modal__close" id="miniFormClose" type="button" aria-label="Fechar">',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">',
            '<line x1="18" y1="6" x2="6" y2="18"/>',
            '<line x1="6" y1="6" x2="18" y2="18"/>',
          '</svg>',
        '</button>',
        '<div class="form-success-modal__icon" aria-hidden="true">',
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">',
            '<circle cx="12" cy="12" r="10"/>',
            '<path d="m9 12 2 2 4-4"/>',
          '</svg>',
        '</div>',
        '<div class="form-success-modal__content">',
          '<h3 class="form-success-modal__title" id="miniFormModalTitle">Mensagem enviada!</h3>',
          '<p class="form-success-modal__desc">Recebemos sua mensagem e entraremos em contato em breve.</p>',
        '</div>',
        '<div class="form-success-modal__legal">',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">',
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
          '</svg>',
          '<p>Ao enviar seus dados, você confirmou estar de acordo com nossa ',
            '<a href="/pages/politica/politica.html" target="_blank" rel="noopener">Política de Privacidade</a>',
            ' e com os ',
            '<a href="/pages/politica/termos.html" target="_blank" rel="noopener">Termos de Uso</a>.',
          '</p>',
        '</div>',
        '<button class="form-success-modal__btn" id="miniFormOk" type="button">Entendido</button>',
      '</div>'
    ].join('');
    modal.className = 'form-success-modal';

    /* Inline styles apenas para o overlay — o CSS de home.css pode não estar carregado */
    var style = document.createElement('style');
    style.textContent = [
      '.form-success-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:none;opacity:0;transition:opacity .25s ease}',
      '.form-success-modal.is-open{opacity:1;pointer-events:all}',
      '.form-success-modal__backdrop{position:absolute;inset:0;background:rgba(10,16,32,.72);backdrop-filter:blur(4px)}',
      '.form-success-modal__box{position:relative;z-index:1;background:#fff;border-radius:20px;padding:40px 36px 32px;max-width:460px;width:100%;box-shadow:0 24px 64px rgba(10,16,32,.22);transform:translateY(18px) scale(.97);transition:transform .3s cubic-bezier(.22,.68,0,1.2),opacity .25s ease;text-align:center}',
      '.form-success-modal.is-open .form-success-modal__box{transform:translateY(0) scale(1)}',
      '.form-success-modal__close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:none;background:#f0f2f7;color:#6b7280;display:flex;align-items:center;justify-content:center;cursor:pointer}',
      '.form-success-modal__icon{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#e8edfa 0%,#d4ddf5 100%);color:#3E569E;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}',
      '.form-success-modal__title{font-size:22px;font-weight:800;color:#3E569E;margin:0 0 10px;letter-spacing:-.02em;line-height:1.2}',
      '.form-success-modal__desc{font-size:15px;color:#4b5572;line-height:1.6;margin:0 0 24px}',
      '.form-success-modal__legal{display:flex;align-items:flex-start;gap:8px;background:#f7f8fc;border:1px solid #e4e8f2;border-radius:10px;padding:12px 14px;text-align:left;margin-bottom:24px}',
      '.form-success-modal__legal svg{flex-shrink:0;margin-top:2px;color:#BDA07E}',
      '.form-success-modal__legal p{font-size:12px;color:#6b7280;line-height:1.55;margin:0}',
      '.form-success-modal__legal a{color:#3E569E;font-weight:600;text-decoration:underline}',
      '.form-success-modal__btn{display:block;width:100%;padding:14px 24px;border-radius:50px;border:none;background:#3E569E;color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:background .18s}'
    ].join('');
    document.head.appendChild(style);
    document.body.appendChild(modal);

    function close() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.getElementById('miniFormClose').addEventListener('click', close);
    document.getElementById('miniFormOk').addEventListener('click', close);
    document.getElementById('miniFormBackdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function openModal() {
    createModal();
    var modal = document.getElementById('miniFormModal');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var ok = document.getElementById('miniFormOk');
      if (ok) ok.focus();
    }, 80);
  }

  /* ── Vincular todos os mini-forms da página ── */
  function bindForms() {
    var forms = document.querySelectorAll('.mini-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        openModal();
        form.reset();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindForms);
  } else {
    bindForms();
  }
})();
