const API_BASE_URL = CONFIG?.API?.BASE_URL || 'http://192.168.101.51:8000/api';

const AppState = {
  user: null,
  token: null,
  fighters: [],
  userFavorites: [],
  currentFighter: null
};

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (AppState.token) {
      config.headers['Authorization'] = `Bearer ${AppState.token}`;
    }

    if (CONFIG?.APP?.DEBUG_MODE) {
      console.log('Making API request:', { url, config });
    }

    try {
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(CONFIG?.MESSAGES?.NETWORK_ERROR || 'Invalid response from server');
      }
      
      if (CONFIG?.APP?.DEBUG_MODE) {
        console.log('API response:', { status: response.status, data });
      }
      
      if (!response.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  static async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  static async logout() {
    return this.request('/logout', {
      method: 'POST'
    });
  }

  static async getCharacters() {
    return this.request('/characters');
  }

  static async getCharacter(id) {
    return this.request(`/characters/${id}`);
  }

  static async toggleFavorite(characterId) {
    return this.request(`/favorites/toggle/${characterId}`, {
      method: 'POST'
    });
  }

  static async getUserFavorites() {
    return this.request('/favorites');
  }
}

class AuthManager {
  static init() {
    const token = localStorage.getItem(CONFIG?.STORAGE?.TOKEN_KEY || 'tekken_token');
    const user = localStorage.getItem(CONFIG?.STORAGE?.USER_KEY || 'tekken_user');
    
    if (token && user) {
      if (CONFIG?.APP?.DEBUG_MODE) {
        console.log('Found existing session, token:', token);
      }
      AppState.token = token;
      AppState.user = JSON.parse(user);
      this.showMainSection();
    } else {
      if (CONFIG?.APP?.DEBUG_MODE) {
        console.log('No existing session found');
      }
      this.showAuthSection();
    }
  }

  static async register(name, email, password, passwordConfirmation) {
    try {
      console.log('Starting registration process...', { name, email });
      this.showLoading('registerForm');
      
      const response = await ApiService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      console.log('Registration response:', response);
      this.handleAuthSuccess(response);
      this.showMessage('Registration successful! Welcome to Tekken Arena!', 'success');
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.hideLoading('registerForm');
    }
  }

  static async login(email, password) {
    try {
      this.showLoading('loginForm');
      const response = await ApiService.login({ email, password });
      
      this.handleAuthSuccess(response);
      this.showMessage('Login successful! Welcome back!', 'success');
    } catch (error) {
      this.showMessage(error.message, 'error');
    } finally {
      this.hideLoading('loginForm');
    }
  }

  static async logout() {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
      this.showAuthSection();
      this.showMessage('Logged out successfully', 'success');
    }
  }

  static handleAuthSuccess(response) {
    AppState.user = response.user;
    AppState.token = response.token;
    
    console.log('Auth success, token:', response.token);
    console.log('User:', response.user);
    
    localStorage.setItem('tekken_token', response.token);
    localStorage.setItem('tekken_user', JSON.stringify(response.user));
    
    this.showMainSection();
  }

  static async showMainSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');
    document.getElementById('userName').textContent = AppState.user?.name || 'Fighter';
    
    FighterManager.loadFighters();
    await this.loadUserFavorites();
  }

  static async loadUserFavorites() {
    try {
      console.log('Fetching favorites from backend with token:', AppState.token);
      
      const response = await fetch('http://192.168.101.51:8000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${AppState.token}`,
          'Accept': 'application/json',
        }
      });
      
      const favorites = await response.json();
      console.log('Favorites from server:', favorites);
      
      if (Array.isArray(favorites)) {
        AppState.userFavorites = favorites.map(fav => fav.character_id || fav.id);
      } else if (favorites.data && Array.isArray(favorites.data)) {
        AppState.userFavorites = favorites.data.map(fav => fav.character_id || fav.id);
      } else {
        AppState.userFavorites = [];
      }
      
      console.log('User favorites IDs:', AppState.userFavorites);
      
      if (AppState.fighters.length > 0) {
        FighterManager.renderCharacterCards();
      }
    } catch (error) {
      console.error('Failed to load user favorites:', error);
      AppState.userFavorites = [];
    }
  }

  static showLoading(formId) {
    const form = document.getElementById(formId);
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span>Please wait...';
    button.disabled = true;
    button.dataset.originalText = originalText;
  }

  static hideLoading(formId) {
    const form = document.getElementById(formId);
    const button = form.querySelector('button[type="submit"]');
    button.textContent = button.dataset.originalText || 'SUBMIT';
    button.disabled = false;
  }

  static showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;

    const authContainer = document.querySelector('.auth-container');
    const mainSection = document.getElementById('mainSection');
    
    if (!authContainer.classList.contains('hidden')) {
      authContainer.insertBefore(messageEl, authContainer.firstChild);
    } else if (!mainSection.classList.contains('hidden')) {
      mainSection.insertBefore(messageEl, mainSection.firstChild);
    }

    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }

  static clearSession() {
    AppState.user = null;
    AppState.token = null;
    AppState.userFavorites = [];
    localStorage.removeItem('tekken_token');
    localStorage.removeItem('tekken_user');
  }

  static showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('mainSection').classList.add('hidden');
  }
}

class FighterManager {
  static async loadFighters() {
    try {
      const fighters = await ApiService.getCharacters();
      AppState.fighters = fighters;
      this.renderCharacterCards();
    } catch (error) {
      AuthManager.showMessage('Failed to load fighters: ' + error.message, 'error');
    }
  }

  static renderCharacterCards() {
    const container = document.getElementById('characterSelection');
    container.innerHTML = '';
    
    console.log('Rendering character cards. Current favorites:', AppState.userFavorites);
    
    AppState.fighters.forEach((fighter, idx) => {
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.fighter = idx;
      
      const fighterId = parseInt(fighter.id);
      const isFavorited = AppState.userFavorites.some(favId => parseInt(favId) === fighterId);
      
      console.log(`Fighter ${fighter.name} (ID: ${fighterId}) is favorited:`, isFavorited);
      
      if (isFavorited) {
        card.classList.add('favorited');
      }
      
      card.innerHTML = `
        <div class="character-portrait">
          <img src="${fighter.image}" alt="${fighter.name}">
        </div>
        <div class="character-name">${fighter.name}</div>
      `;
      
      card.addEventListener('click', () => {
        this.showCharacterDetails(idx);
      });
      
      container.appendChild(card);
    });
  }

  static async showCharacterDetails(fighterId) {
    const fighter = AppState.fighters[fighterId];
    if (!fighter) return;

    AppState.currentFighter = fighter;
    
    document.getElementById('modalName').textContent = fighter.name || '';
    document.getElementById('modalTagline').textContent = fighter.tagline || '';
    document.getElementById('modalCountry').textContent = fighter.country || '';
    document.getElementById('modalStyle').textContent = fighter.fighting_style || '';
    document.getElementById('modalDescription').textContent = fighter.description || '';
    document.getElementById('modalImage').src = fighter.image || 'default.jpg';
    document.getElementById('modalImage').alt = fighter.name;
    
    this.updateFavoriteButton(fighter.id);
    
    const modal = document.getElementById('characterModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  static updateFavoriteButton(fighterId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteText = document.getElementById('favoriteText');
    
  
    const fighterIdNum = parseInt(fighterId);
    const isFavorited = AppState.userFavorites.some(favId => parseInt(favId) === fighterIdNum);
    
    console.log(`Updating favorite button for fighter ${fighterIdNum}, is favorited:`, isFavorited);
    console.log('Current favorites:', AppState.userFavorites);
    
    if (isFavorited) {
      favoriteBtn.classList.add('favorited');
      favoriteText.textContent = 'REMOVE FROM FAVORITES';
    } else {
      favoriteBtn.classList.remove('favorited');
      favoriteText.textContent = 'ADD TO FAVORITES';
    }
  }

  static async toggleFavorite() {
    if (!AppState.currentFighter) return;
    
    const fighterId = parseInt(AppState.currentFighter.id);
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteText = document.getElementById('favoriteText');
    

    const isCurrentlyFavorited = AppState.userFavorites.some(favId => parseInt(favId) === fighterId);
    
    try {
     
      if (isCurrentlyFavorited) {
      
        AppState.userFavorites = AppState.userFavorites.filter(favId => parseInt(favId) !== fighterId);
        favoriteBtn.classList.remove('favorited');
        favoriteText.textContent = 'ADD TO FAVORITES';
      } else {
       
        AppState.userFavorites.push(fighterId);
        favoriteBtn.classList.add('favorited');
        favoriteText.textContent = 'REMOVE FROM FAVORITES';
      }
      
     
      this.updateSingleCharacterCard(fighterId);
      
      
      const originalText = favoriteText.textContent;
      favoriteText.textContent = 'Updating...';
      
      console.log('Toggling favorite for character:', fighterId);
      
     
      const toggleResponse = await fetch(`http://192.168.101.51:8000/api/favorites/toggle/${fighterId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AppState.token}`,
          'Accept': 'application/json',
        }
      });
      
      if (!toggleResponse.ok) {
        throw new Error(`HTTP error! status: ${toggleResponse.status}`);
      }
      
      const toggleResult = await toggleResponse.json();
      console.log('Toggle response:', toggleResult);
      

      favoriteText.textContent = originalText;
      
  
      const tempMessage = favoriteText.textContent;
      favoriteText.textContent = 'Updated!';
      setTimeout(() => {
        favoriteText.textContent = tempMessage;
      }, 1000);
      
    } catch (error) {
      console.error('Failed to update favorites:', error);
      
      
      if (isCurrentlyFavorited) {
     
        AppState.userFavorites.push(fighterId);
        favoriteBtn.classList.add('favorited');
        favoriteText.textContent = 'REMOVE FROM FAVORITES';
      } else {
       
        AppState.userFavorites = AppState.userFavorites.filter(favId => parseInt(favId) !== fighterId);
        favoriteBtn.classList.remove('favorited');
        favoriteText.textContent = 'ADD TO FAVORITES';
      }
      
     
      this.updateSingleCharacterCard(fighterId);
      
      favoriteText.textContent = isCurrentlyFavorited ? 'REMOVE FROM FAVORITES' : 'ADD TO FAVORITES';
      AuthManager.showMessage('Failed to update favorites: ' + error.message, 'error');
    }
  }

  static updateSingleCharacterCard(fighterId) {
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
      const fighterIndex = parseInt(card.dataset.fighter);
      const fighter = AppState.fighters[fighterIndex];
      if (fighter && parseInt(fighter.id) === fighterId) {
        const isNowFavorited = AppState.userFavorites.some(favId => parseInt(favId) === fighterId);
        if (isNowFavorited) {
          card.classList.add('favorited');
        } else {
          card.classList.remove('favorited');
        }
      }
    });
  }

  static hideModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
    AppState.currentFighter = null;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.animate();
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.3';

    document.body.appendChild(canvas);

    this.resizeCanvas(canvas);
    window.addEventListener('resize', () => this.resizeCanvas(canvas));

    return canvas;
  }

  resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      decay: Math.random() * 0.02 + 0.005
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


    if (Math.random() < 0.3) {
      this.particles.push(this.createParticle());
    }

    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity -= particle.decay;

      if (particle.opacity <= 0 || particle.y < -10) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}


class SoundManager {
  constructor() {
    this.sounds = {
      select: this.createBeep(800, 0.1),
      hover: this.createBeep(1200, 0.05),
      back: this.createBeep(400, 0.1),
      login: this.createBeep(600, 0.15),
      error: this.createBeep(300, 0.2),
      favorite: this.createBeep(1000, 0.12)
    };
  }

  createBeep(frequency, duration) {
    return () => {
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
}


class KeyboardNavigation {
  constructor() {
    this.selectedIndex = -1;
    this.cards = [];
    this.isModalOpen = false;
    
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  updateCards() {
    this.cards = Array.from(document.querySelectorAll('.character-card'));
   
    if (this.selectedIndex >= this.cards.length) {
      this.selectedIndex = -1;
    }
    this.highlightSelected();
  }

  handleKeydown(e) {
    if (this.isModalOpen) {
      if (e.key === 'Escape') {
        FighterManager.hideModal();
        this.isModalOpen = false;
        return;
      }
      return;
    }

  
    if (document.getElementById('mainSection').classList.contains('hidden')) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.navigateUp();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.navigateDown();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.selectCurrent();
        break;
      case 'Escape':
        e.preventDefault();
        AuthManager.logout();
        break;
    }
  }

  navigateUp() {
    if (this.cards.length === 0) return;
    if (this.selectedIndex === -1) {
      this.selectedIndex = this.cards.length - 1; 
    } else {
      this.selectedIndex = (this.selectedIndex - 1 + this.cards.length) % this.cards.length;
    }
    this.highlightSelected();
    soundManager.play('hover');
  }

  navigateDown() {
    if (this.cards.length === 0) return;
    if (this.selectedIndex === -1) {
      this.selectedIndex = 0; 
    } else {
      this.selectedIndex = (this.selectedIndex + 1) % this.cards.length;
    }
    this.highlightSelected();
    soundManager.play('hover');
  }

  selectCurrent() {
    if (this.cards.length === 0 || this.selectedIndex === -1) return;
    const selectedCard = this.cards[this.selectedIndex];
    if (selectedCard) {
      selectedCard.click();
      this.isModalOpen = true;
      soundManager.play('select');
    }
  }

  highlightSelected() {
    this.cards.forEach((card, index) => {
      if (index === this.selectedIndex && this.selectedIndex !== -1) {
        card.classList.add('keyboard-selected');
      } else {
        card.classList.remove('keyboard-selected');
      }
    });
  }
}


let particleSystem, soundManager, keyboardNav;

document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
  
  particleSystem = new ParticleSystem();
  soundManager = new SoundManager();
  keyboardNav = new KeyboardNavigation();

  document.getElementById('loginTab').addEventListener('click', () => {
    console.log('Login tab clicked');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
  });
  
  document.getElementById('registerTab').addEventListener('click', () => {
    console.log('Register tab clicked');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
  });
  
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await AuthManager.login(email, password);
  });
  
 
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    console.log('Form data:', { name, email, password, passwordConfirm });
    
    if (password !== passwordConfirm) {
      AuthManager.showMessage('Passwords do not match', 'error');
      return;
    }
    
    await AuthManager.register(name, email, password, passwordConfirm);
  });
  
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await AuthManager.logout();
  });

  document.getElementById('closeModal').addEventListener('click', FighterManager.hideModal);
  document.getElementById('backBtn').addEventListener('click', FighterManager.hideModal);
  
  document.getElementById('favoriteBtn').addEventListener('click', () => {
    FighterManager.toggleFavorite();
  });
  
  document.getElementById('characterModal').addEventListener('click', (e) => {
    if (e.target.id === 'characterModal') {
      FighterManager.hideModal();
    }
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('character-card') || 
        e.target.classList.contains('auth-btn') ||
        e.target.classList.contains('favorite-btn') ||
        e.target.classList.contains('back-btn')) {
      soundManager.play('hover');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('character-card')) {
      soundManager.play('select');
    }
    if (e.target.id === 'closeModal' || e.target.id === 'backBtn') {
      soundManager.play('back');
      keyboardNav.isModalOpen = false;
    }
    if (e.target.classList.contains('auth-btn')) {
      soundManager.play('login');
    }
    if (e.target.id === 'favoriteBtn') {
      soundManager.play('favorite');
    }
  });

  const originalRenderCards = FighterManager.renderCharacterCards;
  FighterManager.renderCharacterCards = function() {
    originalRenderCards.call(this);
    keyboardNav.updateCards();
  };
});

const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
  .character-card.keyboard-selected {
    transform: translateY(-10px) scale(1.05);
    transition: all 0.3s ease;
  }
  .character-card.keyboard-selected .character-portrait {
    border-color: #ff0066 !important;
    box-shadow: 
      0 15px 40px rgba(255, 0, 102, 0.3),
      0 0 30px rgba(255, 0, 102, 0.5),
      inset 0 0 0 2px rgba(255, 0, 102, 0.3) !important;
  }
  .character-card.keyboard-selected .character-name {
    color: #ff0066 !important;
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(255, 0, 102, 0.5) !important;
  }
`;
document.head.appendChild(enhancedStyle);
