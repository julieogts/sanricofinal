// Simple script to view all registered users in UserCredentials collection
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function viewUsers() {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanrico-mercantile');
    
    try {
        await client.connect();
        console.log('📊 Connected to MongoDB');
        
        const db = client.db();
        const users = await db.collection('UserCredentials').find({}).toArray();
        
        console.log('\n🗃️  UserCredentials Collection:');
        console.log('====================================');
        
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach((user, index) => {
                console.log(`\n👤 User ${index + 1}:`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Name: ${user.fullName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
                console.log(`   Status: ${user.status}`);
                console.log(`   Registered: ${user.registrationDate}`);
                console.log(`   Last Updated: ${user.lastUpdated}`);
                if (user.lastLogin) {
                    console.log(`   Last Login: ${user.lastLogin}`);
                }
                console.log('   ---');
            });
            
            console.log(`\n📈 Total Users: ${users.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error viewing users:', error);
    } finally {
        await client.close();
        console.log('\n✅ Database connection closed');
    }
}

// Run the script
viewUsers().catch(console.error); 