// Pre-shop fix - Load before shop.js to prevent errors
(function() {
    'use strict';
    
    console.log('Pre-shop error prevention loaded');
    
    // Create dummy elements for shop functionality if they don't exist
    function createDummyShopElements() {
        const shopElementIds = ['applyPriceRange', 'minPrice', 'maxPrice', 'product-grid', 'pagination', 'sort-by', 'productCount'];
        
        shopElementIds.forEach(id => {
            if (!document.getElementById(id)) {
                const dummy = document.createElement('div');
                dummy.id = id;
                dummy.style.display = 'none';
                
                // Add dummy methods and properties
                dummy.addEventListener = function() { return; };
                dummy.value = '';
                dummy.textContent = '';
                dummy.innerHTML = '';
                
                // Append to body temporarily (hidden)
                document.body.appendChild(dummy);
                
                console.log(`Created dummy element: ${id}`);
            }
        });
    }
    
    // Create dummy elements immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDummyShopElements);
    } else {
        createDummyShopElements();
    }
    
    // Also create them right away in case shop.js loads immediately
    createDummyShopElements();
    
})(); 