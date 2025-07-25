const CONFIG = {
  API: {
    BASE_URL: 'http://192.168.101.51:8000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  },

  STORAGE: {
    TOKEN_KEY: 'tekken_token',
    USER_KEY: 'tekken_user',
    PREFERENCES_KEY: 'tekken_preferences'
  },

  UI: {
    MESSAGE_TIMEOUT: 5000,
    MODAL_ANIMATION_DURATION: 300,
    PARTICLE_SPAWN_RATE: 0.3,
    SOUND_ENABLED: true
  },

  APP: {
    VERSION: '1.0.0',
    DEBUG_MODE: false,
    AUTO_LOGOUT_TIMEOUT: 1800000
  },

  MESSAGES: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    AUTH_FAILED: 'Authentication failed. Please check your credentials.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
    REGISTRATION_SUCCESS: 'Registration successful! Welcome to Tekken Arena!',
    LOGIN_SUCCESS: 'Login successful! Welcome back!',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORDS_MISMATCH: 'Passwords do not match',
    FAVORITES_UPDATE_FAILED: 'Failed to update favorites'
  }
};

Object.freeze(CONFIG.API);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.APP);
Object.freeze(CONFIG.MESSAGES);
Object.freeze(CONFIG);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
