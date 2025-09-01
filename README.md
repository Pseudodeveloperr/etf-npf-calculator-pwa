# ETF & NPF Calculator - Progressive Web App (PWA)

A professional Early Termination Fee (ETF) and Notice Period Fee (NPF) calculator built as a Progressive Web App with advanced features including offline support, automatic record keeping, and CSV export functionality.

## 🚀 Features

### Core Functionality
- **ETF Calculator**: Calculate Early Termination Fees with precise monthly and daily calculations
- **NPF Calculator**: Calculate Notice Period Fees with 30-day notice period logic
- **Automatic Record Keeping**: All calculations are automatically saved with timestamps
- **CSV Export**: Export all calculation records to CSV for external analysis
- **Real-time Validation**: Form validation with helpful error messages
- **Sample Data Loading**: Quick-start with pre-filled sample data

### PWA Features
- **📱 Installable**: Can be installed as a native app on mobile and desktop
- **🔄 Offline Support**: Full offline functionality with service worker caching
- **💾 Data Persistence**: Calculations saved locally and synced when online
- **📊 Background Sync**: Data synchronization when connection is restored
- **🎨 App-like Experience**: Native app-like interface and navigation
- **🔔 Install Prompts**: Smart install banners for supported platforms
- **🌓 Dark/Light Mode**: Automatic theme detection with manual override
- **📲 Shortcuts**: Direct access to ETF/NPF calculators via app shortcuts

### Technical Features
- **Responsive Design**: Works perfectly on all device sizes
- **Modern UI/UX**: Professional interface with smooth animations
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance Optimized**: Fast loading with efficient caching strategies
- **Cross-platform**: Works on iOS, Android, Windows, macOS, and Linux

## 📁 File Structure

```
etf-npf-calculator/
├── index.html          # Main HTML file with PWA meta tags
├── manifest.json       # PWA manifest with app configuration
├── service-worker.js   # Service worker for offline functionality
├── app.js             # Main JavaScript with calculation logic
├── style.css          # Complete CSS with modern design system
├── logo.jpg           # App logo (you need to add this)
├── background.jpg     # Background image (optional)
└── README.md          # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Web server (Apache, Nginx, or any static file server)
- Modern web browser with PWA support
- SSL certificate (required for PWA features)

### Quick Setup

1. **Download Files**
   ```bash
   # All files are ready for deployment
   - index.html
   - manifest.json
   - service-worker.js
   - app.js
   - style.css
   ```

2. **Add Logo Image**
   - Add `logo.jpg` (512x512px recommended)
   - Supports your company logo or use the built-in placeholder

3. **Upload to Web Server**
   ```bash
   # Upload all files to your web server root directory
   # Ensure HTTPS is enabled (required for PWA features)
   ```

4. **Test Installation**
   - Open browser and navigate to your domain
   - Look for install prompt or check browser menu for "Install App"
   - Test offline functionality by disconnecting internet

### Local Development

```bash
# Using Python (built-in server)
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000 -c-1

# Using PHP (built-in server)
php -S localhost:8000
```

## 📱 PWA Installation

### Desktop (Chrome, Edge, Firefox)
1. Open the app in your browser
2. Look for install icon in address bar
3. Click "Install ETF Calculator"
4. App will be added to your applications

### Mobile (iOS/Android)
1. Open in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen" or install prompt
3. Confirm installation
4. Access from home screen like a native app

### Features After Installation
- Works offline completely
- Data persists between sessions
- Background sync when connection returns
- Native app-like experience
- Fast startup times

## 🔐 HTTPS Requirement

PWA features require HTTPS. For deployment:

### Development
- Use `localhost` (works without HTTPS)
- Or use tools like `ngrok` for HTTPS tunneling

### Production
- Ensure SSL certificate is properly configured
- Redirect HTTP to HTTPS
- Use trusted certificate authority

## 🧮 How to Use

### ETF (Early Termination Fee) Calculator
1. Select "ETF" tab
2. Enter:
   - **Agreed Cease Date**: When contract termination was agreed
   - **Contract End Date**: Original contract end date
   - **Monthly Sell Amount**: Monthly contract value in £
3. Click "Calculate ETF"
4. View detailed breakdown with formula explanation

### NPF (Notice Period Fee) Calculator
1. Select "NPF" tab
2. Enter:
   - **Agreed Cease Date**: When termination was agreed
   - **Request Received Date**: When termination request was received
   - **Monthly Sell Amount**: Monthly contract value in £
3. Click "Calculate NPF"
4. View calculation based on 30-day notice period formula

### Data Management
- **Auto-save**: All calculations automatically saved
- **View Records**: Counter shows total saved calculations
- **Export Data**: Click "Export CSV" to download all records
- **Offline Access**: All data available when offline

## 🎨 Customization

### Branding
- Replace `logo.jpg` with your company logo
- Update `manifest.json` with your app name and details
- Modify colors in `style.css` CSS custom properties

### Theme Colors
```css
:root {
  --color-primary: #21808D;     /* Main brand color */
  --color-background: #FCFCF9;  /* Background color */
  --color-surface: #FFFFFDD;    /* Card background */
}
```

### App Information
```json
// In manifest.json
{
  "name": "Your Company ETF Calculator",
  "short_name": "ETF Calc",
  "description": "Your description here"
}
```

## 🔧 Configuration

### Service Worker Caching
Modify `service-worker.js` to change caching strategy:
```javascript
const CACHE_NAME = 'etf-npf-calculator-v2';
const urlsToCache = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'logo.jpg'
];
```

### Manifest Configuration
Update `manifest.json` for your organization:
```json
{
  "name": "Your ETF & NPF Calculator",
  "theme_color": "#your-color",
  "background_color": "#your-bg-color",
  "icons": [
    {
      "src": "your-logo.jpg",
      "sizes": "512x512",
      "type": "image/jpeg"
    }
  ]
}
```

## 🚀 Deployment Options

### Static Hosting
- **GitHub Pages**: Free hosting with custom domain
- **Netlify**: Advanced features with easy deployment
- **Vercel**: Fast global CDN with instant deployment
- **Cloudflare Pages**: Global edge deployment

### Traditional Web Hosting
- Upload files via FTP/SFTP
- Ensure HTTPS is properly configured
- Set proper MIME types for `.json` and `.js` files

### CDN Deployment
- Use any CDN that supports static files
- Ensure proper caching headers
- Configure HTTPS and compression

## 🔍 Testing

### PWA Compliance
- Use Chrome DevTools → Lighthouse → PWA audit
- Check for 90+ PWA score
- Verify offline functionality
- Test install/uninstall process

### Browser Testing
- **Chrome**: Full PWA support
- **Edge**: Full PWA support  
- **Firefox**: PWA support with some limitations
- **Safari**: Basic PWA support
- **Mobile browsers**: Test install process

### Functionality Testing
- Test all calculations with various date ranges
- Verify CSV export functionality
- Test offline mode (disconnect internet)
- Verify data persistence after browser restart

## 📊 Analytics & Monitoring

### Basic Analytics
```javascript
// Add to app.js for basic tracking
function trackCalculation(type) {
  // Your analytics code here
  console.log(`${type} calculation performed`);
}
```

### Service Worker Monitoring
```javascript
// Monitor cache performance
self.addEventListener('fetch', event => {
  // Add performance tracking
});
```

## 🐛 Troubleshooting

### Common Issues

**PWA not installing:**
- Ensure HTTPS is enabled
- Check console for service worker errors
- Verify manifest.json is accessible
- Check if icons are loading properly

**Offline mode not working:**
- Verify service worker registration
- Check cache strategy in DevTools
- Ensure all resources are cached
- Test with airplane mode

**Calculations incorrect:**
- Verify input date formats
- Check timezone handling
- Test edge cases (leap years, month boundaries)
- Compare with manual calculations

**Data not persisting:**
- Check localStorage availability
- Verify browser storage permissions
- Test in incognito mode
- Check for storage quota limits

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📈 Performance Optimization

### Caching Strategy
- Static assets cached indefinitely
- App shell cached with network-first strategy
- Data cached with cache-first fallback

### Bundle Optimization
- CSS/JS minification for production
- Image optimization (WebP format recommended)
- Lazy loading for non-critical resources

## 🔒 Security

### Data Privacy
- All calculations stored locally only
- No data transmitted to external servers
- CSV export happens client-side only
- Local storage automatically cleared when requested

### Content Security Policy
Add to `index.html` for enhanced security:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; style-src 'self' 'unsafe-inline';">
```

## 📝 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🤝 Support

For technical support or feature requests:
- Check browser console for error messages
- Test in different browsers
- Verify HTTPS configuration
- Check service worker registration

## 🔄 Updates

### Automatic Updates
- Service worker handles app updates automatically
- Users see update notification when available
- Update process preserves user data

### Manual Updates
1. Update version in `service-worker.js`
2. Deploy new files
3. Users will see update prompt on next visit

---

**Ready for Production Deployment! 🚀**

All files are optimized and ready for immediate deployment to any web server with HTTPS support.
