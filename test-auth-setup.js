const config = require('./auth-config');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Better Auth Setup...\n');

// Test 1: Configuration
console.log('1️⃣ Checking configuration...');
console.log(`   ✅ Secret: ${config.BETTER_AUTH_SECRET ? 'Set' : '❌ Missing'}`);
console.log(`   ✅ Base URL: ${config.BETTER_AUTH_URL}`);
console.log(`   ✅ Sender Email: ${config.SENDER_EMAIL}`);
console.log(`   ✅ n8n Webhook: ${config.N8N_WEBHOOK_URL}`);
console.log(`   ✅ Database: ${config.DATABASE_URL}\n`);

// Test 2: Required files
console.log('2️⃣ Checking required files...');
const requiredFiles = [
    'lib/auth.js',
    'js/auth-client.js',
    'css/verification-dialog.css',
    'server-auth.js',
    'n8n-workflow-config.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

// Test 3: HTML files updated
console.log('\n3️⃣ Checking HTML files...');
const htmlFiles = ['index.html', 'shop.html', 'product.html', 'aboutus.html', 'cart.html', 'checkout.html', 'faq.html', 'profile.html'];

htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasAuthClient = content.includes('auth-client.js');
        const hasVerificationCSS = content.includes('verification-dialog.css');
        console.log(`   ${hasAuthClient && hasVerificationCSS ? '✅' : '❌'} ${file} - Auth scripts ${hasAuthClient ? '✅' : '❌'} | CSS ${hasVerificationCSS ? '✅' : '❌'}`);
    }
});

// Test 4: Package.json
console.log('\n4️⃣ Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasBetterAuth = packageJson.dependencies['better-auth'];
const hasSqlite = packageJson.dependencies['better-sqlite3'];
const hasAuthScript = packageJson.scripts['auth-server'];

console.log(`   ${hasBetterAuth ? '✅' : '❌'} better-auth dependency`);
console.log(`   ${hasSqlite ? '✅' : '❌'} better-sqlite3 dependency`);
console.log(`   ${hasAuthScript ? '✅' : '❌'} auth-server script`);

// Test 5: Environment setup
console.log('\n5️⃣ Environment setup...');
const envExists = fs.existsSync('.env');
console.log(`   ${envExists ? '✅' : '❌'} .env file exists`);
if (!envExists) {
    console.log('   📝 Please create a .env file with the following content:');
    console.log(`
BETTER_AUTH_SECRET=your_32_character_secret_key_here_123456789
BETTER_AUTH_URL=http://localhost:3000
SENDER_EMAIL=sanricomercantileofficial@gmail.com
N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-verification-email
DATABASE_URL=./database.db`);
}

// Final summary
console.log('\n📊 Setup Summary:');
if (allFilesExist && hasBetterAuth && hasSqlite && hasAuthScript) {
    console.log('🎉 ✅ Setup appears to be complete!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Create your .env file (see above)');
    console.log('   2. Set up n8n email workflow');
    console.log('   3. Run: npm install');
    console.log('   4. Run: npm run auth-server');
} else {
    console.log('❌ Setup is incomplete. Please review the checklist above.');
}

console.log('\n📚 For detailed setup instructions, see: BETTER-AUTH-SETUP.md');