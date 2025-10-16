// Test script to debug verification code issue
const fetch = require('node-fetch');

async function testVerification() {
    const baseURL = 'http://localhost:3001';
    
    try {
        console.log('🧪 Testing verification code flow...');
        
        // Step 1: Create a verification code
        console.log('\n1. Creating verification code...');
        const createResponse = await fetch(`${baseURL}/api/auth/create-verification-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                userName: 'Test User'
            })
        });
        
        if (!createResponse.ok) {
            const error = await createResponse.text();
            console.log('❌ Failed to create verification code:', error);
            return;
        }
        
        const createResult = await createResponse.json();
        console.log('✅ Verification code created:', createResult);
        
        // Step 2: Verify the code
        console.log('\n2. Verifying the code...');
        const verifyResponse = await fetch(`${baseURL}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                code: createResult.verificationCode.toString()
            })
        });
        
        console.log('Response status:', verifyResponse.status);
        console.log('Response headers:', Object.fromEntries(verifyResponse.headers.entries()));
        
        const verifyResult = await verifyResponse.text();
        console.log('Response body:', verifyResult);
        
        if (verifyResponse.ok) {
            console.log('✅ Verification successful!');
        } else {
            console.log('❌ Verification failed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testVerification();
