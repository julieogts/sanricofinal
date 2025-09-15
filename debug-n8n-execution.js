// 🔍 Advanced n8n Execution Debugging

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function debugN8nExecution() {
    console.log('🔍 Advanced n8n Execution Debugging\n');
    console.log('=' .repeat(50));
    
    // Test different webhook paths to find the right one
    const webhookPaths = [
        'send-verification-email',
        'webhook/send-verification-email', 
        'webhook-test/send-verification-email',
        'webhook/email-verification',
        'send-email',
        'verification-email'
    ];
    
    const testData = {
        to: 'sanricomercantileofficial@gmail.com',
        verificationCode: '7777',
        userName: 'Debug Test',
        type: 'verification'
    };
    
    console.log('\n🎯 Testing Different Webhook Paths...\n');
    
    for (const path of webhookPaths) {
        const url = `http://localhost:5678/webhook/${path}`;
        console.log(`📡 Testing: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            const responseText = await response.text();
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            console.log(`   Body Length: ${responseText.length}`);
            
            if (response.status === 200 && responseText.length > 0) {
                console.log(`   ✅ SUCCESS! Response: ${responseText.substring(0, 100)}...`);
                try {
                    const parsed = JSON.parse(responseText);
                    console.log(`   ✅ VALID JSON! Parsed:`, parsed);
                    console.log(`\n🎉 FOUND WORKING WEBHOOK: ${url}`);
                    return url;
                } catch (e) {
                    console.log(`   ⚠️  Not JSON: ${responseText.substring(0, 50)}...`);
                }
            } else if (response.status === 404) {
                console.log(`   ❌ Not found`);
            } else if (response.status === 405) {
                console.log(`   ⚠️  Method not allowed (webhook exists but wrong method)`);
            } else {
                console.log(`   ❌ Error: ${responseText.substring(0, 50)}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Connection failed: ${error.message}`);
        }
        
        console.log(''); // Empty line
    }
    
    console.log('\n🔧 Debugging Steps:');
    console.log('1. Check n8n workflow execution history');
    console.log('2. Verify webhook node "HTTP Method" is POST');
    console.log('3. Check webhook node "Path" setting');
    console.log('4. Ensure workflow is ACTIVE (toggle switch)');
    console.log('5. Test workflow manually in n8n editor');
    
    console.log('\n📋 Next Steps:');
    console.log('• Go to n8n → Executions (left sidebar)');
    console.log('• Check if workflow runs show up when you test');
    console.log('• Look for any red error indicators');
    console.log('• Check webhook node configuration');
}

debugN8nExecution();