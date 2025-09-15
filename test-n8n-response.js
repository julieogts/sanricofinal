// 🧪 Test n8n Response Body Content

// Use built-in fetch in Node.js 18+ or require node-fetch for older versions
const fetch = globalThis.fetch || require('node-fetch');

async function testN8nResponse() {
    console.log('🧪 Testing n8n Response Body Content\n');
    
    const testData = {
        to: 'sanricomercantileofficial@gmail.com',
        verificationCode: '8888',
        userName: 'Response Test',
        type: 'verification'
    };
    
    try {
        console.log('📧 Sending test email to check response...');
        
        const response = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        
        // Get the raw response text
        const rawText = await response.text();
        console.log('📄 Raw Response Length:', rawText.length);
        console.log('📄 Raw Response Content:');
        console.log('---START---');
        console.log(rawText);
        console.log('---END---');
        
        if (rawText.length === 0) {
            console.log('\n❌ ISSUE FOUND: Response body is completely empty!');
            console.log('🔧 Fix: Check the "Success Response" node in your n8n workflow');
            console.log('   → Make sure it has a response body configured');
            console.log('   → Example: {"success": true, "message": "Email sent"}');
        } else if (rawText.trim() === '') {
            console.log('\n❌ ISSUE FOUND: Response body contains only whitespace!');
            console.log('🔧 Fix: Add proper JSON content to response node');
        } else {
            try {
                const parsed = JSON.parse(rawText);
                console.log('\n✅ SUCCESS: Valid JSON response received!');
                console.log('📧 Parsed JSON:', parsed);
            } catch (parseError) {
                console.log('\n❌ ISSUE FOUND: Response is not valid JSON!');
                console.log('🔧 Parse Error:', parseError.message);
                console.log('🔧 Fix: Ensure response node returns valid JSON format');
            }
        }
        
    } catch (error) {
        console.log('❌ Request failed:', error.message);
    }
}

console.log('🎯 n8n Response Body Analysis');
console.log('=' .repeat(40));
testN8nResponse();