const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = "mongodb+srv://24uglyandrew:weaklings162@sanricosite.vgnc0qj.mongodb.net/";
const client = new MongoClient(uri);

async function setupStaffCredentials() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const database = client.db("MyProductsDb");
        const collection = database.collection("StaffCredentials");

        // Clear existing staff credentials
        await collection.deleteMany({});
        console.log('🧹 Cleared existing staff credentials');

        // Insert the specified staff credentials
        const staffCredentials = [
            {
                username: "staff",
                password: "staff123", // Unhashed as specified
                isAdmin: false,
                isStaff: true,
                isCashier: false
            },
            {
                username: "cashier", 
                password: "cashier123", // Unhashed as specified
                isAdmin: false,
                isStaff: false,
                isCashier: true
            }
        ];

        const result = await collection.insertMany(staffCredentials);
        console.log('✅ Staff credentials inserted successfully');
        console.log(`📊 Inserted ${result.insertedCount} staff accounts`);

        // Verify the credentials were inserted correctly
        const staffUser = await collection.findOne({ username: "staff" });
        const cashierUser = await collection.findOne({ username: "cashier" });

        console.log('\n📋 Verification:');
        console.log('Staff account:', {
            _id: staffUser._id,
            username: staffUser.username,
            password: staffUser.password,
            isAdmin: staffUser.isAdmin,
            isStaff: staffUser.isStaff,
            isCashier: staffUser.isCashier
        });

        console.log('Cashier account:', {
            _id: cashierUser._id,
            username: cashierUser.username,
            password: cashierUser.password,
            isAdmin: cashierUser.isAdmin,
            isStaff: cashierUser.isStaff,
            isCashier: cashierUser.isCashier
        });

        console.log('\n🎉 Staff credentials setup completed successfully!');
        console.log('You can now login with:');
        console.log('- Username: "staff", Password: "staff123" (Staff role)');
        console.log('- Username: "cashier", Password: "cashier123" (Cashier role)');

    } catch (error) {
        console.error('❌ Error setting up staff credentials:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the setup
console.log('Setting up staff credentials...');
setupStaffCredentials(); 