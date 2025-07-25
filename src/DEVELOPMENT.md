# Development Guide

## Code Organization

### File Structure
```
src/
├── index.html      # Main HTML structure
├── styles.css      # All CSS styles and responsive design
├── config.js       # Application configuration
├── utils.js        # Utility functions
├── main.js         # Core application logic
├── README.md       # Project documentation
└── assets/         # Images and other static files
    ├── background.jpeg
    ├── bryan.jpg
    ├── jin.jpg
    ├── lily.jpg
    └── paul.jpg
```

### Code Style Guidelines

#### JavaScript
- Use ES6+ features (classes, arrow functions, async/await)
- Use `const` for immutable values, `let` for variables
- Follow camelCase naming convention
- Add JSDoc comments for all functions and classes
- Use meaningful variable and function names
- Keep functions small and focused on single responsibility

#### CSS
- Use BEM methodology for class naming where appropriate
- Group related styles together
- Use CSS custom properties (variables) for consistent theming
- Mobile-first responsive design approach
- Consistent spacing and sizing units

#### HTML
- Use semantic HTML5 elements
- Include proper ARIA attributes for accessibility
- Keep structure clean and well-indented
- Use meaningful IDs and class names

## Architecture Patterns

### State Management
The application uses a centralized state pattern with the `AppState` object:
- Single source of truth for application data
- Immutable updates through dedicated methods
- Clear separation between UI state and data state

### API Communication
- All API calls go through the `ApiService` class
- Consistent error handling across all requests
- JWT token management for authentication
- Request/response logging in debug mode

### Component Organization
- Each major feature has its own manager class (AuthManager, FighterManager)
- Separation of concerns between data, UI, and business logic
- Event-driven architecture for UI interactions

## Performance Considerations

### Optimization Techniques
1. **Debouncing/Throttling**: Use utility functions for frequent events
2. **Lazy Loading**: Images load as needed
3. **Efficient DOM Updates**: Batch DOM manipulations
4. **Memory Management**: Clean up event listeners and timers
5. **Caching**: Store API responses when appropriate

### Best Practices
- Minimize DOM queries by caching elements
- Use `requestAnimationFrame` for animations
- Avoid memory leaks with proper cleanup
- Optimize images for web delivery
- Use CSS transforms for smooth animations

## Error Handling

### Strategy
1. **API Errors**: Graceful degradation with user-friendly messages
2. **Network Issues**: Retry logic and offline indicators
3. **Validation Errors**: Clear feedback to users
4. **Unexpected Errors**: Logging and fallback behaviors

### Implementation
- Try-catch blocks around all async operations
- Centralized error formatting through Utils.formatError()
- User-friendly error messages from CONFIG.MESSAGES
- Console logging for debugging (controlled by DEBUG_MODE)

## Security Considerations

### Frontend Security
1. **XSS Prevention**: Sanitize all user inputs and dynamic content
2. **CSRF Protection**: Proper headers and token management
3. **Data Validation**: Client-side validation as UX enhancement
4. **Secure Storage**: Sensitive data handling in localStorage
5. **Content Security**: Avoid eval() and similar dangerous functions

### Authentication
- JWT tokens stored securely in localStorage
- Automatic token refresh when possible
- Proper logout cleanup
- Session timeout handling

## Testing Strategy

### Areas to Test
1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: API interactions and data flow
3. **UI Tests**: User interactions and responsive design
4. **Accessibility Tests**: Keyboard navigation and screen readers
5. **Performance Tests**: Load times and memory usage

### Testing Tools (Recommended)
- Jest for unit testing
- Cypress for end-to-end testing
- Lighthouse for performance auditing
- WAVE for accessibility testing

## Deployment

### Pre-deployment Checklist
- [ ] Remove debug logging (set DEBUG_MODE to false)
- [ ] Optimize and compress images
- [ ] Minify CSS and JavaScript
- [ ] Test on multiple browsers and devices
- [ ] Validate HTML and CSS
- [ ] Check accessibility compliance
- [ ] Verify all API endpoints work in production
- [ ] Test error scenarios and edge cases

### Production Configuration
1. Update CONFIG.API.BASE_URL to production API
2. Set CONFIG.APP.DEBUG_MODE to false
3. Enable proper HTTPS in production
4. Configure proper CORS headers on backend
5. Set up proper error tracking (e.g., Sentry)

## Browser Support

### Target Browsers
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Polyfills (if needed)
- Fetch API for older browsers
- Promise polyfill for IE11
- CSS Grid fallbacks

## Performance Monitoring

### Metrics to Track
1. **Page Load Time**: First Contentful Paint, Largest Contentful Paint
2. **API Response Times**: Track all endpoint performance
3. **User Interactions**: Click-to-action time
4. **Error Rates**: JavaScript errors and API failures
5. **User Engagement**: Session duration and feature usage

## Maintenance

### Regular Tasks
1. **Dependencies**: Keep all dependencies updated
2. **Security**: Regular security audits
3. **Performance**: Monitor and optimize based on real usage
4. **Browser Testing**: Test with new browser versions
5. **API Changes**: Coordinate with backend team on API updates

### Code Quality
- Regular code reviews
- Automated linting and formatting
- Performance profiling
- Accessibility audits
- User feedback integration
