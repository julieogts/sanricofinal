const fetch = require('node-fetch');

async function testEndpoint() {
    try {
        console.log('Testing /api/orders/all-staff endpoint...');
        
        const response = await fetch('http://localhost:3000/api/orders/all-staff');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());
        
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        // Test breakdown
        if (Array.isArray(data)) {
            const breakdown = {
                total: data.length,
                pending: data.filter(o => o.collection === 'pending').length,
                accepted: data.filter(o => o.collection === 'accepted').length,
                delivered: data.filter(o => o.collection === 'delivered').length
            };
            console.log('Breakdown:', breakdown);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEndpoint(); 