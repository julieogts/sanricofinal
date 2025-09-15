// Authentication Configuration
// Create a .env file in your project root with these variables:

/*
BETTER_AUTH_SECRET=your_32_character_secret_key_here_123456789
BETTER_AUTH_URL=http://localhost:3000
SENDER_EMAIL=sanricomercantileofficial@gmail.com
N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-verification-email
DATABASE_URL=./database.db
*/

module.exports = {
    // Better Auth Configuration
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'your_32_character_secret_key_here_123456789',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    
    // Email Configuration for n8n
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'sanricomercantileofficial@gmail.com',
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-verification-email',
    
    // Database Configuration
    DATABASE_URL: process.env.DATABASE_URL || './database.db'
}; 