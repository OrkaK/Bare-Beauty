let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.header .navbar');

menu?.addEventListener('click', () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
});

window.onscroll = () => {
    menu?.classList.remove('fa-times');
    navbar?.classList.remove('active');
};

let slides = document.querySelectorAll('.home .slide');
let index = 0;

function next() {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
}

function prev() {
    slides[index].classList.remove('active');
    index = (index - 1 + slides.length) % slides.length;
    slides[index].classList.add('active');
}

// ===== COLLAPSIBLE FILTER DROPDOWNS =====
function initFilterDropdowns() {
    const filterGroups = document.querySelectorAll('.filter-group');
    
    filterGroups.forEach((group, index) => {
        const heading = group.querySelector('h4');
        const options = group.querySelectorAll('.filter-option');
        
        // Wrap filter options in a container div if not already wrapped
        if (options.length > 0 && !group.querySelector('.filter-options')) {
            const optionsWrapper = document.createElement('div');
            optionsWrapper.className = 'filter-options';
            options.forEach(option => {
                optionsWrapper.appendChild(option);
            });
            group.appendChild(optionsWrapper);
        }
        
        // All filters start collapsed by default
        
        // Add click handler to heading
        heading?.addEventListener('click', () => {
            // Toggle current group
            group.classList.toggle('active');
        });
    });
    
    // Clear filters button functionality
    const clearBtn = document.querySelector('.clear-filters');
    clearBtn?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });
}

// Initialize filter dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', initFilterDropdowns);

// ===== PAGINATION SYSTEM =====
const PRODUCTS_PER_PAGE = 10;

function initPagination() {
    const productGrid = document.querySelector('.product-grid-shop');
    const paginationContainer = document.querySelector('.pagination');
    
    if (!productGrid || !paginationContainer) return;
    
    const allProducts = Array.from(productGrid.querySelectorAll('.product-card-shop'));
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    let currentPage = 1;
    
    // Update results count
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${totalProducts} Products`;
    }
    
    function showPage(page) {
        currentPage = page;
        const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        
        allProducts.forEach((product, index) => {
            if (index >= startIndex && index < endIndex) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
        
        updatePaginationButtons();
        
        // Scroll to top of products
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function updatePaginationButtons() {
        paginationContainer.innerHTML = '';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = `page-btn prev-btn${currentPage === 1 ? ' disabled' : ''}`;
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) showPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevBtn);
        
        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn${i === currentPage ? ' active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => showPage(i));
            paginationContainer.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = `page-btn next-btn${currentPage === totalPages ? ' disabled' : ''}`;
        nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) showPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextBtn);
    }
    
    // Initialize - show first page
    showPage(1);
}

// Initialize pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', initPagination);

// ===== PRODUCT DATABASE =====
const API_BASE_URL = 'http://localhost:5001';

// Global products store
let products = {};

// Fetch products from backend
async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/products`);
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
        console.error('Error fetching products - Backend offline. Using dummy mock data array:', err);
        const mockData = [
            { id: "cleanser-1", name: "Gentle Foam Cleanser", category: "Cleanser", price: 32, subCategory: "Cleanser", images: ["img/Skincare/GentleFoanCleanser.png"], skinType: ["all"], rating: { average: 4.8, count: 128 } },
            { id: "serum-1", name: "Vitamin C Brightening Serum", category: "Serum", price: 58, subCategory: "Serum", images: ["img/Skincare/VitaminCBrighteningSerum.png"], skinType: ["dry"], rating: { average: 5.0, count: 89 } },
            { id: "toner-1", name: "Balancing Rose Toner", category: "Toner", price: 28, subCategory: "Toner", images: ["img/Skincare/BalancingRoseToner.png"], skinType: ["oily"], rating: { average: 4.2, count: 56 } },
            { id: "moisturizer-1", name: "SPF 30 Day Cream", category: "SPF Moisturizer", price: 45, subCategory: "Moisturizer", variants: [{priceAdjustment:-10}], images: ["img/Skincare/SPF30DayCream.png"], skinType: ["combination"], rating: { average: 5.0, count: 203 } },
            { id: "eye-cream-1", name: "Revitalizing Eye Cream", category: "Under-Eye Cream", price: 42, subCategory: "Eye Cream", images: ["img/Skincare/RevitalizingEyeCream.png"], skinType: ["all"], rating: { average: 4.5, count: 74 } }
        ];
        
        mockData.forEach(p => {
            products[p.id] = {
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price,
                image: (p.images && p.images.length > 0) ? p.images[0] : 'img/placeholder.jpg',
                rating: p.rating ? p.rating.average : 0,
                reviews: p.rating ? p.rating.count : 0,
                skinType: p.skinType ? p.skinType.join(', ') : '',
                originalPrice: p.variants && p.variants.find(v => v.priceAdjustment < 0) ? p.price + 10 : null
            };
        });
        window.dispatchEvent(new Event('productsLoaded'));
    }
}

// Call fetchProducts on load
fetchProducts();

// ===== CART FUNCTIONALITY =====
let cartToken = localStorage.getItem('bareBeautyCartToken');
let cart = []; // We will sync this from backend

async function initCart() {
    if (!cartToken) {
        try {
            const res = await fetch(`${API_BASE_URL}/cart`, { method: 'POST' });
            if (res.ok) {
                const newCart = await res.json();
                cartToken = newCart.cartToken;
                localStorage.setItem('bareBeautyCartToken', cartToken);
            }
        } catch (e) {
            console.error('Offline - Cart backend unreachable');
        }
    } else {
        try {
            const res = await fetch(`${API_BASE_URL}/cart/${cartToken}`);
            if (res.ok) {
                const cartData = await res.json();
                // Map backend .items to frontend cart structure
                cart = cartData.items.map(item => ({
                    id: item.product._id,
                    name: item.product.name,
                    price: item.priceAtAdd,
                    quantity: item.quantity,
                    image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : 'img/placeholder.jpg'
                }));
            }
        } catch (e) {
            console.error('Offline - Cart backend unreachable');
        }
    }
    // Also try to restore any offline local cart if we couldn't get it from backend
    if (cart.length === 0 && localStorage.getItem('bareBeautyCart')) {
        cart = JSON.parse(localStorage.getItem('bareBeautyCart')) || [];
    }
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
    // For backwards compatibility on UI, still save local mock
    localStorage.setItem('bareBeautyCart', JSON.stringify(cart));
}

async function addToCart(product) {
    // Optimistic UI Update
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({ ...product, quantity: product.quantity || 1 });
    }
    updateCartCount();
    showNotification('Added to cart!');
    
    // Sync to Backend
    if (cartToken && typeof product.id === 'string' && product.id.length > 10) {
        try {
            await fetch(`${API_BASE_URL}/cart/${cartToken}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: product.quantity || 1
                })
            });
        } catch(e) {
            console.error('Failed to sync cart add to backend', e);
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add to cart button listeners
document.querySelectorAll('.add-to-cart-btn, .add-to-cart-btn-large').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.product-card-shop') || btn.closest('.product-info-detail')?.parentElement;
        const name = card?.querySelector('.product-name, .product-title')?.textContent?.trim() || 'Product';
        // Find product ID from global products dictionary to map to Mongo ObjectId
        const matchedProduct = Object.values(products).find(p => p.name === name);
        const productId = matchedProduct ? matchedProduct.id : Date.now();
        
        const product = {
            id: productId,
            name: name,
            price: parseFloat(card?.querySelector('.current-price')?.textContent?.replace('$', '')) || 0,
            quantity: parseInt(document.getElementById('quantity')?.value) || 1,
            image: matchedProduct ? matchedProduct.image : ''
        };
        addToCart(product);
    });
});

// Initialize cart on page load
initCart();

// ===== PRODUCT DETAIL PAGE FUNCTIONS =====

function loadProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;

    if (Object.keys(products).length > 0) {
        displayProductDetails(productId);
    } else {
        window.addEventListener('productsLoaded', () => displayProductDetails(productId));
    }
}

function displayProductDetails(productId) {
    const product = products[productId];
    if (!product) {
        const desc = document.getElementById('product-description');
        if (desc) desc.textContent = "Product not found.";
        return;
    }
    
    if (document.getElementById('product-name')) document.getElementById('product-name').textContent = product.name;
    if (document.getElementById('product-category')) document.getElementById('product-category').textContent = product.category;
    if (document.getElementById('breadcrumb-category-link')) {
        document.getElementById('breadcrumb-category-link').textContent = product.category;
        document.getElementById('breadcrumb-category-link').href = product.categoryPage || '#';
    }
    if (document.getElementById('breadcrumb-product')) document.getElementById('breadcrumb-product').textContent = product.name;
    if (document.getElementById('product-price')) document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
    if (document.getElementById('product-original-price') && product.originalPrice) {
        document.getElementById('product-original-price').textContent = `$${product.originalPrice.toFixed(2)}`;
        document.getElementById('product-original-price').style.display = 'inline';
    }
    if (document.getElementById('product-description')) document.getElementById('product-description').textContent = product.description || 'Experience the best care with Bare Beauty.';
    if (document.getElementById('mainProductImage') && product.image) document.getElementById('mainProductImage').src = product.image;
    if (document.getElementById('product-rating')) document.getElementById('product-rating').textContent = product.rating || '5.0';
    if (document.getElementById('product-reviews')) document.getElementById('product-reviews').textContent = `(${product.reviews || 0} Reviews)`;
}

// Image Gallery
function changeImage(src, thumbnail) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = src;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail?.classList.add('active');
    }
}

// Quantity Controls
function increaseQty() {
    const qtyInput = document.getElementById('quantity');
    if (qtyInput && qtyInput.value < 10) {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    }
}

function decreaseQty() {
    const qtyInput = document.getElementById('quantity');
    if (qtyInput && qtyInput.value > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
    }
}

// Product Tabs
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    event.target.classList.add('active');
}

// Size Selection
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ===== FILTER AND SEARCH FUNCTIONALITY =====
const filterCheckboxes = document.querySelectorAll('.filters-sidebar input[type="checkbox"]');
const productCards = document.querySelectorAll('.product-card-shop');
const searchInput = document.querySelector('.search-input');
let currentSearchTerm = '';

filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
});

function filterProducts() {
    const activeFilters = {};
    
    filterCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const filterType = checkbox.name;
            if (!activeFilters[filterType]) {
                activeFilters[filterType] = [];
            }
            activeFilters[filterType].push(checkbox.value);
        }
    });

    productCards.forEach(card => {
        let show = true;
        
        for (const [filterType, values] of Object.entries(activeFilters)) {
            const cardValue = card.getAttribute('data-' + filterType);
            if (cardValue && cardValue !== 'all' && !values.includes(cardValue)) {
                show = false;
                break;
            }
        }
        
        if (show && currentSearchTerm) {
            const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
            if (!productName.includes(currentSearchTerm) && !category.includes(currentSearchTerm)) {
                show = false;
            }
        }
        
        card.style.display = show ? 'block' : 'none';
    });

    updateResultsCount();
}

function updateResultsCount() {
    const visibleProducts = document.querySelectorAll('.product-card-shop[style*="display: block"], .product-card-shop:not([style*="display"])');
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${visibleProducts.length} Products`;
    }
}

// Clear Filters
document.querySelector('.clear-filters')?.addEventListener('click', () => {
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    productCards.forEach(card => {
        card.style.display = 'block';
    });
    updateResultsCount();
});

// ===== SORT FUNCTIONALITY =====
document.getElementById('sort')?.addEventListener('change', (e) => {
    const grid = document.querySelector('.product-grid-shop');
    const cards = Array.from(productCards);
    
    cards.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price) || 0;
        const priceB = parseFloat(b.dataset.price) || 0;
        
        switch(e.target.value) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            default:
                return 0;
        }
    });
    
    cards.forEach(card => grid?.appendChild(card));
});

// ===== SEARCH EVENTS =====
const searchInputs = document.querySelectorAll('.search-input');
const searchSubmits = document.querySelectorAll('.search-submit');

function executeGlobalSearch(query) {
    if (!query) return;
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

searchInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeGlobalSearch(e.target.value.trim());
        }
    });
});

searchSubmits.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = btn.parentElement.querySelector('.search-input');
        if (input) executeGlobalSearch(input.value.trim());
    });
});

// ===== REVIEW FUNCTIONALITY =====
document.querySelectorAll('.helpful-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.style.background = '#fdf8f3';
        btn.style.borderColor = '#c4a077';
        btn.style.color = '#c4a077';
    });
});

// Review Filters
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
    });
});

// ===== QUICK VIEW MODAL =====
function initQuickView() {
    // Create modal HTML and append to body
    const modalHTML = `
    <div class="quick-view-overlay" id="quickViewOverlay">
        <div class="quick-view-modal">
            <button class="quick-view-close" id="quickViewClose">&times;</button>
            <div class="quick-view-content">
                <div class="quick-view-image">
                    <img src="" alt="" id="quickViewImage">
                </div>
                <div class="quick-view-info">
                    <span class="product-category-tag" id="quickViewCategory"></span>
                    <h2 id="quickViewName"></h2>
                    <div class="product-rating-detail">
                        <div class="stars" id="quickViewStars"></div>
                        <span class="rating-text" id="quickViewRating"></span>
                        <span class="review-count" id="quickViewReviews"></span>
                    </div>
                    <div class="product-price-detail">
                        <span class="original-price" id="quickViewOriginalPrice" style="display:none;"></span>
                        <span class="current-price" id="quickViewPrice"></span>
                    </div>
                    <p class="product-short-desc" id="quickViewDesc"></p>
                    <a href="#" class="quick-view-detail-link" id="quickViewDetailLink">View Full Details →</a>
                    <button class="add-to-cart-btn-large quick-view-add-cart" id="quickViewAddCart">
                        <i class="fa-solid fa-shopping-bag"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('quickViewOverlay');
    const closeBtn = document.getElementById('quickViewClose');

    // Close modal handlers
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('active');
    });

    // Quick View - click on product card (not Add to Cart button)
    document.querySelectorAll('.product-card-shop').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open quick view if clicking Add to Cart button
            if (e.target.closest('.add-to-cart-btn')) return;

            e.preventDefault();
            e.stopPropagation();

            // Get product info from the card
            const link = card.querySelector('a[href*="product-detail"]');
            const productId = link ? new URLSearchParams(link.href.split('?')[1]).get('id') : null;
            const imgEl = card.querySelector('.product-image img');
            const imageSrc = imgEl ? imgEl.src : '';
            const imageAlt = imgEl ? imgEl.alt : '';
            const name = card.querySelector('.product-name')?.textContent || '';
            const category = card.querySelector('.product-category')?.textContent || '';
            const currentPrice = card.querySelector('.current-price')?.textContent || '';
            const originalPrice = card.querySelector('.original-price')?.textContent || '';
            const ratingCount = card.querySelector('.rating-count')?.textContent || '';
            const starsHTML = card.querySelector('.stars')?.innerHTML || '';

            // Look up from products database for description, or use a fallback
            const productData = productId && products[productId] ? products[productId] : null;
            const description = productData ? productData.description : 'Click "View Full Details" to learn more about this product.';
            const rating = productData ? productData.rating.toFixed(1) : '';

            // Populate modal
            document.getElementById('quickViewImage').src = imageSrc;
            document.getElementById('quickViewImage').alt = imageAlt;
            document.getElementById('quickViewName').textContent = name;
            document.getElementById('quickViewCategory').textContent = category;
            document.getElementById('quickViewPrice').textContent = currentPrice;
            document.getElementById('quickViewStars').innerHTML = starsHTML;
            document.getElementById('quickViewRating').textContent = rating;
            document.getElementById('quickViewReviews').textContent = ratingCount;
            document.getElementById('quickViewDesc').textContent = description;

            const origPriceEl = document.getElementById('quickViewOriginalPrice');
            if (originalPrice) {
                origPriceEl.textContent = originalPrice;
                origPriceEl.style.display = 'inline';
            } else {
                origPriceEl.style.display = 'none';
            }

            const detailLink = document.getElementById('quickViewDetailLink');
            detailLink.href = link ? link.getAttribute('href') : '#';

            // Add to cart from modal
            const addCartBtn = document.getElementById('quickViewAddCart');
            addCartBtn.onclick = () => {
                addToCart({
                    id: productId || Date.now(),
                    name: name,
                    price: parseFloat(currentPrice.replace('$', '')) || 0,
                    image: imageSrc,
                    quantity: 1
                });
                overlay.classList.remove('active');
            };

            // Show modal
            overlay.classList.add('active');
        });
    });
}

// Quick View Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
  const quickViewBtns = document.querySelectorAll('.quick-view-btn');

  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productCard = btn.closest('.product-card-shop');
      
      // Get the image element inside the card
      const imgElement = productCard.querySelector('.product-image img');
      
      if (!imgElement) {
        console.error("No image found in this product card");
        return;
      }

      // getAttribute('src') gets the exact string in the HTML (e.g., "img/file.jpg")
      // img.src gets the full URL (e.g., "http://localhost.../img/file.jpg")
      // We generally want the src property for the modal image.
      const productImageSrc = imgElement.src; 
      
      const productName = productCard.querySelector('.product-name').innerText; // use innerText to avoid hidden spacing
      
      // Check if price exists, handle sales prices
      let productPrice = '';
      const salePrice = productCard.querySelector('.current-price.sale');
      const regularPrice = productCard.querySelector('.current-price');
      
      if (salePrice) {
        productPrice = salePrice.innerText;
      } else if (regularPrice) {
        productPrice = regularPrice.innerText;
      }

      const productCategory = productCard.querySelector('.product-category').innerText;

      console.log("Opening Quick View:", productName, productImageSrc); // Debug log

      showQuickViewModal(productImageSrc, productName, productCategory, productPrice);
    });
  });

  function showQuickViewModal(image, name, category, price) {
    let modal = document.getElementById('quickViewModal');
    
    // Create modal if it doesn't exist
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quickViewModal';
      modal.className = 'quick-view-modal';
      modal.innerHTML = `
        <div class="quick-view-overlay"></div>
        <div class="quick-view-content">
          <button class="quick-view-close">&times;</button>
          <div class="quick-view-image">
            <img src="" alt="Product" id="quickViewImage">
          </div>
          <div class="quick-view-details">
            <span class="qv-category"></span>
            <h2 class="qv-name"></h2>
            <p class="qv-price"></p>
            <button class="qv-add-to-cart">Add to Cart</button>
            <button class="qv-view-details">View Full Details</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.quick-view-close').addEventListener('click', () => {
        modal.classList.remove('active');
      });
      modal.querySelector('.quick-view-overlay').addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Update content
    const modalImg = modal.querySelector('#quickViewImage');
    modalImg.src = image;
    modalImg.alt = name;
    
    modal.querySelector('.qv-name').innerText = name;
    modal.querySelector('.qv-category').innerText = category;
    modal.querySelector('.qv-price').innerText = price;

    // Show modal
    modal.classList.add('active');
  }
});

// Smooth scroll for quick view link in reviews
document.querySelector('.review-count')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// VISUAL EFFECTS ENGINE - Makes BareBeauty Unique
// ============================================

// ===== FLOATING BEAUTY PARTICLES =====
(function initParticles() {
  // Only show floating makeup icons on the home page
  const isHomePage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/') ||
                     window.location.pathname === '';

  const container = document.createElement('div');
  container.className = 'particles-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.prepend(container);

  if (isHomePage) {
    // Makeup-themed icons for the home page
    const icons = [
      'fa-solid fa-pump-soap',       // skincare bottle
      'fa-solid fa-spray-can-sparkles', // spray
      'fa-solid fa-droplet',         // serum drop
      'fa-solid fa-heart',           // love/beauty
      'fa-solid fa-star',            // star
      'fa-solid fa-spa',             // spa/face mask
      'fa-solid fa-gem',             // gem/luxury
      'fa-solid fa-wand-magic-sparkles', // magic wand
      'fa-solid fa-hand-sparkles',   // sparkle hands
      'fa-solid fa-paintbrush',      // brush
      'fa-solid fa-eye',             // eye makeup
      'fa-solid fa-leaf',            // natural/clean
      'fa-solid fa-flask',           // serum flask
      'fa-solid fa-sun',             // SPF
    ];

    const colors = [
      'rgba(179, 155, 125, 0.18)',  // gold
      'rgba(228, 213, 195, 0.22)',  // beige
      'rgba(245, 230, 224, 0.25)',  // pink
      'rgba(168, 144, 128, 0.15)', // rose
      'rgba(201, 190, 179, 0.20)', // mocha
    ];

    for (let i = 0; i < 22; i++) {
      const particle = document.createElement('i');
      const iconClass = icons[Math.floor(Math.random() * icons.length)];
      particle.className = `makeup-icon-particle ${iconClass}`;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.fontSize = (Math.random() * 18 + 14) + 'px';
      particle.style.animationDuration = (Math.random() * 18 + 14) + 's';
      particle.style.animationDelay = (Math.random() * 12) + 's';
      // Randomize horizontal drift direction
      particle.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      container.appendChild(particle);
    }
  } else {
    // Subtle dot particles for other pages
    const colors = [
      'rgba(228, 213, 195, 0.4)',
      'rgba(179, 155, 125, 0.25)',
      'rgba(245, 230, 224, 0.5)',
      'rgba(201, 190, 179, 0.3)',
      'rgba(221, 213, 202, 0.35)',
    ];

    for (let i = 0; i < 18; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 10 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = (Math.random() * 15 + 12) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(particle);
    }
  }
})();

// ===== SCROLL REVEAL ANIMATIONS =====
(function initScrollReveal() {
  // Auto-tag elements for reveal animations
  const selectors = [
    { sel: '.category-row', cls: 'reveal' },
    { sel: '.featured h2, .featured h3', cls: 'reveal' },
    { sel: '.product-grid', cls: 'reveal-stagger' },
    { sel: '.product-grid-shop', cls: 'reveal-stagger' },
    { sel: '.category-showcase', cls: 'reveal-stagger' },
    { sel: '.shop-by-category > h3', cls: 'reveal' },
    { sel: '.filters-sidebar', cls: 'reveal-left' },
    { sel: '.results-bar', cls: 'reveal' },
    { sel: '.footer-section', cls: 'reveal' },
    { sel: '.advisor-step', cls: 'reveal' },
    { sel: '.feedback-card', cls: 'reveal-scale' },
  ];

  selectors.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.classList.contains('reveal') && 
          !el.classList.contains('reveal-left') && 
          !el.classList.contains('reveal-right') && 
          !el.classList.contains('reveal-scale') && 
          !el.classList.contains('reveal-stagger')) {
        el.classList.add(cls);
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Add staggered delays to children of reveal-stagger containers
        if (entry.target.classList.contains('reveal-stagger')) {
          Array.from(entry.target.children).forEach((child, i) => {
            child.style.transitionDelay = (i * 0.06) + 's';
          });
        }
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger')
    .forEach(el => observer.observe(el));
})();

// ===== BACK-TO-TOP BUTTON =====
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ===== NAVBAR SHRINK ON SCROLL =====
(function initNavbarShrink() {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });
})();

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== SCROLL TO TOP ON PAGE LOAD =====
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});
// Also handle back/forward navigation
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ===== SPIN THE WHEEL POPUP SYSTEM (global — all pages) =====
document.addEventListener('DOMContentLoaded', function() {
  // Skip on login page
  if (window.location.pathname.includes('login.html')) return;

  // Inject popup HTML into the page
  const popupHTML = `
    <div class="popup-overlay" id="spinPopupOverlay" role="dialog" aria-modal="true" style="display:none;">
      <div class="spin-popup-content">
        <button class="close-x" id="closePopupX" aria-label="Close popup">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="spin-step" id="spinStepWheel">
          <h2>Spin & Win!</h2>
          <p class="spin-subtitle">Try your luck for exclusive rewards</p>
          <div class="wheel-container">
            <div class="wheel-pointer"><i class="fa-solid fa-caret-down"></i></div>
            <canvas id="spinCanvas" width="420" height="420"></canvas>
          </div>
          <button class="cta-button spin-btn" id="spinBtn">
            <i class="fa-solid fa-rotate"></i> SPIN NOW
          </button>
          <button class="close-btn" id="maybeLater">No thanks, I'll pass</button>
        </div>
        <div class="spin-step" id="spinStepResult" style="display:none;">
          <div class="result-confetti" aria-hidden="true">\u{1F389}</div>
          <h2>Congratulations!</h2>
          <p class="result-prize" id="resultPrize"></p>
          <p class="result-claim-label">Enter your email to claim your reward:</p>
          <input type="email" placeholder="Enter your email" class="email-input" id="spinEmail" aria-label="Email address">
          <button class="cta-button" id="claimRewardBtn">
            <i class="fa-solid fa-gift"></i> Claim My Reward
          </button>
        </div>
        <div class="spin-step" id="spinStepCode" style="display:none;">
          <div class="result-confetti" aria-hidden="true">\u2728</div>
          <h2>Your Reward</h2>
          <p class="result-prize" id="finalPrize"></p>
          <p class="result-code-label">Use code at checkout:</p>
          <div class="result-code" id="resultCode"></div>
          <button class="cta-button" id="resultShopBtn">Start Shopping <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
    <button class="popup-mini-trigger" id="popupMiniTrigger" aria-label="Spin to win!" title="Spin the wheel for exclusive offers">
      <i class="fa-solid fa-gift"></i>
      <span class="trigger-badge">Spin!</span>
    </button>
  `;
  document.body.insertAdjacentHTML('afterbegin', popupHTML);

  // References
  const popup = document.getElementById('spinPopupOverlay');
  const closeXBtn = document.getElementById('closePopupX');
  const maybeLaterBtn = document.getElementById('maybeLater');
  const miniTrigger = document.getElementById('popupMiniTrigger');
  const spinEmail = document.getElementById('spinEmail');
  const spinBtn = document.getElementById('spinBtn');
  const claimRewardBtn = document.getElementById('claimRewardBtn');
  const resultShopBtn = document.getElementById('resultShopBtn');

  let wonSegment = null;

  // Segments & weights
  const segments = [
    { label: '10% OFF',   color: '#b39b7d', code: 'GLOW10' },
    { label: 'Free Ship', color: '#d4c4a8', code: 'FREESHIP' },
    { label: '15% OFF',   color: '#8b7355', code: 'BARE15' },
    { label: '$5 OFF',    color: '#e8ddd4', code: 'SAVE5' },
    { label: '20% OFF',   color: '#a08060', code: 'BEAUTY20' },
    { label: 'Gift Set',  color: '#c9b99e', code: 'GIFTSET' },
    { label: '25% OFF',   color: '#6d5a45', code: 'VIP25' },
    { label: 'Try Again', color: '#f0e6da', code: null }
  ];
  const weights = [25, 20, 18, 15, 8, 5, 2, 7];

  let currentAngle = 0;
  let isSpinning = false;

  function drawWheel() {
    const canvas = document.getElementById('spinCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 4;
    const segAngle = (2 * Math.PI) / segments.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    segments.forEach((seg, i) => {
      const startAngle = currentAngle + i * segAngle;
      const endAngle = startAngle + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.fillStyle = (seg.color === '#e8ddd4' || seg.color === '#f0e6da' || seg.color === '#d4c4a8' || seg.color === '#c9b99e') ? '#5a4a3a' : '#fff';
      ctx.font = 'bold 17px Montserrat, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.label, r - 18, 0);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#b39b7d';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#b39b7d';
    ctx.fill();
  }

  function pickSegment() {
    const total = weights.reduce((s, w) => s + w, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return i;
    }
    return 0;
  }

  function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    const winIndex = pickSegment();
    const segAngle = 360 / segments.length;
    const segCenter = winIndex * segAngle + segAngle / 2;
    // Pointer is at top (270°). Rotate so the winning segment's center lands at 270°.
    const totalSpin = 360 * 6 + ((270 - segCenter + 360) % 360);
    const startAngle = currentAngle;
    const startTime = performance.now();
    const duration = 4500;
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const angleDeg = startAngle * (180 / Math.PI) + totalSpin * ease;
      currentAngle = (angleDeg % 360) * (Math.PI / 180);
      drawWheel();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        showResult(segments[winIndex]);
      }
    }
    requestAnimationFrame(animate);
  }

  function showResult(seg) {
    wonSegment = seg;
    document.getElementById('spinStepWheel').style.display = 'none';
    document.getElementById('spinStepResult').style.display = 'block';
    if (seg.code) {
      document.getElementById('resultPrize').textContent = 'You won ' + seg.label + '!';
      document.querySelector('.result-claim-label').style.display = '';
      spinEmail.style.display = '';
      claimRewardBtn.style.display = '';
      claimRewardBtn.innerHTML = '<i class="fa-solid fa-gift"></i> Claim My Reward';
      claimRewardBtn.onclick = null;
    } else {
      document.getElementById('resultPrize').textContent = 'So close! Try again next time.';
      document.querySelector('.result-claim-label').style.display = 'none';
      spinEmail.style.display = 'none';
      claimRewardBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Close';
      claimRewardBtn.style.display = '';
      claimRewardBtn.onclick = function() { hidePopup(); };
    }
  }

  function showPopup() {
    document.getElementById('spinStepWheel').style.display = 'block';
    document.getElementById('spinStepResult').style.display = 'none';
    document.getElementById('spinStepCode').style.display = 'none';
    spinBtn.disabled = false;
    isSpinning = false;
    popup.style.display = 'flex';
    popup.classList.add('popup-visible');
    popup.classList.remove('popup-hiding');
    drawWheel();
  }

  function hidePopup() {
    popup.classList.remove('popup-visible');
    popup.classList.add('popup-hiding');
    setTimeout(() => {
      popup.style.display = 'none';
      popup.classList.remove('popup-hiding');
    }, 300);
  }

  // Claim reward (email)
  claimRewardBtn.addEventListener('click', () => {
    if (claimRewardBtn.onclick) return; // "Close" handler takes priority
    const email = spinEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      spinEmail.classList.add('input-error');
      spinEmail.placeholder = 'Please enter a valid email';
      setTimeout(() => {
        spinEmail.classList.remove('input-error');
        spinEmail.placeholder = 'Enter your email';
      }, 2000);
      return;
    }
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userSignedUp', 'true');
    localStorage.setItem('spinCompleted', 'true');
    if (wonSegment && wonSegment.code) localStorage.setItem('spinReward', wonSegment.code);
    document.getElementById('spinStepResult').style.display = 'none';
    document.getElementById('spinStepCode').style.display = 'block';
    document.getElementById('finalPrize').textContent = 'You won ' + wonSegment.label + '!';
    document.getElementById('resultCode').textContent = wonSegment.code;
  });

  spinBtn.addEventListener('click', spinWheel);
  resultShopBtn.addEventListener('click', () => { hidePopup(); miniTrigger.style.display = 'none'; });
  closeXBtn.addEventListener('click', hidePopup);
  maybeLaterBtn.addEventListener('click', hidePopup);
  popup.addEventListener('click', (e) => { if (e.target === popup) hidePopup(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && popup.style.display === 'flex') hidePopup(); });
  spinEmail.addEventListener('keypress', (e) => { if (e.key === 'Enter') claimRewardBtn.click(); });
  miniTrigger.addEventListener('click', () => showPopup());

  // Init visibility — always show mini trigger
  miniTrigger.style.display = '';
  setTimeout(() => miniTrigger.classList.add('trigger-visible'), 1000);

  // Auto-show popup on first visit per session (sessionStorage resets when browser closes)
  if (!sessionStorage.getItem('spinPopupShown')) {
    setTimeout(() => {
      sessionStorage.setItem('spinPopupShown', 'true');
      showPopup();
    }, 4000);
  }
});

// ===== TRACKER FUNCTIONALITY =====

// Image upload preview handler
function initImageUpload(inputId, previewId, uploadAreaId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const uploadArea = document.getElementById(uploadAreaId);
  
  if (!input || !preview) return;
  
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        if (uploadArea) {
          const placeholder = uploadArea.querySelector('.upload-placeholder');
          if (placeholder) placeholder.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Tab switching for trackers
function initTrackerTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tracker-tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(tabId + '-tab').classList.add('active');
    });
  });
}

// Skincare Tracker
function initSkincareTracker() {
  if (!document.getElementById('morning-form')) return;
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const morningDateInput = document.getElementById('morning-date');
  const eveningDateInput = document.getElementById('evening-date');
  const symptomsDateInput = document.getElementById('symptoms-date');
  
  if (morningDateInput) morningDateInput.value = today;
  if (eveningDateInput) eveningDateInput.value = today;
  if (symptomsDateInput) symptomsDateInput.value = today;
  
  // Tab switching
  initTrackerTabs();
  
  // Morning form submission
  const morningForm = document.getElementById('morning-form');
  morningForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(morningForm);
    const products = formData.getAll('products');
    
    // Capture photo from canvas if taken
    const morningCanvas = document.getElementById('scMorningCanvas');
    const photoData = (morningCanvas && morningCanvas.style.display !== 'none') ? morningCanvas.toDataURL('image/jpeg', 0.7) : null;

    const entry = {
      id: Date.now(),
      type: 'morning',
      date: formData.get('date') || today,
      skinFeel: document.getElementById('morning-skin-feel')?.value || '',
      products: products,
      notes: formData.get('notes'),
      photo: photoData,
      timestamp: new Date().toISOString()
    };
    
    saveSkincareEntry(entry);
    morningForm.reset();
    // Clear option button selections
    morningForm.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    const mhidden = document.getElementById('morning-skin-feel');
    if (mhidden) mhidden.value = '';
    if (morningDateInput) morningDateInput.value = today;
    showToast();
    loadSkincareHistory(document.getElementById('history-filter')?.value || 'all');
  });
  
  // Evening form submission
  const eveningForm = document.getElementById('evening-form');
  eveningForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(eveningForm);
    const products = formData.getAll('products');

    // Capture photo from canvas if taken
    const eveningCanvas = document.getElementById('scEveningCanvas');
    const photoData = (eveningCanvas && eveningCanvas.style.display !== 'none') ? eveningCanvas.toDataURL('image/jpeg', 0.7) : null;
    
    const entry = {
      id: Date.now(),
      type: 'evening',
      date: formData.get('date') || today,
      skinFeel: document.getElementById('evening-skin-feel')?.value || '',
      products: products,
      notes: formData.get('notes'),
      photo: photoData,
      timestamp: new Date().toISOString()
    };
    
    saveSkincareEntry(entry);
    eveningForm.reset();
    eveningForm.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    const ehidden = document.getElementById('evening-skin-feel');
    if (ehidden) ehidden.value = '';
    if (eveningDateInput) eveningDateInput.value = today;
    showToast();
    loadSkincareHistory(document.getElementById('history-filter')?.value || 'all');
  });
  
  // Symptoms form submission
  const symptomsForm = document.getElementById('symptoms-form');
  symptomsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(symptomsForm);
    const symptoms = formData.getAll('symptoms');
    
    const entry = {
      id: Date.now(),
      type: 'symptoms',
      date: formData.get('date') || today,
      symptoms: symptoms,
      severity: formData.get('severity'),
      notes: formData.get('notes'),
      timestamp: new Date().toISOString()
    };
    
    saveSkincareEntry(entry);
    symptomsForm.reset();
    if (symptomsDateInput) symptomsDateInput.value = today;
    showToast();
    loadSkincareHistory(document.getElementById('history-filter')?.value || 'all');
  });
  
  // History filter
  const historyFilter = document.getElementById('history-filter');
  historyFilter?.addEventListener('change', () => {
    loadSkincareHistory(historyFilter.value);
  });
  
  // Clear history
  const clearHistoryBtn = document.getElementById('clear-history');
  clearHistoryBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all skincare history?')) {
      localStorage.removeItem('skincareTracker');
      loadSkincareHistory('all');
    }
  });
  
  // Load initial history
  loadSkincareHistory('all');
}

// Helper: Read file as data URL
function awaitFileReader(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Save skincare entry
function saveSkincareEntry(entry) {
  const entries = JSON.parse(localStorage.getItem('skincareTracker') || '[]');
  entries.push(entry);
  localStorage.setItem('skincareTracker', JSON.stringify(entries));
}

// Load and display skincare history
function loadSkincareHistory(filter = 'all') {
  const entries = JSON.parse(localStorage.getItem('skincareTracker') || '[]');
  const container = document.getElementById('history-entries');
  
  if (!container) return;
  
  let filteredEntries = entries;
  if (filter !== 'all') {
    filteredEntries = entries.filter(e => e.type === filter);
  }
  
  filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (filteredEntries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clipboard-list"></i>
        <p>No entries yet. Start tracking your skincare routine!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredEntries.map(entry => {
    let content = '';
    
    if (entry.type === 'symptoms') {
      const symptomLabels = {
        'dryness': 'Dryness', 'oiliness': 'Oiliness', 'redness': 'Redness',
        'breakouts': 'Breakouts', 'sensitivity': 'Sensitivity', 'itching': 'Itching',
        'dark-circles': 'Dark Circles', 'puffiness': 'Puffiness', 'fine-lines': 'Fine Lines',
        'none': 'No Symptoms'
      };
      content = `
        <div class="history-entry-products">
          ${entry.symptoms?.map(s => `<span class="history-product-tag">${symptomLabels[s] || s}</span>`).join('') || ''}
        </div>
        <p><strong>Severity:</strong> ${entry.severity || 'N/A'}/5</p>
      `;
    } else {
      content = `
        <div class="history-entry-products">
          ${entry.products?.map(p => `<span class="history-product-tag">${p}</span>`).join('') || ''}
        </div>
        ${entry.photo ? `<img src="${entry.photo}" class="history-entry-image" alt="Skin photo">` : ''}
      `;
    }
    
    return `
      <div class="history-entry ${entry.type}">
        <div class="history-entry-header">
          <span class="history-entry-date">${formatDate(entry.date)}</span>
          <span class="history-entry-type ${entry.type}">${entry.type}</span>
        </div>
        ${content}
        ${entry.notes ? `<p class="history-entry-notes">${entry.notes}</p>` : ''}
      </div>
    `;
  }).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// Haircare Tracker
function initHaircareTracker() {
  if (!document.getElementById('treatment-form')) return;
  
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  const treatmentDateInput = document.getElementById('treatment-date');
  if (treatmentDateInput) treatmentDateInput.value = today;
  
  // Tab switching
  initTrackerTabs();
  
  // Treatment form submission
  const treatmentForm = document.getElementById('treatment-form');
  treatmentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(treatmentForm);
    const products = formData.getAll('products');
    const concerns = formData.getAll('hairConcerns');

    // Capture photo from canvas if taken
    const hcCanvas = document.getElementById('hcCameraCanvas');
    const photoData = (hcCanvas && hcCanvas.style.display !== 'none') ? hcCanvas.toDataURL('image/jpeg', 0.7) : null;
    
    const entry = {
      id: Date.now(),
      type: 'treatment',
      date: formData.get('date') || today,
      hairType: document.getElementById('hair-type')?.value || '',
      treatmentFocus: document.getElementById('treatment-focus')?.value || '',
      concerns: concerns,
      products: products,
      notes: formData.get('notes'),
      photo: photoData,
      timestamp: new Date().toISOString()
    };
    
    saveHaircareEntry(entry);
    treatmentForm.reset();
    // Clear option button selections
    treatmentForm.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    const htHidden = document.getElementById('hair-type');
    const tfHidden = document.getElementById('treatment-focus');
    if (htHidden) htHidden.value = '';
    if (tfHidden) tfHidden.value = '';
    if (treatmentDateInput) treatmentDateInput.value = today;
    showToast();
    loadHaircareHistory();
  });
  
  // Clear history
  const clearHistoryBtn = document.getElementById('clear-history');
  clearHistoryBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all haircare history?')) {
      localStorage.removeItem('haircareTracker');
      loadHaircareHistory();
    }
  });
  
  // Load initial history
  loadHaircareHistory();
}

// Save haircare entry
function saveHaircareEntry(entry) {
  const entries = JSON.parse(localStorage.getItem('haircareTracker') || '[]');
  entries.push(entry);
  localStorage.setItem('haircareTracker', JSON.stringify(entries));
}

// Load and display haircare history
function loadHaircareHistory() {
  const entries = JSON.parse(localStorage.getItem('haircareTracker') || '[]');
  const container = document.getElementById('history-entries');
  
  if (!container) return;
  
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clipboard-list"></i>
        <p>No entries yet. Start tracking your haircare treatments!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = entries.map(entry => `
    <div class="history-entry">
      <div class="history-entry-header">
        <span class="history-entry-date">${formatDate(entry.date)}</span>
        <span class="history-entry-type" style="background: #e8f5e9; color: #2e7d32;">Treatment</span>
      </div>
      ${entry.hairType ? `<p><strong>Hair Type:</strong> ${entry.hairType} ${entry.treatmentFocus ? '&bull; <strong>Focus:</strong> ' + entry.treatmentFocus : ''}</p>` : ''}
      ${entry.concerns && entry.concerns.length ? `<div class="history-entry-products">${entry.concerns.map(c => `<span class="history-product-tag">${c}</span>`).join('')}</div>` : ''}
      <div class="history-entry-products">
        ${entry.products?.map(p => `<span class="history-product-tag">${p}</span>`).join('') || ''}
      </div>
      ${entry.photo ? `<img src="${entry.photo}" class="history-entry-image" alt="Hair photo" style="margin-top:10px;max-width:100%;height:150px;object-fit:cover;border-radius:8px;">` : ''}
      ${entry.notes ? `<p class="history-entry-notes">${entry.notes}</p>` : ''}
    </div>
  `).join('');
}

// Show toast message
function showToast() {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Initialize trackers on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initSkincareTracker();
  initHaircareTracker();

  // ===== AUTHENTICATION STATE =====
  const authUserStr = localStorage.getItem('bareBeautyUser');
  if (authUserStr) {
      try {
          const user = JSON.parse(authUserStr);
          if (user.loggedIn && user.name) {
              const accountLinks = document.querySelectorAll('a[href="login.html"]');
              accountLinks.forEach(link => {
                  if (link.innerHTML.includes('fa-user') || link.textContent.includes('Account')) {
                      // Update UI to show name
                      link.innerHTML = `<i class="fa-solid fa-user-check"></i> Hi, ${user.name.split(' ')[0]}`;
                      link.href = "#";
                      link.style.cursor = "default";
                      
                      // Add a logout button right after this link
                      const logoutBtn = document.createElement('a');
                      logoutBtn.href = "#";
                      logoutBtn.innerHTML = `<i class="fa-solid fa-sign-out-alt"></i> Logout`;
                      logoutBtn.style.marginLeft = "10px";
                      logoutBtn.addEventListener('click', (e) => {
                          e.preventDefault();
                          localStorage.removeItem('bareBeautyUser');
                          window.location.reload();
                      });
                      
                      link.parentNode.insertBefore(logoutBtn, link.nextSibling);
                  }
              });
          }
      } catch (e) {
          console.error('Error parsing auth state', e);
      }
  }
});
