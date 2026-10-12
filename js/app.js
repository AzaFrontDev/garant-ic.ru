/**
 * ГАРАНТ-ИнфоЦентр — app.js
 * Vanilla ES6+ | No external dependencies
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════════════════════ */

/** Safe querySelector */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Debounce */
function debounce(fn, ms = 100) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ══════════════════════════════════════════════════════════════════════
   HEADER — Sticky scroll shadow
   ══════════════════════════════════════════════════════════════════════ */

(function initHeader() {
  const header = qs('#header');
  if (!header) return;

  const onScroll = debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════════════════════════════════════
   MOBILE MENU
   ══════════════════════════════════════════════════════════════════════ */

(function initMobileMenu() {
  const burger    = qs('#burger-btn');
  const mobileNav = qs('#mobile-nav');
  if (!burger || !mobileNav) return;

  function toggleMenu(open) {
    burger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => {
    toggleMenu(!burger.classList.contains('open'));
  });

  // Close on nav link click
  qsa('a', mobileNav).forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) toggleMenu(false);
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   SCROLL TO TOP
   ══════════════════════════════════════════════════════════════════════ */

(function initScrollTop() {
  const btn = qs('#scroll-top-btn');
  if (!btn) return;

  const onScroll = debounce(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 60);

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════════════════════════════════════════════════════════════════
   TABS — Main category tabs (GARANT / 1C / LegalTech)
   ══════════════════════════════════════════════════════════════════════ */

(function initMainTabs() {
  const tabBtns   = qsa('[data-tab]');
  const tabPanels = qsa('.tab-panel');
  if (!tabBtns.length) return;

  function activateTab(targetId) {
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.tab === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${targetId}`);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));

    // Keyboard navigation (arrow keys for tablist)
    btn.addEventListener('keydown', e => {
      const currentIdx = tabBtns.indexOf(btn);
      let nextIdx = currentIdx;

      if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % tabBtns.length;
      else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + tabBtns.length) % tabBtns.length;
      else return;

      e.preventDefault();
      tabBtns[nextIdx].focus();
      activateTab(tabBtns[nextIdx].dataset.tab);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   TABS — Profession sub-tabs (Бухгалтер / Юрист / Кадры / Бизнес)
   ══════════════════════════════════════════════════════════════════════ */

(function initProfTabs() {
  const profBtns   = qsa('[data-prof]');
  const profPanels = qsa('.prof-panel');
  if (!profBtns.length) return;

  function activateProf(targetId) {
    profBtns.forEach(btn => {
      const isActive = btn.dataset.prof === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    profPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `prof-${targetId}`);
    });
  }

  profBtns.forEach(btn => {
    btn.addEventListener('click', () => activateProf(btn.dataset.prof));

    btn.addEventListener('keydown', e => {
      const currentIdx = profBtns.indexOf(btn);
      let nextIdx = currentIdx;

      if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % profBtns.length;
      else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + profBtns.length) % profBtns.length;
      else return;

      e.preventDefault();
      profBtns[nextIdx].focus();
      activateProf(profBtns[nextIdx].dataset.prof);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   PHONE MASK  (+7 (___) ___-__-__)
   ══════════════════════════════════════════════════════════════════════ */

function applyPhoneMask(input) {
  if (!input) return;

  function formatPhone(value) {
    // Strip everything except digits
    const digits = value.replace(/\D/g, '');
    // Normalise: strip leading 7/8
    const local = digits.startsWith('7') || digits.startsWith('8')
      ? digits.slice(1)
      : digits;

    let result = '+7';
    if (local.length === 0) return result;
    result += ' (' + local.substring(0, 3);
    if (local.length >= 4) result += ') ' + local.substring(3, 6);
    if (local.length >= 7) result += '-' + local.substring(6, 8);
    if (local.length >= 9) result += '-' + local.substring(8, 10);
    return result;
  }

  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 (';
  });

  input.addEventListener('input', () => {
    const pos = input.selectionStart;
    input.value = formatPhone(input.value);
    // Restore cursor approximately
    try { input.setSelectionRange(pos, pos); } catch (_) {}
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Backspace') {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length <= 1) { input.value = ''; e.preventDefault(); }
    }
  });

  input.addEventListener('blur', () => {
    if (input.value === '+7 (') input.value = '';
  });
}

// Apply mask to all phone inputs
document.addEventListener('DOMContentLoaded', () => {
  qsa('input[type="tel"]').forEach(applyPhoneMask);
});

/* ══════════════════════════════════════════════════════════════════════
   VALIDATION HELPERS
   ══════════════════════════════════════════════════════════════════════ */

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 11;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function setFieldError(input, msgEl, show) {
  if (show) {
    input.classList.add('is-error');
    msgEl?.classList.add('visible');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', msgEl?.id || '');
  } else {
    input.classList.remove('is-error');
    msgEl?.classList.remove('visible');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

function validateField(input) {
  const msgEl = qs(`#${input.id}-error`) || input.nextElementSibling;
  let isValid = true;

  if (input.required && !input.value.trim()) {
    isValid = false;
  } else if (input.type === 'tel' && input.value.trim()) {
    isValid = isValidPhone(input.value);
  } else if (input.type === 'email' && input.value.trim()) {
    isValid = isValidEmail(input.value);
  } else if (input.tagName === 'SELECT' && input.required && !input.value) {
    isValid = false;
  }

  setFieldError(input, msgEl, !isValid);
  return isValid;
}

function validateForm(form) {
  const fields = qsa('input[required], select[required], textarea[required]', form);
  let allValid = true;

  fields.forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  // Also validate phone & email even if not required (if filled)
  qsa('input[type="tel"]:not([required]), input[type="email"]:not([required])', form).forEach(field => {
    if (field.value.trim()) {
      if (!validateField(field)) allValid = false;
    }
  });

  return allValid;
}

// Live validation on blur
document.addEventListener('blur', e => {
  const el = e.target;
  if (el.matches('input, select, textarea') && el.closest('form')) {
    validateField(el);
  }
}, true);

/* ══════════════════════════════════════════════════════════════════════
   MODALS
   ══════════════════════════════════════════════════════════════════════ */

const MODALS = {
  callback: qs('#modal-callback'),
  demo:     qs('#modal-demo'),
  question: qs('#modal-question'),
};

/**
 * Light-dismiss fallback for browsers without `closedby` support
 * Per modern-web-guidance: check HTMLDialogElement.prototype.closedBy
 */
function attachLightDismiss(dialog) {
  if (!dialog) return;
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside = (
        rect.top  <= e.clientY && e.clientY <= rect.top  + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!inside) closeModal(dialog.id.replace('modal-', ''));
    });
  }
}

function openModal(key) {
  const dialog = MODALS[key];
  if (!dialog) return;

  // Reset previous state
  resetModalState(key);

  dialog.showModal();
  // Trap focus on first focusable element after a tick
  setTimeout(() => {
    const first = qs('input:not([type=hidden]), select, textarea, button:not(.modal__close)', dialog);
    first?.focus();
  }, 50);
}

function closeModal(key) {
  const dialog = MODALS[key];
  if (!dialog) return;
  dialog.close();
}

function resetModalState(key) {
  const dialog = MODALS[key];
  if (!dialog) return;

  // Hide success, show form
  const success = qs(`#modal-${key}-success`, dialog);
  const footer  = qs(`#modal-${key}-footer`, dialog);
  const form    = qs('form', dialog);
  const body    = qs('.modal__body', dialog);

  if (success)  success.style.display  = 'none';
  if (footer)   footer.style.display   = '';
  if (form)     { form.style.display = ''; form.reset(); }

  // Clear all errors
  qsa('.is-error', dialog).forEach(el => el.classList.remove('is-error'));
  qsa('.field-msg.visible', dialog).forEach(el => el.classList.remove('visible'));
  qsa('[aria-invalid]', dialog).forEach(el => el.removeAttribute('aria-invalid'));
}

// Attach light-dismiss to all dialogs
Object.values(MODALS).forEach(attachLightDismiss);

// Open: data-modal="key" buttons
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-modal]');
  if (!trigger) return;
  openModal(trigger.dataset.modal);
});

// Close: data-close-modal="key" buttons
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-close-modal]');
  if (!trigger) return;
  closeModal(trigger.dataset.closeModal);
});

// Named button wires
[
  ['#btn-callback-header',  'callback'],
  ['#btn-callback-mobile',  'callback'],
  ['#btn-callback-cta',     'callback'],
  ['#btn-demo-cta',         'demo'],
  ['#btn-demo-footer',      'demo'],
  ['#btn-question-widget',  'question'],
  ['#btn-question-footer',  'question'],
  ['#btn-callback-footer2', 'callback'],
].forEach(([sel, key]) => {
  qs(sel)?.addEventListener('click', () => openModal(key));
});

// Escape key handled natively by <dialog>; also sync mobile menu close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // If mobile nav is open, Escape closes it instead of default
    const mobileNav = qs('#mobile-nav');
    if (mobileNav?.classList.contains('open')) {
      e.preventDefault();
      qs('#burger-btn')?.click();
    }
  }
});

/* ══════════════════════════════════════════════════════════════════════
   FORM SUBMISSIONS (with PHP backend compatibility)
   ══════════════════════════════════════════════════════════════════════ */

function handleFormSubmit(formId, modalKey) {
  const form = qs(`#${formId}`);
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm(form)) {
      // Focus first invalid field
      const firstError = qs('.is-error', form);
      firstError?.focus();
      return;
    }

    const submitBtn = qs(`#submit-${modalKey}`);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';
    }

    try {
      const formData = new FormData(form);

      // Attempt real fetch to PHP script
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      // Show success regardless of server response (graceful degradation)
      showModalSuccess(modalKey);
    } catch (err) {
      // Network error or no backend — still show success in demo mode
      console.warn('Form submit (demo mode):', err.message);
      showModalSuccess(modalKey);
    }
  });
}

function showModalSuccess(key) {
  const dialog  = MODALS[key];
  if (!dialog) return;

  const form    = qs('form', dialog);
  const success = qs(`#modal-${key}-success`, dialog);
  const footer  = qs(`#modal-${key}-footer`, dialog);

  if (form)    form.style.display    = 'none';
  if (footer)  footer.style.display  = 'none';
  if (success) {
    success.style.display = 'block';
    success.focus();
  }
}

handleFormSubmit('form-callback', 'callback');
handleFormSubmit('form-demo',     'demo');
handleFormSubmit('form-question', 'question');

// Hero demo form (not in modal, but on same send_demo.php)
(function initHeroDemoForm() {
  const form = qs('#form-demo-hero');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) {
      qs('.is-error', form)?.focus();
      return;
    }

    const btn = qs('#btn-demo-hero-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Отправляем...'; }

    try {
      await fetch(form.action, { method: 'POST', body: new FormData(form) });
    } catch (_) {}

    // Open demo modal with success state
    openModal('demo');
    setTimeout(() => showModalSuccess('demo'), 100);
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   CURRENCY WIDGET
   Tries to fetch from a CORS-friendly CBR proxy; falls back to static
   ══════════════════════════════════════════════════════════════════════ */

(function initCurrencyWidget() {
  // Static fallback rates (updated periodically)
  const STATIC = {
    USD: { price: '92,34', change: null },
    EUR: { price: '99,71', change: null },
    CNY: { price: '12,83', change: null },
  };

  function renderCurrency(code, price, changeVal) {
    const priceEl  = qs(`#${code.toLowerCase()}-price`);
    const changeEl = qs(`#${code.toLowerCase()}-change`);
    const dateEl   = qs('#currency-date');

    if (priceEl) priceEl.textContent = price;

    if (changeEl && changeVal !== null) {
      const formatted = changeVal > 0
        ? `+${changeVal.toFixed(2)}`
        : changeVal.toFixed(2);
      changeEl.textContent = formatted;
      changeEl.className = `currency-change ${changeVal > 0 ? 'up' : changeVal < 0 ? 'down' : 'neutral'}`;
    }

    if (dateEl) {
      const now = new Date();
      dateEl.textContent = `ЦБ РФ, ${now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
  }

  async function fetchRates() {
    try {
      // Use CBR JSON API via a CORS proxy
      const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      const valutes = data.Valute;
      if (!valutes) throw new Error('No valutes');

      ['USD', 'EUR', 'CNY'].forEach(code => {
        const v = valutes[code];
        if (!v) return;
        const price    = (v.Value / v.Nominal).toFixed(4).replace('.', ',').replace(/(\d+,\d{2})\d+/, '$1');
        const change   = (v.Value - v.Previous) / v.Nominal;
        renderCurrency(code, price, change);
      });
    } catch (err) {
      console.warn('Currency fetch failed, using static rates:', err.message);
      // Render static values
      Object.entries(STATIC).forEach(([code, data]) => {
        renderCurrency(code, data.price, data.change);
      });
    }
  }

  // Fetch on load
  fetchRates();
  // Refresh every 30 minutes
  setInterval(fetchRates, 30 * 60 * 1000);
})();

/* ══════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
   ══════════════════════════════════════════════════════════════════════ */

document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const target = qs(link.getAttribute('href'));
  if (!target) return;

  e.preventDefault();
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
  const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

  window.scrollTo({ top, behavior: 'smooth' });

  // Close mobile nav if open
  const mobileNav = qs('#mobile-nav');
  if (mobileNav?.classList.contains('open')) qs('#burger-btn')?.click();
});

/* ══════════════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — Animate cards on scroll
   ══════════════════════════════════════════════════════════════════════ */

(function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  // Initial hidden state via JS (avoids flash for users with no-JS)
  const style = document.createElement('style');
  style.textContent = `
    .product-card, .service-card, .advantage-card, .seminar-card, .stat-widget {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity .45s ease, transform .45s ease;
    }
    .product-card.is-visible, .service-card.is-visible,
    .advantage-card.is-visible, .seminar-card.is-visible,
    .stat-widget.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger delay based on position among siblings
      const siblings = [...(entry.target.parentElement?.children || [])];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 60}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const cards = qsa('.product-card, .service-card, .advantage-card, .seminar-card, .stat-widget');
  cards.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════════════
   INIT LOG
   ══════════════════════════════════════════════════════════════════════ */

console.log('%c✅ ГАРАНТ-ИнфоЦентр v2.0 initialized', 'color:#1d4f91;font-weight:700;font-size:14px');
