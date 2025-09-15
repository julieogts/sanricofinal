const { MongoClient } = require('mongodb');

async function testApiQuery() {
    const uri = "mongodb+srv://24uglyandrew:weaklings162@sanricosite.vgnc0qj.mongodb.net/";
    const client = new MongoClient(uri);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("UserOrders");
        
        // Get total count
        console.log('📊 Getting total order count...');
        const totalCount = await collection.countDocuments({});
        console.log(`📈 Total orders in database: ${totalCount}`);
        
        // This is the EXACT same query as the API endpoint
        console.log('📋 Searching for orders with status: "Pending"');
        const pendingOrders = await collection.find({ status: "Pending" })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`✅ Found ${pendingOrders.length} pending orders`);
        
        if (pendingOrders.length > 0) {
            console.log('📦 First 3 orders:');
            pendingOrders.slice(0, 3).forEach((order, index) => {
                console.log(`   ${index + 1}. ID: ${order._id}`);
                console.log(`      Buyer: ${order.buyerinfo}`);
                console.log(`      Status: "${order.status}"`);
                console.log(`      Total: ${order.total}`);
                console.log('');
            });
        } else {
            console.log('❌ No pending orders found!');
            
            // Let's check what we actually have
            console.log('🔍 Checking what statuses exist...');
            const allStatuses = await collection.distinct("status");
            console.log('📈 All unique statuses:', allStatuses);
            
            // Check first few orders
            console.log('🔍 First 3 orders:');
            const firstOrders = await collection.find({}).limit(3).toArray();
            firstOrders.forEach((order, index) => {
                console.log(`   Order ${index + 1}:`);
                console.log(`      ID: ${order._id}`);
                console.log(`      Status: "${order.status}"`);
                console.log(`      Buyer: ${order.buyerinfo}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.close();
        console.log("🔌 Database connection closed");
    }
}

testApiQuery(); 