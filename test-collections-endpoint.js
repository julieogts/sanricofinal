// Test script to check the collections endpoint
async function testCollectionsEndpoint() {
    try {
        console.log('🧪 Testing collections endpoint...');
        
        const response = await fetch('http://localhost:3000/api/orders/all-staff');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orders = await response.json();
        
        console.log('📊 Total orders returned:', orders.length);
        
        const breakdown = {
            pending: orders.filter(o => o.collection === 'pending').length,
            accepted: orders.filter(o => o.collection === 'accepted').length,
            delivered: orders.filter(o => o.collection === 'delivered').length
        };
        
        console.log('📋 Collection breakdown:', breakdown);
        
        // Show sample orders from each collection
        ['pending', 'accepted', 'delivered'].forEach(collection => {
            const collectionOrders = orders.filter(o => o.collection === collection);
            console.log(`\n📝 ${collection.toUpperCase()} orders (${collectionOrders.length}):`);
            
            collectionOrders.slice(0, 3).forEach(order => {
                console.log(`  - ID: ${order._id}${order.orderNumber ? ` (${order.orderNumber})` : ''}`);
                console.log(`    Status: ${order.status}, Display: ${order.displayStatus}`);
                console.log(`    Collection: ${order.collection}`);
                console.log(`    Customer: ${order.fullName || order.buyerinfo || 'N/A'}`);
                console.log('');
            });
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testCollectionsEndpoint();
} else {
    // Browser environment
    testCollectionsEndpoint();
} 