// 🧪 Basic n8n Connection Test

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function testN8nBasic() {
    console.log('🧪 Testing Basic n8n Connection...\n');
    
    try {
        console.log('🔗 Checking if n8n is running...');
        
        const response = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: true })
        });
        
        console.log('📊 Response Status:', response.status);
        
        if (response.status === 404) {
            console.log('❌ Webhook not found - workflow might not be imported/active');
            console.log('🔧 Fix: Import n8n-email-workflow.json and activate it');
        } else if (response.status === 500) {
            console.log('⚠️  n8n is running but workflow has errors');
            console.log('🔧 Fix: Add Gmail credentials to the workflow nodes');
        } else {
            console.log('✅ n8n is responding!');
            const text = await response.text();
            console.log('📄 Response:', text.substring(0, 200) + '...');
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to n8n');
            console.log('🔧 Fix: Start n8n with: npm install -g n8n && n8n start');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

console.log('🎯 Basic n8n Connection Test');
console.log('=' .repeat(40));
testN8nBasic();