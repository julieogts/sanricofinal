// 🧪 Test n8n Email Integration

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function testEmailIntegration() {
    console.log('🧪 Testing n8n Email Integration...\n');
    
    const testData = {
        to: 'sanricomercantileofficial@gmail.com', // Test with your own email
        from: 'sanricomercantileofficial@gmail.com',
        subject: 'Test Email - Sanrico Mercantile',
        verificationCode: '1234',
        userName: 'Test User',
        type: 'verification'
    };
    
    try {
        console.log('📧 Sending test verification email...');
        
        const response = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Success! Email sent successfully');
            console.log('📧 Check your inbox for the verification email');
            console.log('🎯 Response:', result);
        } else {
            console.log('❌ Failed to send email');
            console.log('📄 Status:', response.status);
            console.log('📄 Response:', await response.text());
        }
        
    } catch (error) {
        console.error('❌ Error testing email integration:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure n8n is running on port 5678');
        console.log('   2. Check that the workflow is activated');
        console.log('   3. Verify Gmail OAuth2 credentials are set up');
        console.log('   4. Ensure the webhook URL is correct');
    }
}

// Run the test
testEmailIntegration();