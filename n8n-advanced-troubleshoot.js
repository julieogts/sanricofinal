// 🔍 Advanced n8n Troubleshooting Script

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function advancedTroubleshoot() {
    console.log('🔍 Advanced n8n Troubleshooting\n');
    console.log('=' .repeat(50));
    
    // Test 1: Check if n8n is running
    console.log('\n📡 Test 1: Basic n8n Connection');
    try {
        const healthCheck = await fetch('http://localhost:5678/healthz');
        console.log('✅ n8n is running on port 5678');
        console.log('📊 Health status:', healthCheck.status);
    } catch (error) {
        console.log('❌ n8n not responding on port 5678');
        console.log('🔧 Fix: Start n8n with: npx n8n');
        return;
    }
    
    // Test 2: Check webhook endpoint
    console.log('\n🪝 Test 2: Webhook Endpoint Check');
    try {
        const webhookResponse = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'GET'
        });
        console.log('📊 Webhook status:', webhookResponse.status);
        
        if (webhookResponse.status === 404) {
            console.log('❌ Webhook not found - workflow not active or path wrong');
        } else if (webhookResponse.status === 405) {
            console.log('✅ Webhook exists but needs POST method (this is correct)');
        } else {
            console.log('✅ Webhook responding');
        }
    } catch (error) {
        console.log('❌ Webhook endpoint error:', error.message);
    }
    
    // Test 3: Send actual test email
    console.log('\n📧 Test 3: Email Sending Test');
    const testData = {
        to: 'sanricomercantileofficial@gmail.com',
        verificationCode: '9999',
        userName: 'Troubleshoot Test',
        type: 'verification'
    };
    
    try {
        const emailResponse = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Email response status:', emailResponse.status);
        console.log('📊 Response headers:', Object.fromEntries(emailResponse.headers.entries()));
        
        // Check content type
        const contentType = emailResponse.headers.get('content-type');
        console.log('📊 Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
            const result = await emailResponse.json();
            console.log('✅ Success! JSON response received');
            console.log('📧 Result:', result);
        } else {
            const text = await emailResponse.text();
            console.log('⚠️  Non-JSON response received');
            console.log('📄 Response type:', contentType);
            console.log('📄 Response body (first 500 chars):', text.substring(0, 500));
            
            if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
                console.log('❌ Getting HTML instead of JSON - workflow configuration issue');
            }
        }
        
    } catch (error) {
        console.log('❌ Email test failed:', error.message);
        
        if (error.message.includes('Unexpected end of JSON input')) {
            console.log('🔧 JSON Parse Error Detected!');
            console.log('   This usually means:');
            console.log('   1. n8n workflow returning HTML instead of JSON');
            console.log('   2. Workflow has errors and returning error page');
            console.log('   3. Response is empty or malformed');
        }
    }
    
    // Test 4: Check for common n8n workflow issues
    console.log('\n🛠️  Test 4: Common Issues Check');
    console.log('📋 Please manually verify in n8n:');
    console.log('   ✅ Workflow is ACTIVE (toggle switch ON)');
    console.log('   ✅ Both Gmail nodes have "Sanrico Gmail OAuth2" credential');
    console.log('   ✅ Webhook path is: send-verification-email');
    console.log('   ✅ Webhook method is: POST');
    console.log('   ✅ "Success Response" node is connected');
    console.log('   ✅ No red error triangles on any nodes');
    
    console.log('\n🎯 Possible Solutions:');
    console.log('   1. Check workflow execution history in n8n');
    console.log('   2. Verify "Success Response" node returns JSON');
    console.log('   3. Test workflow manually in n8n editor');
    console.log('   4. Check Gmail OAuth connection status');
    console.log('   5. Restart n8n if needed');
}

advancedTroubleshoot();