# Tekken Character Selection Frontend

A modern web application for selecting Tekken fighters with user authentication and favorites functionality.

## Features

- **User Authentication**: Login and registration system
- **Character Selection**: Browse and view detailed information about Tekken fighters
- **Favorites System**: Add/remove fighters to/from your personal favorites
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Sound Effects**: Interactive audio feedback
- **Particle Effects**: Visual enhancements for better user experience

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend API**: Connects to Laravel backend (http://192.168.101.51:8000/api)
- **Authentication**: JWT token-based authentication
- **Local Storage**: Session persistence

## Project Structure

```
src/
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── main.js             # Core application logic
├── background.jpeg     # Background image
└── character-images/   # Fighter portraits
    ├── bryan.jpg
    ├── jin.jpg
    ├── lily.jpg
    └── paul.jpg
```

## API Endpoints

The application connects to the following backend endpoints:

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/characters` - Fetch all fighters
- `GET /api/characters/{id}` - Fetch specific fighter
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/toggle/{id}` - Toggle fighter favorite status

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd tekken-character-selection
   ```

2. **Install dependencies** (if using package.json)
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   # or use any local server like Live Server extension in VS Code
   ```

4. **Configure API URL**
   - Update `API_BASE_URL` in `main.js` to point to your backend server
   - Current setting: `http://192.168.101.51:8000/api`

## Usage

### Authentication
- Click "REGISTER" to create a new account
- Click "LOGIN" to sign in with existing credentials
- Use "LOGOUT" button to end your session

### Character Selection
- Browse available fighters on the main screen
- Click on any fighter card to view detailed information
- Use keyboard arrows to navigate between fighters
- Press Enter/Space to select a fighter
- Press Escape to logout or close modals

### Favorites
- In the character detail modal, click "ADD TO FAVORITES" to save a fighter
- Favorited fighters will have a visual indicator on the main grid
- Click "REMOVE FROM FAVORITES" to unfavorite a fighter

## Code Architecture

### Main Classes

1. **ApiService**: Handles all HTTP requests to the backend
2. **AuthManager**: Manages user authentication and session state
3. **FighterManager**: Handles character data and UI interactions
4. **ParticleSystem**: Creates visual particle effects
5. **SoundManager**: Manages audio feedback
6. **KeyboardNavigation**: Provides keyboard accessibility

### State Management

The application uses a simple state management pattern with the `AppState` object:

```javascript
const AppState = {
  user: null,           // Current user information
  token: null,          // JWT authentication token
  fighters: [],         // Array of all fighters
  userFavorites: [],    // Array of user's favorite fighter IDs
  currentFighter: null  // Currently selected fighter for modal
};
```

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Performance Considerations

- Lazy loading of character images
- Efficient DOM manipulation
- RequestAnimationFrame for smooth animations
- Local storage for session persistence

## Security Features

- JWT token authentication
- CSRF protection via proper headers
- Input validation on frontend
- Secure localStorage usage

## Accessibility

- Full keyboard navigation support
- ARIA labels where appropriate
- High contrast design
- Responsive typography

## Future Enhancements

- [ ] Add fighter stats and move lists
- [ ] Implement tournament bracket system
- [ ] Add social features (share favorites)
- [ ] Offline mode support
- [ ] Advanced filtering and search
- [ ] Character comparison feature

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact [your-email@example.com]
