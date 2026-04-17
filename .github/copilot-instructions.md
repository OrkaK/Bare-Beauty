# Copilot Instructions for BareBeauty

## Project Overview
BareBeauty is a static e-commerce beauty product website with a Node.js/Express backend for user registration. The frontend is purely client-side JavaScript with no build process.

## Architecture

### Frontend (Static HTML + Vanilla JS)
- **No framework/bundler** - Direct HTML pages with shared `main.js` and `style.css`
- **Page structure**: `index.html` (homepage), `shop-{category}.html` (category pages), `product-detail.html` (dynamic via URL params)
- **Product data**: Centralized in `main.js` as the `products` object (lines 147-580) - this is the single source of truth for all product info

### Backend (Express)
- **server.js**: Minimal Express server for user registration only
- **MongoDB**: Stores registered users (`User` model with name, about, expertise, photos)
- **File uploads**: Handled via Multer to `uploads/` directory

## Key Patterns

### Product System
Products use a slug-based ID system (e.g., `cleanser-1`, `serum-1`, `nails-french-1`). Each product object contains:
```javascript
{
  id, name, category, categoryPage, price, originalPrice?, image,
  rating, reviews, description, skinType?, ingredients: []
}
```
Product detail pages load dynamically: `product-detail.html?id=serum-1`

### Cart State
- Cart persists via `localStorage` key: `bareBeautyCart`
- Structure: `[{ id, name, price, quantity }]`
- `updateCartCount()` syncs `.cart-count` badge across all pages

### UI Conventions
- **Notifications**: Use `showNotification(message)` for toast-style alerts (bottom-right)
- **Filter system**: Checkbox-based filters in `.filter-group`, collapsible via `initFilterDropdowns()`
- **Pagination**: 9 products per page (`PRODUCTS_PER_PAGE` constant)

## CSS Architecture
- **Font stack**: Cormorant Garamond (headings) + Montserrat (body)
- **Color palette**: Pink navbar (`#f7c5c5`), beige accents (`#e4d5c3`), brown buttons (`#8b7355`)
- **Icon library**: Font Awesome 6.4 (CDN-loaded)
- **Component prefixes**: `.product-card-shop`, `.filter-group`, `.popup-*`

## Development Workflow

### Running Locally
```bash
# Install dependencies (for backend only)
npm install express multer mongoose

# Start server (registration feature)
node server.js  # Runs on port 3000

# Frontend: Open HTML files directly in browser (no build needed)
```

### Adding New Products
1. Add entry to `products` object in `main.js` with unique slug ID
2. Add product card HTML to appropriate `shop-{category}.html`
3. Ensure `data-category`, `data-price` attributes match for filtering

### Modifying Filters
Filters work via `data-*` attributes on `.product-card-shop` elements. The `filterProducts()` function in `main.js` checks these against active filter values.

## File Relationships
```
index.html          → Homepage with category showcases
shop-skincare.html  → Skincare products (Cleanser, Serum, Toner, etc.)
shop-makeup.html    → Makeup products (Foundation, Blush, Mascara, etc.)
shop-nails.html     → Nail products (Press-ons, Cuticle oil, etc.)
shop-tools.html     → Beauty tools (Brushes, Gua Sha, LED devices)
product-detail.html → Dynamic product page (reads ?id= param)
advisor.html        → AI Beauty Advisor with camera/manual skin analysis
main.js             → All frontend logic + product database
advisor.js          → AI Advisor recommendation engine
style.css           → Global styles (3200+ lines including advisor styles)
server.js           → Express backend for registration only
```

## AI Advisor Feature (`advisor.html` + `advisor.js`)

### User Profile State
```javascript
userProfile = {
  skinType: 'dry'|'oily'|'combination'|'sensitive',
  skinTone: 'fair'|'light'|'medium'|'tan'|'deep'|'rich',
  undertone: 'warm'|'cool'|'neutral',
  concerns: ['acne','aging','dark-spots','dryness','redness','pores','dark-circles','dullness'],
  preferences: ['cruelty-free','vegan','budget','luxury'],
  analysisMethod: 'camera'|'manual'
}
```

### Recommendation Engine
- `getSkincareRecommendations()` → Builds personalized routine (cleanser → toner → serum → moisturizer)
- `getMakeupRecommendations()` → Matches products to undertone and concerns
- `getToolRecommendations()` → Suggests tools based on concerns (gua sha for puffiness, etc.)
- `getDealsRecommendations()` → Filters products with `originalPrice` (sale items)

### Camera Integration
Uses `navigator.mediaDevices.getUserMedia()` for webcam access. Analysis is simulated locally (no external API). For real ML integration, replace `performCameraAnalysis()` with TensorFlow.js or face-api.js.

### Adding Recommendation Logic
To add new concern-based recommendations, modify the switch/if blocks in `getSkincareRecommendations()` and `getMakeupRecommendations()` functions in `advisor.js`.

## Important Caveats
- **No cart checkout page** exists yet - cart functionality is partial
- **Images**: Mix of local (`img/`) and external URLs (Unsplash, Kwcdn)
- **MongoDB required** for registration feature; frontend works without it
- **No mobile nav** - responsive styles exist but hamburger menu is incomplete
