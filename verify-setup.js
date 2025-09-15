// 🧪 Authentication Setup Verification Tool

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING AUTHENTICATION SETUP...\n');

// 1. Check environment file
console.log('1️⃣ Environment Configuration:');
const envExists = fs.existsSync('.env');
const authEnvExists = fs.existsSync('auth.env');

if (envExists) {
    console.log('   ✅ .env file exists');
} else if (authEnvExists) {
    console.log('   ⚠️  auth.env exists but should be renamed to .env');
} else {
    console.log('   ❌ No environment file found');
}

// 2. Check required files
console.log('\n2️⃣ Authentication Files:');
const requiredFiles = [
    'simple-auth-setup.js',
    'js/simple-auth-client.js', 
    'js/simple-login-handlers.js',
    'css/verification-dialog.css'
];

requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 3. Check HTML integration
console.log('\n3️⃣ HTML Integration:');
const htmlFiles = ['index.html', 'shop.html', 'product.html', 'cart.html'];

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasSimpleAuth = content.includes('simple-auth-client.js');
        const hasHandlers = content.includes('simple-login-handlers.js');
        const hasVerificationCSS = content.includes('verification-dialog.css');
        
        console.log(`   ${hasSimpleAuth && hasHandlers && hasVerificationCSS ? '✅' : '❌'} ${file}`);
        if (!hasSimpleAuth) console.log(`      - Missing simple-auth-client.js`);
        if (!hasHandlers) console.log(`      - Missing simple-login-handlers.js`);
        if (!hasVerificationCSS) console.log(`      - Missing verification-dialog.css`);
    }
});

// 4. Check MongoDB configuration
console.log('\n4️⃣ Database Configuration:');
if (authEnvExists) {
    const envContent = fs.readFileSync('auth.env', 'utf8');
    const mongoUri = envContent.match(/MONGODB_URI=(.+)/)?.[1];
    const dbName = envContent.match(/DATABASE_NAME=(.+)/)?.[1];
    
    if (mongoUri) {
        console.log(`   ✅ MongoDB URI configured`);
        if (mongoUri.includes('MyProductsDb')) {
            console.log(`   ✅ Database name in URI: MyProductsDb`);
        } else {
            console.log(`   ⚠️  Database name not in URI (should end with /MyProductsDb)`);
        }
    }
    
    if (dbName) {
        console.log(`   ✅ Database name: ${dbName}`);
    }
}

// 5. Check collection usage
console.log('\n5️⃣ UserCredentials Collection:');
if (fs.existsSync('simple-auth-setup.js')) {
    const authCode = fs.readFileSync('simple-auth-setup.js', 'utf8');
    const collections = [...authCode.matchAll(/collection\('([^']+)'\)/g)];
    const uniqueCollections = [...new Set(collections.map(match => match[1]))];
    
    if (uniqueCollections.length === 1 && uniqueCollections[0] === 'UserCredentials') {
        console.log('   ✅ All operations use UserCredentials collection');
    } else {
        console.log('   ❌ Multiple or incorrect collections found:', uniqueCollections);
    }
}

// 6. Final recommendations
console.log('\n📋 SETUP CHECKLIST:');
console.log('   □ Rename auth.env to .env');
console.log('   □ Run: npm install');
console.log('   □ Set up n8n email workflow');
console.log('   □ Test: npm run simple-auth');

console.log('\n🎯 Your UserCredentials collection will store:');
console.log('   • email (string)');
console.log('   • password (hashed string)');
console.log('   • fullName (string)');
console.log('   • isStaff (boolean)');
console.log('   • emailVerified (boolean)');
console.log('   • createdAt (date)');
console.log('   • verificationCode (temporary)');
console.log('   • verificationExpires (temporary)');

console.log('\n🚀 Ready to start authentication server!');