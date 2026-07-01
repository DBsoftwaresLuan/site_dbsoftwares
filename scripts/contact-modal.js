/**
 * contact-modal.js
 * Modal global de "Receber Contato" — abre um formulário para o usuário
 * deixar nome, e-mail, telefone e mensagem.
 * Expõe window.openContactModal() para ser chamado por qualquer botão/link.
 */
(function () {
  'use strict';

  var MODAL_ID = 'contactRequestModal';

  /* ── Injetar estilos ── */
  function injectStyles() {
    if (document.getElementById('contactModalStyles')) return;
    var style = document.createElement('style');
    style.id = 'contactModalStyles';
    style.textContent = [
      /* Overlay */
      '.crm-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:none;opacity:0;transition:opacity .25s ease}',
      '.crm-overlay.is-open{opacity:1;pointer-events:all}',
      '.crm-overlay__backdrop{position:absolute;inset:0;background:rgba(10,16,32,.78);backdrop-filter:blur(5px)}',

      /* Box */
      '.crm-box{position:relative;z-index:1;background:#fff;border-radius:20px;padding:40px 36px 36px;max-width:520px;width:100%;box-shadow:0 28px 72px rgba(10,16,32,.28);transform:translateY(22px) scale(.97);transition:transform .32s cubic-bezier(.22,.68,0,1.2),opacity .25s ease}',
      '.crm-overlay.is-open .crm-box{transform:translateY(0) scale(1)}',

      /* Close */
      '.crm-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:#f0f2f7;color:#6b7280;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}',
      '.crm-close:hover{background:#e4e8f2;color:#1a2550}',

      /* Header */
      '.crm-header{margin-bottom:28px}',
      '.crm-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#BDA07E;margin-bottom:10px}',
      '.crm-eyebrow svg{flex-shrink:0}',
      '.crm-title{font-size:22px;font-weight:800;color:#1a2550;letter-spacing:-.025em;line-height:1.2;margin:0 0 8px}',
      '.crm-desc{font-size:14px;color:#6b7280;line-height:1.6;margin:0}',

      /* Form grid */
      '.crm-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
      '.crm-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}',
      '.crm-group--full{grid-column:1/-1}',
      '.crm-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#6b7280}',
      '.crm-label span{color:#BDA07E;margin-left:2px}',
      '.crm-input,.crm-textarea{width:100%;background:#f7f8fc;border:1.5px solid #e4e8f2;border-radius:10px;padding:11px 14px;font-size:14px;font-family:inherit;color:#1a2550;outline:none;transition:border-color .18s,background .18s;box-sizing:border-box}',
      '.crm-input:focus,.crm-textarea:focus{border-color:#3E569E;background:#fff}',
      '.crm-input::placeholder,.crm-textarea::placeholder{color:#b0b8cc}',
      '.crm-textarea{resize:vertical;min-height:90px}',

      /* Footer */
      '.crm-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:8px}',
      '.crm-legal{font-size:11px;color:#9ca3af;line-height:1.5}',
      '.crm-legal a{color:#3E569E;font-weight:600;text-decoration:underline;text-underline-offset:2px}',
      '.crm-submit{flex-shrink:0;display:inline-flex;align-items:center;gap:8px;padding:13px 30px;border-radius:50px;border:none;background:#3E569E;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:background .18s,transform .12s}',
      '.crm-submit:hover{background:#2d4082;transform:translateY(-1px)}',
      '.crm-submit:active{transform:translateY(0)}',

      /* Responsivo */
      '@media(max-width:540px){',
        '.crm-box{padding:32px 20px 28px}',
        '.crm-row{grid-template-columns:1fr}',
        '.crm-footer{flex-direction:column;align-items:stretch}',
        '.crm-submit{width:100%;justify-content:center}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Criar DOM do modal ── */
  function createModal() {
    if (document.getElementById(MODAL_ID)) return;

    var el = document.createElement('div');
    el.id = MODAL_ID;
    el.className = 'crm-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'crmTitle');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = [
      '<div class="crm-overlay__backdrop" id="crmBackdrop"></div>',
      '<div class="crm-box" role="document">',
        '<button class="crm-close" id="crmClose" type="button" aria-label="Fechar">',
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">',
            '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
          '</svg>',
        '</button>',
        '<div class="crm-header">',
          '<p class="crm-eyebrow">',
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">',
              '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.91z"/>',
            '</svg>',
            'Receber Contato',
          '</p>',
          '<h2 class="crm-title" id="crmTitle">Fale com um especialista</h2>',
          '<p class="crm-desc">Preencha o formulário abaixo e entraremos em contato em breve.</p>',
        '</div>',
        '<form class="crm-form" id="crmForm" novalidate>',
          '<div class="crm-row">',
            '<div class="crm-group">',
              '<label class="crm-label" for="crmName">Nome<span aria-hidden="true">*</span></label>',
              '<input class="crm-input" id="crmName" name="name" type="text" placeholder="Seu nome" required autocomplete="name"/>',
            '</div>',
            '<div class="crm-group">',
              '<label class="crm-label" for="crmEmail">E-mail<span aria-hidden="true">*</span></label>',
              '<input class="crm-input" id="crmEmail" name="email" type="email" placeholder="seu@email.com.br" required autocomplete="email"/>',
            '</div>',
          '</div>',
          '<div class="crm-group">',
            '<label class="crm-label" for="crmPhone">Telefone / WhatsApp</label>',
            '<input class="crm-input" id="crmPhone" name="phone" type="tel" placeholder="(xx) 9xxxx-xxxx" autocomplete="tel"/>',
          '</div>',
          '<div class="crm-group">',
            '<label class="crm-label" for="crmMessage">Mensagem</label>',
            '<textarea class="crm-textarea" id="crmMessage" name="message" rows="3" placeholder="Como podemos ajudar você?"></textarea>',
          '</div>',
          '<div class="crm-footer">',
            '<p class="crm-legal">',
              'Ao enviar, você concorda com nossa ',
              '<a href="/pages/politica/politica.html" target="_blank" rel="noopener">Política de Privacidade</a>.',
            '</p>',
            '<button class="crm-submit" type="submit">',
              'Enviar',
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">',
                '<path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>',
              '</svg>',
            '</button>',
          '</div>',
        '</form>',
      '</div>'
    ].join('');

    document.body.appendChild(el);

    function close() {
      el.setAttribute('aria-hidden', 'true');
      el.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.getElementById('crmClose').addEventListener('click', close);
    document.getElementById('crmBackdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.classList.contains('is-open')) close();
    });

    document.getElementById('crmForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      close();
      form.reset();
      /* Reutiliza o modal de confirmação do mini-form.js se disponível */
      if (typeof window._miniFormOpenModal === 'function') {
        window._miniFormOpenModal();
      } else {
        showSuccess();
      }
    });
  }

  /* ── Modal de sucesso leve (fallback quando mini-form.js não está na página) ── */
  function showSuccess() {
    var s = document.createElement('div');
    s.setAttribute('role', 'alertdialog');
    s.setAttribute('aria-modal', 'true');
    s.setAttribute('aria-label', 'Mensagem enviada');
    s.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,16,32,.78);backdrop-filter:blur(5px)';
    s.innerHTML = [
      '<div style="background:#fff;border-radius:20px;padding:40px 36px 32px;max-width:420px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(10,16,32,.22)">',
        '<div style="width:64px;height:64px;border-radius:50%;background:#e8edfa;color:#3E569E;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">',
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
        '</div>',
        '<h3 style="font-size:20px;font-weight:800;color:#3E569E;margin:0 0 10px">Mensagem enviada!</h3>',
        '<p style="font-size:14px;color:#4b5572;line-height:1.6;margin:0 0 24px">Recebemos suas informações e entraremos em contato em breve.</p>',
        '<button id="crmSuccessOk" style="display:block;width:100%;padding:13px 24px;border-radius:50px;border:none;background:#3E569E;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Entendido</button>',
      '</div>'
    ].join('');
    document.body.appendChild(s);
    document.getElementById('crmSuccessOk').addEventListener('click', function () {
      document.body.removeChild(s);
      document.body.style.overflow = '';
    });
  }

  /* ── API pública ── */
  window.openContactModal = function () {
    injectStyles();
    createModal();
    var el = document.getElementById(MODAL_ID);
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var first = el.querySelector('input,textarea,button');
      if (first) first.focus();
    }, 80);
  };
})();
