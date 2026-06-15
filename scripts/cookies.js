/**
 * DB Softwares — Cookie Consent
 * Gerencia o banner de consentimento de cookies com localStorage.
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'db_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function hideBanner(banner) {
    banner.classList.add('cookie-banner--hiding');
    setTimeout(function () {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }, 400);
  }

  function initCookieBanner() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;

    // Se já deu consentimento, não mostra
    if (getConsent()) {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
      return;
    }

    // Mostra o banner com pequeno delay para não brigar com page load
    setTimeout(function () {
      banner.removeAttribute('aria-hidden');
      banner.classList.add('cookie-banner--visible');
    }, 800);

    // Botão Aceitar Todos
    var btnAccept = document.getElementById('cookieAccept');
    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        setConsent('accepted');
        hideBanner(banner);
      });
    }

    // Botão Apenas Essenciais
    var btnDecline = document.getElementById('cookieDecline');
    if (btnDecline) {
      btnDecline.addEventListener('click', function () {
        setConsent('essential');
        hideBanner(banner);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();
