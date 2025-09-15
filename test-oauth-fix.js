// 🧪 Test OAuth Fix for Gmail Integration

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function testOAuthFix() {
    console.log('🧪 Testing OAuth Fix...\n');
    
    // Test data for verification email
    const testData = {
        to: 'sanricomercantileofficial@gmail.com',
        from: 'sanricomercantileofficial@gmail.com',
        verificationCode: '9876',
        userName: 'Test User',
        type: 'verification'
    };
    
    console.log('📧 Sending test verification email...');
    console.log(`📨 To: ${testData.to}`);
    console.log(`🔢 Code: ${testData.verificationCode}`);
    console.log(`👤 User: ${testData.userName}\n`);
    
    try {
        const response = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ SUCCESS! OAuth is working!');
            console.log('📧 Check your email for a beautiful verification email');
            console.log('🎯 Response:', result);
            console.log('\n🎉 Your n8n email integration is ready!');
            console.log('🚀 You can now test the complete registration flow');
        } else {
            const errorText = await response.text();
            console.log('❌ Still having issues...');
            console.log('📄 Status:', response.status);
            console.log('📄 Error:', errorText);
            console.log('\n🔧 Double-check:');
            console.log('   1. OAuth consent screen configured');
            console.log('   2. Test user added: sanricomercantileofficial@gmail.com');
            console.log('   3. Gmail OAuth2 credential connected in n8n');
            console.log('   4. Workflow is Active');
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.log('\n🔧 Check:');
        console.log('   1. n8n is running on port 5678');
        console.log('   2. Workflow is imported and active');
        console.log('   3. Internet connection is working');
    }
}

// Run the test
console.log('🎯 OAuth Fix Test for Sanrico Mercantile Email System');
console.log('=' .repeat(50));
testOAuthFix();