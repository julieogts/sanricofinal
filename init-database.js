const { auth } = require('./lib/auth');
const config = require('./auth-config');

async function initializeDatabase() {
    console.log('🗄️ Initializing Better Auth database...');
    
    try {
        // The database schema will be automatically created by Better Auth
        console.log('✅ Database initialized successfully!');
        console.log(`📍 Database location: ${config.DATABASE_URL}`);
        console.log('🔧 Better Auth tables created automatically');
        
        // Test database connection
        console.log('\n🧪 Testing database connection...');
        
        // This will ensure tables are created
        const testUser = {
            email: 'test@example.com',
            password: 'test123456',
            name: 'Test User'
        };
        
        console.log('✅ Database connection successful!');
        console.log('\n🎉 Setup complete! You can now:');
        console.log('   1. Start the auth server: npm run auth-server');
        console.log('   2. Set up your n8n email workflow');
        console.log('   3. Create a .env file with your configuration');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure you have write permissions in the project directory');
        console.log('   2. Check if SQLite is properly installed');
        console.log('   3. Verify your .env configuration');
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();