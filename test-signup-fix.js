// Test the signup fix
const http = require('http');

console.log('🔧 Testing Signup Fix\n');

async function testSignupEndpoint() {
    console.log('📡 Testing send-verification endpoint for registration...');
    
    const testData = JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        fullName: 'Test User',
        type: 'registration'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/send-verification',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(testData)
        }
    };

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            console.log(`📊 Status: ${res.statusCode}`);
            console.log(`📊 Content-Type: ${res.headers['content-type']}`);
            
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`📄 Response Length: ${responseData.length}`);
                
                if (responseData.length > 0) {
                    try {
                        const parsed = JSON.parse(responseData);
                        console.log('✅ Valid JSON response received!');
                        console.log('📧 Response:', parsed);
                        
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            console.log('✅ Registration endpoint working correctly!');
                        } else if (res.statusCode === 400) {
                            console.log('⚠️  Expected 400 for duplicate/invalid data');
                        }
                    } catch (parseError) {
                        console.log('❌ JSON Parse Error:', parseError.message);
                        console.log('Raw response:', responseData);
                    }
                } else {
                    console.log('❌ Empty response received');
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log('❌ Connection error:', error.message);
            resolve();
        });

        req.write(testData);
        req.end();
    });
}

testSignupEndpoint();