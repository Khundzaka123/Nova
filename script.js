/**
 * script.js — Nexora Landing Page
 *
 * Modules:
 *  1. Utility helpers
 *  2. Dynamic year in footer
 *  3. Header scroll state
 *  4. Mobile nav toggle
 *  5. Smooth-scroll active nav link tracker
 *  6. Scroll-reveal animations (IntersectionObserver)
 *  7. Contact form validation & submission
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
============================================================ */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element|Document} [ctx=document]
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll
 * @param {string} selector
 * @param {Element|Document} [ctx=document]
 */
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/** Debounce a function by `wait` ms */
function debounce(fn, wait = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ============================================================
   2. DYNAMIC YEAR
============================================================ */
(function setYear() {
  const el = $('#current-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   3. HEADER SCROLL STATE
============================================================ */
(function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  const onScroll = debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ============================================================
   4. MOBILE NAV TOGGLE
============================================================ */
(function initMobileNav() {
  const toggle = $('.nav__toggle');
  const menu   = $('.nav__menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden'; // prevent scroll when open
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  }

  toggle.addEventListener('click', toggleMenu);

  // Close when a nav link is clicked
  $$('.nav__link', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close when clicking outside the nav
  document.addEventListener('click', e => {
    const nav = $('.nav');
    if (nav && !nav.contains(e.target) && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

/* ============================================================
   5. ACTIVE NAV LINK TRACKER (Intersection Observer)
============================================================ */
(function initActiveNav() {
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  /**
   * Map each section id to its corresponding nav link
   * @type {Map<string, HTMLElement>}
   */
  const linkMap = new Map();
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    linkMap.set(id, link);
  });

  function setActive(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    const active = linkMap.get(id);
    if (active) active.classList.add('active');
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px', // fire when ~top-third of section is in view
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
})();

/* ============================================================
   6. SCROLL-REVEAL ANIMATIONS
============================================================ */
(function initScrollReveal() {
  // Respect user's motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const revealEls    = $$('[data-reveal]');
  const staggerEls   = $$('[data-reveal-stagger]');

  if (!revealEls.length && !staggerEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12 }
  );

  [...revealEls, ...staggerEls].forEach(el => observer.observe(el));
})();

/* ============================================================
   7. CONTACT FORM — VALIDATION & SUBMISSION
============================================================ */
(function initContactForm() {
  const form     = $('#contact-form');
  if (!form) return;

  const feedback = $('#form-feedback');

  /* ── Validation rules ── */
  const RULES = {
    name: {
      validate(val) {
        if (!val.trim()) return 'Full name is required.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return null;
      },
    },
    email: {
      validate(val) {
        if (!val.trim()) return 'Email address is required.';
        // RFC-compliant-ish email check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim())) {
          return 'Please enter a valid email address.';
        }
        return null;
      },
    },
    subject: {
      validate(val) {
        if (!val) return 'Please select a topic.';
        return null;
      },
    },
    message: {
      validate(val) {
        if (!val.trim()) return 'Message cannot be empty.';
        if (val.trim().length < 10) return 'Message must be at least 10 characters.';
        return null;
      },
    },
  };

  /* ── Show / clear field error ── */
  function showError(fieldName, message) {
    const input = form.elements[fieldName];
    const errorEl = $('#' + fieldName + '-error');

    if (input) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldName) {
    const input = form.elements[fieldName];
    const errorEl = $('#' + fieldName + '-error');

    if (input) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');
    }
    if (errorEl) errorEl.textContent = '';
  }

  /* ── Real-time validation on blur ── */
  Object.keys(RULES).forEach(fieldName => {
    const input = form.elements[fieldName];
    if (!input) return;

    input.addEventListener('blur', () => {
      const error = RULES[fieldName].validate(input.value);
      error ? showError(fieldName, error) : clearError(fieldName);
    });

    // Also clear error as user types (after first blur)
    input.addEventListener('input', debounce(() => {
      if (input.classList.contains('is-invalid')) {
        const error = RULES[fieldName].validate(input.value);
        error ? showError(fieldName, error) : clearError(fieldName);
      }
    }, 300));
  });

  /* ── Validate all fields, return true if all pass ── */
  function validateAll() {
    let isValid = true;

    Object.entries(RULES).forEach(([fieldName, rule]) => {
      const input = form.elements[fieldName];
      if (!input) return;
      const error = rule.validate(input.value);
      if (error) {
        showError(fieldName, error);
        isValid = false;
      } else {
        clearError(fieldName);
      }
    });

    return isValid;
  }

  /* ── Show form-level feedback ── */
  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className   = 'form-feedback ' + type;
    // Scroll the feedback into view for screen readers
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFeedback() {
    if (!feedback) return;
    feedback.textContent = '';
    feedback.className   = 'form-feedback';
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFeedback();

    if (!validateAll()) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      showFeedback('error', 'Please fix the errors above before submitting.');
      return;
    }

    /* ── Simulate async submission ── */
    const submitBtn = form.querySelector('[type="submit"]');
    const btnText   = submitBtn?.querySelector('.btn-text');

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Sending…';
    }

    try {
      // In a real project, replace this with fetch() to your API endpoint:
      // await fetch('/api/contact', { method: 'POST', body: new FormData(form) });
      await new Promise(resolve => setTimeout(resolve, 1500)); // simulated delay

      showFeedback(
        'success',
        '✔ Message sent! We\'ll get back to you within one business day.'
      );

      form.reset();

      // Clear all validation states
      Object.keys(RULES).forEach(fieldName => {
        const input = form.elements[fieldName];
        if (input) {
          input.classList.remove('is-valid', 'is-invalid');
          input.removeAttribute('aria-invalid');
        }
        const errorEl = $('#' + fieldName + '-error');
        if (errorEl) errorEl.textContent = '';
      });

    } catch (err) {
      console.error('Form submission error:', err);
      showFeedback(
        'error',
        '✖ Something went wrong. Please try again or email us directly at hello@nexora.app.'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
      }
    }
  });
})();
