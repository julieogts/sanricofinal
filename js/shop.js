// Initialize variables
let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let currentMode = 'drag'; // 'drag' or 'multi'
// Multi-mode removed - drag and drop only

// Loading functions
function showLoadingProducts() {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = '<div class="loading-spinner">Loading products...</div>';
    }
}

function showLoadingProductCount() {
    const productCountElement = document.getElementById('product-count');
    if (productCountElement) {
        productCountElement.textContent = 'LOADING';
    }
}

function hideLoadingProducts() {
    // This function will be called after products are loaded
    const loadingElement = document.querySelector('.loading-spinner');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Add cart wiggle animation when products finish loading
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.classList.add('cart-wiggle');
        setTimeout(() => {
            cartBtn.classList.remove('cart-wiggle');
        }, 600);
    }
}

// Get search query from URL
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('search');

// Load products from MongoDB
async function loadProducts() {
    console.log('🔍 loadProducts function called');
    
    // Show loading animations
    showLoadingProducts();
    showLoadingProductCount();
    
    try {
        console.log('📡 Fetching products from API...');
        const response = await fetch('http://localhost:3000/api/products');
        console.log('📊 Response status:', response.status);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        products = await response.json();
        console.log('✅ Initial products loaded:', products.length, 'products');
        
        // Log unique categories from database
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        console.log('Unique categories in database:', uniqueCategories);
        
        // Convert price to number - prefer SellingPrice, but fall back gracefully
        const toNumber = (val) => {
            if (val === null || val === undefined) return NaN;
            if (typeof val === 'object' && val.$numberDecimal !== undefined) return parseFloat(val.$numberDecimal);
            return parseFloat(val);
        };
        products = products.map(product => {
            const candidates = [product.SellingPrice, product.sellingPrice, product.Price, product.price];
            let finalPrice = NaN;
            for (const c of candidates) {
                const n = toNumber(c);
                if (!isNaN(n)) { finalPrice = n; break; }
            }
            const convertedProduct = { ...product, price: finalPrice };
            console.log('Converted product:', convertedProduct);
            return convertedProduct;
        });
        
        console.log('Products after price conversion:', products);
        filteredProducts = [...products];
        console.log('Initial filtered products:', filteredProducts);
        
        // If there's a search query, filter products immediately
        if (searchQuery) {
            const searchInput = document.querySelector('.header-search input');
            if (searchInput) {
                searchInput.value = searchQuery;
                console.log('Setting search input value to:', searchQuery);
            } else {
                console.error('Search input element not found!');
            }
            filterAndSortProducts();
        } else {
            displayProducts();
        }
        updateProductCount();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

// Update product count in sidebar
function updateProductCount() {
    document.getElementById('productCount').textContent = filteredProducts.length;
}

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Filter and sort products
function filterAndSortProducts(selectedCategory = null) {
    // Show brief loading for better UX
    window.showLoadingProducts && showLoadingProducts();
    
    // Add small delay to show loading animation
    setTimeout(() => {
        const searchInput = document.querySelector('.header-search input');
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        console.log('Search input element:', searchInput);
        
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        // Get category from parameter or active sidebar link
        const category = selectedCategory || document.querySelector('.category-link.active')?.dataset.category || 'all';
        const minPrice = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
        const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
        const sortBy = document.getElementById('sort-by').value;
        
        console.log('Filtering with:', {
            searchQuery,
            category,
            minPrice,
            maxPrice,
            sortBy,
            totalProducts: products.length
        });
        
        if (products.length === 0) {
            console.error('No products available to filter!');
            return;
        }
        
        // First filter the products
        const normalizeCategory = (raw) => {
            const val = String(raw || '').toLowerCase();
            const includesAny = (list) => list.some(k => val.includes(k));
            if (includesAny(['paint', 'painting'])) return 'paints';
            if (includesAny(['power-tools','powertools','hand-tools','handtools','tool','tools','accessor'])) return 'tools-accessories';
            if (includesAny(['building-materials','aggregate','cement','sand','gravel','hollow','plywood','wood','lumber','tile','roof'])) return 'building-materials-aggregates';
            if (includesAny(['electrical','wire','breaker','outlet','switch'])) return 'electrical-supplies';
            if (includesAny(['plumbing','fixture','pipe','fitting','faucet','valve'])) return 'plumbing-fixtures';
            if (includesAny(['fastener','screw','nail','bolt','nut','consumable','adhesive','sealant','tape'])) return 'fasteners-consumables';
            switch (String(raw || '')) {
                case 'Power-Tools':
                case 'Hand-Tools':
                    return 'tools-accessories';
                case 'Building-Materials':
                    return 'building-materials-aggregates';
                case 'Plumbing':
                    return 'plumbing-fixtures';
                case 'Electrical':
                    return 'electrical-supplies';
                default:
                    return 'other';
            }
        };

        const normalizeRequested = (slug) => {
            switch (slug) {
                case 'all': return 'all';
                case 'power-tools':
                case 'hand-tools':
                    return 'tools-accessories';
                case 'building-materials':
                    return 'building-materials-aggregates';
                case 'plumbing':
                    return 'plumbing-fixtures';
                case 'electrical':
                    return 'electrical-supplies';
                default:
                    return slug || 'all';
            }
        };

        const requestedBucket = normalizeRequested(category);

        filteredProducts = products.filter(product => {
            const matchesSearch = !searchQuery || 
                (product.name && product.name.toLowerCase().includes(searchQuery));
            
            const productBucket = normalizeCategory(product.category);
            const categoryMatches = requestedBucket === 'all' ? true : (requestedBucket === productBucket);
            
            const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
            
            return matchesSearch && categoryMatches && matchesPrice;
        });
        
        console.log('Filtered products before sorting:', {
            total: filteredProducts.length,
            products: filteredProducts
        });
        
        // Then sort the filtered products
        switch(sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'all':
            default:
                // Keep original order
                break;
        }
        
        console.log('Filtered products after sorting:', {
            total: filteredProducts.length,
            products: filteredProducts
        });
        
        displayProducts(filteredProducts);
        updateProductCount();
    }, 500);
}

// Display products in the grid
function displayProducts(productsToDisplay = filteredProducts) {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const displayedProducts = productsToDisplay.slice(start, end);
    
    console.log('Displaying products:', {
        start,
        end,
        totalProducts: productsToDisplay.length,
        displayedProducts: displayedProducts.length,
        products: displayedProducts
    });
    
    // Add cart wiggle animation when products are first displayed
    if (displayedProducts.length > 0) {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn && !cartBtn.classList.contains('cart-wiggle')) {
            cartBtn.classList.add('cart-wiggle');
            setTimeout(() => {
                cartBtn.classList.remove('cart-wiggle');
            }, 600);
        }
    }
    
    // Add null checks for DOM elements
    const productGrid = document.getElementById('product-grid');
    const pagination = document.getElementById('pagination');
    
    if (!productGrid) {
        console.error('product-grid element not found');
        return;
    }
    
    if (!pagination) {
        console.error('pagination element not found');
        return;
    }

    if (displayedProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products-found">
                <img src="images/ruined-building-house-home-broken-house-svgrepo-com.svg" alt="No products found" class="no-products-icon">
                <h3>No Products Found</h3>
                <p>We couldn't find any products matching your criteria.</p>
                <button onclick="resetFilters()" class="reset-filters-btn">Reset Filters</button>
            </div>
        `;
        pagination.innerHTML = '';
        return;
    }

    const userLoggedIn = (typeof Auth !== 'undefined' && typeof Auth.isLoggedIn === 'function') ? Auth.isLoggedIn() : false;
    productGrid.innerHTML = displayedProducts.map(product => `
        <div class="product-card" data-stock-quantity="${product.stockQuantity}">
            <a href="product.html?id=${product._id}" class="product-link">
                <div class="product-img">
                    <img src="${product.image || 'images/sanrico_logo_1.png'}"
                         alt="${product.name}"
                         style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="product-img-overlay">
                        <span class="product-price">₱${product.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                </div>
            </a>
            
            <!-- Stock and dropdowns outside the product link -->
            <div class="product-details">
                <div class="product-stock">
                    <span class="stock-label">Stock:</span>
                    <span class="stock-amount">${product.stockQuantity}</span>
                </div>
                <div class="product-filters">
                    <select class="subcategory-dropdown">
                        <option value="">Subcategory</option>
                    </select>
                    <select class="brand-dropdown">
                        <option value="">Brand</option>
                    </select>
                </div>
            </div>
            
            <div class="drag-handle ${product.stockQuantity < 1 ? 'out-of-stock' : ''}" 
                 ${product.stockQuantity >= 1 && currentMode === 'drag' && userLoggedIn ? 'draggable="true"' : ''}
                 data-product-id="${product._id}"
                 data-product-name="${product.name}"
                 data-product-price="${product.price}"
                 data-product-image="${product.image || 'images/sanrico_logo_1.png'}"
                 data-stock-quantity="${product.stockQuantity}"
                 title="${product.stockQuantity < 1 ? 'Out of stock' : 'Drag to cart'}">
                ${product.stockQuantity < 1 ? '❌' : '🛒'}
            </div>
        </div>
    `).join('');

    // Add drag or login prompt handlers to drag handles
    document.querySelectorAll('.drag-handle').forEach(handle => {
        if (userLoggedIn) {
            // Allow drag
            handle.addEventListener('dragstart', handleDragStart);
            handle.addEventListener('dragend', handleDragEnd);
        } else {
            // Block drag and prompt login
            handle.removeAttribute('draggable');
            handle.addEventListener('dragstart', (e) => {
                e.preventDefault();
                showToast('Please log in to add items to your cart.');
                if (window.showLoginModal) window.showLoginModal();
                else { const lm = document.getElementById('loginModal'); if (lm) lm.classList.add('show'); }
            });
            handle.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Please log in to add items to your cart.');
                if (window.showLoginModal) window.showLoginModal();
                else { const lm = document.getElementById('loginModal'); if (lm) lm.classList.add('show'); }
            });
        }
    });

    // Add event listeners to product-level dropdowns
    document.querySelectorAll('.subcategory-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
            console.log('Product subcategory changed:', e.target.value);
            // TODO: Implement individual product subcategory filtering
        });
        
        // Prevent dropdown clicks from triggering product link
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        dropdown.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });

    document.querySelectorAll('.brand-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
            console.log('Product brand changed:', e.target.value);
            // TODO: Implement individual product brand filtering
        });
        
        // Prevent dropdown clicks from triggering product link
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        dropdown.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });

    // Drag and drop mode only - no click listeners needed

    if (window.initializeStockDisplay) {
        window.initializeStockDisplay();
    }

    updatePagination();
}

// Drag and drop handlers
function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify({
        id: e.target.dataset.productId,
        name: e.target.dataset.productName,
        price: parseFloat(e.target.dataset.productPrice),
        image: e.target.dataset.productImage,
        stockQuantity: parseInt(e.target.dataset.stockQuantity)
    }));
    
    // Add visual feedback
    e.target.classList.add('dragging');
    
    // Create drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = '0.7';
    dragImage.style.transform = 'rotate(5deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    
    // Remove the temporary element after a short delay
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 100);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => {
            currentPage = i;
            displayProducts();
        };
        pagination.appendChild(button);
    }
}

// Handle Google Sign In
function handleGoogleSignIn(response) {
    if (response.credential) {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        // Use Auth.login to properly handle the login
        const result = Auth.login({
            email: payload.email,
            fullName: payload.name,
            picture: payload.picture,
            isStaff: false
        });
        
        if (result.success) {
            // Update UI immediately
            updateTopLoginBtn();
            Auth.updateCartCount();
            
            // Close modal if it exists
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('show');
            }
            
            // Show success message
            showToast(`Welcome, ${payload.name}!`, 'success');
        } else {
            showToast('Login failed. Please try again.', 'error');
        }
    }
}

// Update top login button text and functionality
function updateTopLoginBtn() {
    const topLoginBtn = document.getElementById('topLoginBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!topLoginBtn) return;
    
    if (Auth.isLoggedIn()) {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.fullName) {
            topLoginBtn.textContent = currentUser.fullName;
            if (userDropdown) userDropdown.style.display = 'none';
        } else if (currentUser && currentUser.email && currentUser.email.endsWith('@gmail.com')) {
            const username = currentUser.email.split('@')[0];
            topLoginBtn.textContent = username;
            if (userDropdown) userDropdown.style.display = 'none';
        }
    } else {
        topLoginBtn.textContent = 'Login';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing shop page');
    // Update cart count and login state
    Auth.updateCartCount();
    updateTopLoginBtn();
    
    console.log('🔄 Calling loadProducts...');
    loadProducts();

    // Set up event listeners with null checks
    const sortByElement = document.getElementById('sort-by');
    if (sortByElement) {
        sortByElement.addEventListener('change', () => {
            currentPage = 1; // Reset to first page when sorting
            filterAndSortProducts();
        });
    }
    
    // Add clear filters button event listener
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            resetFilters();
        });
    }
    
    // Add search form submit event listener
    const searchForm = document.querySelector('.header-search');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent form submission
            currentPage = 1; // Reset to first page when searching
            filterAndSortProducts();
        });

        // Add Enter key event listener to search input
        const searchInput = searchForm.querySelector('input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    currentPage = 1; // Reset to first page when searching
                    filterAndSortProducts();
                }
            });
        }
    }

    // Add category filter event listener
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentPage = 1;
            filterAndSortProducts(this.dataset.category);
        });
    });

    // Add price filter event listener
    const priceFilter = document.querySelector('.price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', () => {
            currentPage = 1;
            filterAndSortProducts();
        });
    }

    // Price range filter - add null check
    const applyPriceRangeBtn = document.getElementById('applyPriceRange');
    if (applyPriceRangeBtn) {
        applyPriceRangeBtn.addEventListener('click', () => {
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        
        // Validate price range
        if (minPrice > maxPrice) {
            showToast('Minimum price cannot be greater than maximum price', 'error');
            return;
        }

        // If no explicit sort chosen, default to price ascending when applying a range
        const sortBy = document.getElementById('sort-by');
        if (sortBy && (sortBy.value === 'all' || sortBy.value === 'name')) {
            sortBy.value = 'price-low';
        }

        filterAndSortProducts();
            showToast('Price filter applied');
    });
    }

    // Allow Enter key to apply price range filter
    ['minPrice', 'maxPrice'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                document.getElementById('applyPriceRange').click();
            }
        });
        }
    });

    // Check for category parameter in URL and set appropriate category
    const urlCategory = getUrlParameter('category');
    let initialCategory = 'all';
    
    if (urlCategory) {
        const legacyToNew = {
            'power-tools': 'tools-accessories',
            'hand-tools': 'tools-accessories',
            'building-materials': 'building-materials-aggregates',
            'plumbing': 'plumbing-fixtures',
            'electrical': 'electrical-supplies'
        };
        const newValid = ['all','paints','tools-accessories','building-materials-aggregates','electrical-supplies','plumbing-fixtures','fasteners-consumables','other'];
        const mapped = legacyToNew[urlCategory] || urlCategory;
        if (newValid.includes(mapped)) initialCategory = mapped;
    }
    
    // Set the active category link based on URL parameter or default to 'all'
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.category-link[data-category="${initialCategory}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else {
        // Fallback to 'all' if the category link is not found
        document.querySelector('.category-link[data-category="all"]').classList.add('active');
        initialCategory = 'all';
    }
    
    window.currentSidebarCategory = initialCategory;
    filterAndSortProducts(initialCategory);

    // Setup mode toggle functionality
    setupModeToggle();
    
    // Product-level dropdowns will be handled individually per product
    
    // Multi-mode removed - drag and drop only
});

// Add reset filters function
function resetFilters() {
    // Reset all filter inputs
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'all';
    
    const minPrice = document.getElementById('minPrice');
    if (minPrice) minPrice.value = '';
    
    const maxPrice = document.getElementById('maxPrice');
    if (maxPrice) maxPrice.value = '';
    
    // Reset search input
    const searchInput = document.querySelector('.header-search input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset product-level dropdowns
    document.querySelectorAll('.subcategory-dropdown').forEach(dropdown => dropdown.value = '');
    document.querySelectorAll('.brand-dropdown').forEach(dropdown => dropdown.value = '');
    
    // Reset category selection
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.category-link[data-category="all"]').classList.add('active');
    window.currentSidebarCategory = 'all';
    
    // Reset filtered products to all products
    filteredProducts = [...products];
    
    // Update display
    currentPage = 1;
    displayProducts();
    updateProductCount();
    
    // Clear URL search parameters
    window.history.pushState({}, '', 'shop.html');
    
    // Show success message
    showToast('Filters have been reset');
}

// Add event listener for price range filter - only if element exists
const applyPriceRangeElement = document.getElementById('applyPriceRange');
if (applyPriceRangeElement) {
    applyPriceRangeElement.addEventListener('click', function(e) {
    e.preventDefault();
    filterAndSortProducts();
});
}

// Always use drag mode - no mode toggle needed
function setupModeToggle() {
    // Force drag mode always
    currentMode = 'drag';
    console.log('Shop set to drag mode only');
}

function switchMode(mode) {
    // Always use drag mode
    currentMode = 'drag';
    console.log('Mode locked to drag mode');
}

// Multi-mode click handler removed - drag and drop only

// Multi-mode actions removed - drag and drop only

// Multi-mode cart functions removed - drag and drop only