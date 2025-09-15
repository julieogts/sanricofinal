// Test POST request to webhook-test endpoint
const http = require('http');

const testData = JSON.stringify({
    to: 'sanricomercantileofficial@gmail.com',
    verificationCode: '1234',
    userName: 'Test User',
    type: 'verification'
});

const options = {
    hostname: 'localhost',
    port: 5678,
    path: '/webhook-test/send-verification-email',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
    }
};

console.log('🔍 Testing webhook-test endpoint...\n');
console.log(`📡 URL: http://localhost:5678/webhook-test/send-verification-email`);
console.log(`📤 Data: ${testData}\n`);

const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📊 Headers:`, res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log(`\n📄 Response Length: ${responseData.length}`);
        console.log(`📄 Response: "${responseData}"`);
        
        if (responseData.length === 0) {
            console.log('\n❌ Empty response body');
        } else {
            try {
                const parsed = JSON.parse(responseData);
                console.log('\n✅ Valid JSON response!');
                console.log('📧 Parsed:', parsed);
            } catch (e) {
                console.log('\n⚠️  Response received but not valid JSON');
                console.log('Raw response:', responseData.substring(0, 200));
            }
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.write(testData);
req.end();