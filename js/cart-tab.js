document.addEventListener('DOMContentLoaded', () => {
    const cartTabButton = document.getElementById('cartTabButton');
    const cartTabContent = document.getElementById('cartTabContent');
    const closeButton = document.querySelector('.close-cart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cartCount');
    const subtotalElement = document.getElementById('cartSubtotal');
    const checkoutButton = document.getElementById('checkoutBtn');
    const cartTooltipElement = document.getElementById('cartTooltip');

    function getCartKey() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return `cart_${currentUser ? currentUser.id : 'guest'}`;
    }

    // Toggle cart tab (open/close)
    cartTabButton.addEventListener('click', () => {
        if (cartTabContent.classList.contains('open')) {
            cartTabContent.classList.remove('open');
            cartTabButton.classList.remove('cart-open');
        } else {
            cartTabContent.classList.add('open');
            cartTabButton.classList.add('cart-open');
        }
    });

    // Close cart tab
    closeButton.addEventListener('click', () => {
        cartTabContent.classList.remove('open');
        cartTabButton.classList.remove('cart-open');
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartTabContent.contains(e.target) && !cartTabButton.contains(e.target)) {
            cartTabContent.classList.remove('open');
            cartTabButton.classList.remove('cart-open');
        }
    });

    // Prevent closing when clicking inside the cart tab
    cartTabContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Drag and drop functionality for cart tab
    function setupDragAndDrop() {
        // Make cart tab button a drop zone
        cartTabButton.addEventListener('dragover', handleDragOver);
        cartTabButton.addEventListener('drop', handleDrop);
        cartTabButton.addEventListener('dragenter', handleDragEnter);
        cartTabButton.addEventListener('dragleave', handleDragLeave);

        // Make cart content a drop zone when open
        cartTabContent.addEventListener('dragover', handleDragOver);
        cartTabContent.addEventListener('drop', handleDrop);
        cartTabContent.addEventListener('dragenter', handleDragEnter);
        cartTabContent.addEventListener('dragleave', handleDragLeave);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        // Only remove class if we're leaving the element entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        try {
            const productData = JSON.parse(e.dataTransfer.getData('text/plain'));
            
            // Check if product is in stock before adding to cart
            if (productData.stockQuantity !== undefined && productData.stockQuantity < 1) {
                if (window.showToast) {
                    window.showToast('This item is out of stock and cannot be added to cart.', 'error');
                } else {
                    alert('This item is out of stock and cannot be added to cart.');
                }
                return;
            }
            
            // Open cart tab if it's not already open
            if (!cartTabContent.classList.contains('open')) {
                cartTabContent.classList.add('open');
                cartTabButton.classList.add('cart-open');
            }
            
            // Add product to cart
            addToCart(productData);
            
            // Show success feedback
            showDropFeedback();
            
        } catch (error) {
            console.error('Error parsing dropped data:', error);
        }
    }

    function addToCart(productData) {
        const cartKey = getCartKey();
        const cartData = JSON.parse(localStorage.getItem(cartKey) || '{}');
        const cart = cartData.items || [];
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.id === productData.id);
        
        if (existingItemIndex > -1) {
            // Increment quantity
            cart[existingItemIndex].quantity++;
        } else {
            // Add new item
            cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1
            });
        }
        
        cartData.items = cart;
        localStorage.setItem(cartKey, JSON.stringify(cartData));
        
        // Dispatch cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cartData }
        }));
        
        updateCartDisplay();
        
        // Show toast notification
        if (window.showToast) {
            window.showToast(`${productData.name} added to cart!`, 'success');
        }
    }

    function showDropFeedback() {
        // Add visual feedback for successful drop
        const feedback = document.createElement('div');
        feedback.className = 'drop-feedback';
        feedback.innerHTML = '<i class="fa fa-check"></i> Added to cart!';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10000;
            animation: dropFeedback 0.5s ease-in-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }

    // Initialize drag and drop
    setupDragAndDrop();

    function updateCartDisplay() {
        const cartKey = getCartKey();
        const cartData = JSON.parse(localStorage.getItem(cartKey) || '{}');
        const cart = cartData.items || [];
        let subtotal = 0;

        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }

        // Update cart tooltip
        if (cartTooltipElement) {
            cartTooltipElement.textContent = `₱${subtotal.toFixed(2)}`;
        }

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <img src="images/cart-empty.png" alt="Empty Cart">
                    <div>Your cart is empty</div>
                </div>
            `;
            if (subtotalElement) {
                subtotalElement.textContent = `₱0.00`;
            }
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            let imageSrc = item.image || 'sanrico_logo_1.png';
            if (
                imageSrc &&
                !imageSrc.startsWith('http') &&
                !imageSrc.startsWith('data:') &&
                !imageSrc.startsWith('images/')
            ) {
                imageSrc = 'images/' + imageSrc;
            }
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${imageSrc}" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-main-row">
                            <div class="cart-item-title">${item.name}</div>
                            <button class="cart-item-remove" title="Remove from cart" aria-label="Remove from cart">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                        <div class="cart-item-info-row">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease" aria-label="Decrease quantity">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase" aria-label="Increase quantity">+</button>
                            </div>
                            <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (subtotalElement) {
            subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
        }

        // Add event listeners for quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                const isIncrease = e.target.classList.contains('increase');
                
                const cartKey = getCartKey();
                const cartData = JSON.parse(localStorage.getItem(cartKey) || '{}');
                const cart = cartData.items || [];
                const itemIndex = cart.findIndex(item => item.id === itemId);
                
                if (itemIndex > -1) {
                    // Check stock before updating
                    try {
                        const response = await fetch(`http://localhost:3000/api/products/${itemId}`);
                        const product = await response.json();
                        // Use stockQuantity if available, otherwise fallback to stock
                        const availableStock = (product.stockQuantity !== undefined) ? product.stockQuantity : (product.stock || 0);
                        
                        if (isIncrease && cart[itemIndex].quantity >= availableStock) {
                            if (typeof showToast === 'function') {
                                showToast('Sorry, this item is out of stock!');
                            } else {
                            alert('Sorry, this item is out of stock!');
                            }
                            return;
                        }
                        
                        if (isIncrease) {
                            cart[itemIndex].quantity++;
                        } else {
                            cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity - 1);
                        }
                        cartData.items = cart;
                        localStorage.setItem(cartKey, JSON.stringify(cartData));
                        
                        // Dispatch cart update event
                        window.dispatchEvent(new CustomEvent('cartUpdated', {
                            detail: { cartData }
                        }));
                        
                        updateCartDisplay();
                    } catch (error) {
                        console.error('Error checking stock:', error);
                        alert('Error updating cart. Please try again.');
                    }
                }
            });
        });

        // Add event listeners for remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                
                const cartKey = getCartKey();
                const cartData = JSON.parse(localStorage.getItem(cartKey) || '{}');
                let cart = cartData.items || [];
                cart = cart.filter(item => item.id !== itemId);
                cartData.items = cart;
                localStorage.setItem(cartKey, JSON.stringify(cartData));
                
                // Dispatch cart update event
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cartData }
                }));
                
                updateCartDisplay();
            });
        });
    }

    // Update cart display initially
    updateCartDisplay();

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', (event) => {
        if (event.detail && event.detail.cartData) {
            const cartKey = getCartKey();
            localStorage.setItem(cartKey, JSON.stringify(event.detail.cartData));
        }
        updateCartDisplay();
    });

    // Update cart display when storage changes (from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('cart_')) {
            updateCartDisplay();
        }
    });

    // Also listen for any localStorage changes in the same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key.startsWith('cart_')) {
            setTimeout(updateCartDisplay, 100); // Small delay to ensure data is saved
        }
    };

    // Clear Cart button click handler
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
        const cartKey = getCartKey();
        localStorage.setItem(cartKey, JSON.stringify({ items: [] }));
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cartData: { items: [] } }
        }));
        if (typeof showToast === 'function') {
            showToast('Cart cleared!');
        }
    });

    // Go to Cart button click handler
    document.getElementById('goToCartBtn')?.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}); 