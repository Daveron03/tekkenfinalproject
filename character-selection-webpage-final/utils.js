const Utils = {
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  throttle(func, interval) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  },

  sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatError(error) {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message || 'An unexpected error occurred';
    }
    return CONFIG?.MESSAGES?.GENERIC_ERROR || 'An unexpected error occurred';
  },

  isValidSession() {
    const token = localStorage.getItem(CONFIG?.STORAGE?.TOKEN_KEY || 'tekken_token');
    const user = localStorage.getItem(CONFIG?.STORAGE?.USER_KEY || 'tekken_user');
    return !!(token && user);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  getViewportSize() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  },

  smoothScrollTo(element, options = {}) {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
        ...options
      });
    }
  },

  addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [
      password.length >= minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial
    ].filter(Boolean).length;

    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      score,
      strength,
      requirements: {
        minLength: password.length >= minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  }
};

Object.freeze(Utils);
