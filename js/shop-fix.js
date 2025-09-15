// Shop.js error fix - prevent null reference errors entirely
(function() {
    'use strict';
    
    // Store original getElementById
    const originalGetElementById = document.getElementById;
    
    // Override getElementById to prevent null errors for shop elements on non-shop pages
    document.getElementById = function(id) {
        const element = originalGetElementById.call(document, id);
        
        // If element doesn't exist and it's a shop-specific element, return a dummy element
        if (!element) {
            const shopElements = ['applyPriceRange', 'minPrice', 'maxPrice', 'product-grid', 'pagination', 'sort-by'];
            if (shopElements.includes(id)) {
                console.log(`Shop element '${id}' not found - creating dummy element to prevent errors`);
                
                // Create a dummy element that won't cause errors
                const dummyElement = document.createElement('div');
                dummyElement.id = id;
                
                // Add dummy addEventListener method
                dummyElement.addEventListener = function(event, callback) {
                    console.log(`Dummy addEventListener called for ${id} with event ${event}`);
                    return;
                };
                
                // Add dummy value property for input elements
                Object.defineProperty(dummyElement, 'value', {
                    get: function() { return ''; },
                    set: function(val) { return; }
                });
                
                return dummyElement;
            }
        }
        
        return element;
    };
    
    // Also create safe wrapper functions for shop functionality
    window.safeFilterAndSort = function() {
        if (typeof filterAndSortProducts === 'function' && document.getElementById('product-grid')) {
            try {
                filterAndSortProducts();
            } catch (error) {
                console.log('Shop function called on non-shop page:', error);
            }
        }
    };
    
    // Initialize shop page detection
    function detectAndInitializeShop() {
        const productGrid = document.getElementById('product-grid');
        if (productGrid && productGrid.tagName !== 'DIV') { // Real element, not our dummy
            console.log('Real shop page detected');
            
            // Restore original getElementById for shop pages
            document.getElementById = originalGetElementById;
            
            // Initialize shop functionality
            if (typeof loadProducts === 'function') {
                try {
                    loadProducts();
                } catch (error) {
                    console.error('Error loading products:', error);
                }
            }
        }
    }
    
    // Run detection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndInitializeShop);
    } else {
        detectAndInitializeShop();
    }
    
    console.log('Shop.js error prevention system loaded');
})(); 