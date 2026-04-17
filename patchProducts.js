const fs = require('fs');

const path = './main.js';
const content = fs.readFileSync(path, 'utf8');

const startMarker = 'const products = {';
const endMarker = '// ===== CART FUNCTIONALITY =====';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found');
    process.exit(1);
}

const replacement = `const API_BASE_URL = 'http://localhost:5001';

// Global products store
let products = {};

// Fetch products from backend
async function fetchProducts() {
    try {
        const res = await fetch(\`\${API_BASE_URL}/products\`);
        const jsonResponse = await res.json();
        
        // Backend returns either an array of products or an object like { products: [...] }
        const data = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.products || jsonResponse.data || []);
        
        data.forEach(p => {
            // Re-map back to frontend format
            products[p._id || p.id] = {
                id: p._id || p.id,
                name: p.name,
                category: p.subCategory || p.category,
                categoryPage: p.category === 'Skincare' ? 'shop-skincare.html' :
                              p.category === 'Makeup' ? 'shop-makeup.html' :
                              p.category === 'Hair' ? 'shop-hair.html' :
                              p.category === 'Nails' ? 'shop-nails.html' : 'shop-tools.html',
                price: p.price,
                image: (p.images && p.images.length > 0) ? p.images[0] : 'img/placeholder.jpg',
                rating: p.rating ? p.rating.average : 0,
                reviews: p.rating ? p.rating.count : 0,
                description: p.description,
                skinType: p.skinType ? p.skinType.join(', ') : '',
                ingredients: p.ingredients || [],
                originalPrice: p.variants && p.variants.find(v => v.priceAdjustment < 0) ? p.price + 10 : null
            };
        });
        
        // Trigger a custom event to signify that products are loaded
        window.dispatchEvent(new Event('productsLoaded'));
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

// Call fetchProducts on load
fetchProducts();

${endMarker}`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + endMarker.length);

fs.writeFileSync(path, newContent);
console.log('Successfully updated main.js with dynamic products fetch!');
