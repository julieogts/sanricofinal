const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

async function connectToDatabase() {
    try {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
        return client.db("MyProductsDb");
    } catch (error) {
        console.error("❌ Database connection error:", error);
        throw error;
    }
}

// MongoDB connection string
const uri = "mongodb+srv://24uglyandrew:weaklings162@sanricosite.vgnc0qj.mongodb.net/";
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongo() {
    try {
        console.log("🔌 Attempting to connect to MongoDB...");
        console.log("🌐 Connection URI:", uri.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')); // Hide credentials
        await client.connect();
        console.log("✅ Connected to MongoDB successfully!");
        
        // Test the connection immediately
        console.log("🏓 Testing connection with ping...");
        await client.db("admin").command({ ping: 1 });
        console.log("✅ MongoDB ping successful!");
        
        // Test access to our database
        console.log("📊 Testing access to MyProductsDb...");
        const database = client.db("MyProductsDb");
        
        // Test all three order collections
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        
        const pendingCount = await pendingCollection.countDocuments({});
        const acceptedCount = await acceptedCollection.countDocuments({});
        const deliveredCount = await deliveredCollection.countDocuments({});
        
        console.log(`✅ Found ${pendingCount} total orders in PendingOrders collection`);
        console.log(`✅ Found ${acceptedCount} total orders in AcceptedOrders collection`);
        console.log(`✅ Found ${deliveredCount} total orders in DeliveredOrders collection`);
        
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        console.error("❌ Error details:", error.message);
    }
}

// API endpoint to get all products
app.get('/api/products', async (req, res) => {
    try {
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        const products = await collection.find({ isActive: true }).toArray();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// API endpoint to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        const product = await collection.findOne({ 
            _id: new ObjectId(req.params.id), 
            isActive: true 
        });
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

// API endpoint to bulk update stock (for checkout) - MUST BE BEFORE :id route
app.put('/api/products/bulk-stock', async (req, res) => {
    console.log('🔥 BULK STOCK ENDPOINT HIT! 🔥');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { ObjectId } = require('mongodb');
        const { updates } = req.body; // Array of {id, quantity} objects
        
        console.log('✅ Bulk stock update request received:', JSON.stringify(req.body, null, 2));
        
        if (!updates) {
            console.error('❌ No updates provided in request body');
            return res.status(400).json({ error: "Updates field is required" });
        }
        
        if (!Array.isArray(updates)) {
            console.error('❌ Updates is not an array:', updates);
            return res.status(400).json({ error: "Updates must be an array" });
        }
        
        console.log(`📦 Processing ${updates.length} stock updates...`);
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        // Process each update
        const results = [];
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            console.log(`🔄 Processing update ${i + 1}/${updates.length} for product: ${update.id}, quantity: ${update.quantity}`);
            
            // Validate the update object
            if (!update.id || typeof update.quantity !== 'number') {
                console.error('❌ Invalid update object:', update);
                return res.status(400).json({ error: "Each update must have id and quantity" });
            }
            
            // Check if the product exists first
            console.log(`🔍 Looking for product with ID: ${update.id}`);
            const existingProduct = await collection.findOne({ _id: new ObjectId(update.id) });
            if (!existingProduct) {
                console.error(`❌ Product not found: ${update.id}`);
                return res.status(404).json({ error: `Product not found: ${update.id}` });
            }
            
            console.log(`✅ Found product: ${existingProduct.name}, current stock: ${existingProduct.stockQuantity}`);
            
            // Check if there's enough stock
            if (existingProduct.stockQuantity < update.quantity) {
                console.error(`❌ Insufficient stock for ${existingProduct.name}. Available: ${existingProduct.stockQuantity}, Requested: ${update.quantity}`);
                return res.status(400).json({ 
                    error: `Insufficient stock for ${existingProduct.name}. Available: ${existingProduct.stockQuantity}, Requested: ${update.quantity}` 
                });
            }
            
            // Update the stock
            console.log(`📉 Reducing stock by ${update.quantity} for ${existingProduct.name}`);
            const result = await collection.updateOne(
                { _id: new ObjectId(update.id) },
                { $inc: { stockQuantity: -update.quantity } }
            );
            
            console.log(`✅ Stock update result for ${existingProduct.name}:`, result);
            results.push(result);
        }
        
        console.log('🎉 All stock updates completed successfully');
        res.json({ success: true, message: "Stock updated successfully", results });
    } catch (error) {
        console.error("❌ Error updating bulk stock:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({ error: "Failed to update bulk stock", details: error.message });
    }
});

// API endpoint to update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const updateData = req.body;
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// API endpoint to update product stock
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { quantity } = req.body;
        
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ error: "Invalid quantity" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { stockQuantity: quantity } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ success: true, message: "Stock updated successfully" });
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ error: "Failed to update stock" });
    }
});

// API endpoint to validate stock availability before checkout
app.post('/api/products/validate-stock', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { items } = req.body; // Array of {id, quantity} objects
        
        console.log('🔍 Stock validation request received:', JSON.stringify(req.body, null, 2));
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Items array is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        const validationResults = [];
        let allValid = true;
        
        for (const item of items) {
            if (!item.id || typeof item.quantity !== 'number') {
                return res.status(400).json({ error: "Each item must have id and quantity" });
            }
            
            const product = await collection.findOne({ _id: new ObjectId(item.id) });
            
            if (!product) {
                validationResults.push({
                    id: item.id,
                    name: 'Unknown Product',
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    valid: false,
                    error: 'Product not found'
                });
                allValid = false;
                continue;
            }
            
            const isValid = product.stockQuantity >= item.quantity;
            if (!isValid) allValid = false;
            
            validationResults.push({
                id: item.id,
                name: product.name,
                requestedQuantity: item.quantity,
                availableStock: product.stockQuantity,
                valid: isValid,
                error: isValid ? null : 'Insufficient stock'
            });
        }
        
        console.log(`✅ Stock validation completed. All valid: ${allValid}`);
        
        res.json({
            success: true,
            allValid: allValid,
            items: validationResults
        });
        
    } catch (error) {
        console.error("❌ Error validating stock:", error);
        res.status(500).json({ error: "Failed to validate stock" });
    }
});

// API endpoint to reserve stock temporarily (for checkout process)
app.post('/api/products/reserve-stock', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { items, reservationId, expiresInMinutes = 15 } = req.body;
        
        console.log('🔒 Stock reservation request received:', JSON.stringify(req.body, null, 2));
        
        if (!items || !Array.isArray(items) || !reservationId) {
            return res.status(400).json({ error: "Items array and reservationId are required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        const reservationsCollection = database.collection("StockReservations");
        
        const expiresAt = new Date(Date.now() + (expiresInMinutes * 60 * 1000));
        
        // Create reservation record
        const reservation = {
            reservationId: reservationId,
            items: items,
            createdAt: new Date(),
            expiresAt: expiresAt,
            status: 'active'
        };
        
        await reservationsCollection.insertOne(reservation);
        
        console.log(`✅ Stock reservation created: ${reservationId}, expires at: ${expiresAt}`);
        
        res.json({
            success: true,
            reservationId: reservationId,
            expiresAt: expiresAt,
            message: `Stock reserved for ${expiresInMinutes} minutes`
        });
        
    } catch (error) {
        console.error("❌ Error reserving stock:", error);
        res.status(500).json({ error: "Failed to reserve stock" });
    }
});

// API endpoint to restore stock (for cancelled orders)
app.post('/api/products/restore-stock', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { items, reason = 'Order cancelled' } = req.body;
        
        console.log('🔄 Stock restoration request received:', JSON.stringify(req.body, null, 2));
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Items array is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        const results = [];
        
        for (const item of items) {
            if (!item.id || typeof item.quantity !== 'number') {
                return res.status(400).json({ error: "Each item must have id and quantity" });
            }
            
            const product = await collection.findOne({ _id: new ObjectId(item.id) });
            
            if (!product) {
                console.error(`❌ Product not found for restoration: ${item.id}`);
                continue;
            }
            
            // Restore stock by adding the quantity back
            const result = await collection.updateOne(
                { _id: new ObjectId(item.id) },
                { $inc: { stockQuantity: item.quantity } }
            );
            
            console.log(`📈 Restored ${item.quantity} units for ${product.name}`);
            results.push({
                productId: item.id,
                productName: product.name,
                restoredQuantity: item.quantity,
                newStock: product.stockQuantity + item.quantity
            });
        }
        
        console.log(`✅ Stock restoration completed for ${results.length} products`);
        
        res.json({
            success: true,
            message: `Stock restored for ${results.length} products`,
            reason: reason,
            results: results
        });
        
    } catch (error) {
        console.error("❌ Error restoring stock:", error);
        res.status(500).json({ error: "Failed to restore stock" });
    }
});

// API endpoint to get current stock levels for multiple products
app.post('/api/products/stock-levels', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ error: "Product IDs array is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("Products");
        
        const objectIds = productIds.map(id => new ObjectId(id));
        const products = await collection.find(
            { _id: { $in: objectIds } },
            { projection: { _id: 1, name: 1, stockQuantity: 1, isActive: 1 } }
        ).toArray();
        
        const stockLevels = products.map(product => ({
            id: product._id.toString(),
            name: product.name,
            stockQuantity: product.stockQuantity,
            isActive: product.isActive
        }));
        
        res.json({
            success: true,
            stockLevels: stockLevels
        });
        
    } catch (error) {
        console.error("Error fetching stock levels:", error);
        res.status(500).json({ error: "Failed to fetch stock levels" });
    }
});

// Debug endpoint to test connectivity
app.get('/api/debug/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// API endpoint to save an order
app.post('/api/orders', async (req, res) => {
    try {
        console.log('📦 New order submission received');
        console.log('Request body keys:', Object.keys(req.body));
        
        // Handle both old format (userId, order) and new format (direct order data)
        let orderData;
        if (req.body.userId && req.body.order) {
            // Old format
            orderData = { userId: req.body.userId, ...req.body.order };
        } else {
            // New format from checkout
            orderData = req.body;
        }
        
        console.log('Order data userId:', orderData.userId);
        console.log('Order data keys:', Object.keys(orderData));
        
        if (!orderData.userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        
        if (!orderData.cartItems || !Array.isArray(orderData.cartItems)) {
            return res.status(400).json({ error: "Missing or invalid cartItems" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        // Format the order for the database
        const formattedOrder = {
            userId: orderData.userId,
            orderNumber: orderData.orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            
            // Customer Information
            fullName: orderData.fullName || '',
            email: orderData.email || '',
            phoneNumber: orderData.phoneNumber || '',
            
            // Order Items
            itemsordered: orderData.cartItems.map(item => ({
                item_name: item.name || 'Unknown Item',
                amount_per_item: item.quantity || 1,
                price_per_item: item.price || 0,
                total_item_price: (item.price || 0) * (item.quantity || 1),
                item_id: item.id || null
            })),
            
            // Address Information
            address: orderData.address || '',
            
            // Payment Information
            paymentMethod: orderData.paymentMethod || '',
            paymentReference: orderData.paymentReference || '',
            paymentAmount: parseFloat(orderData.paymentAmount) || 0,
            proofOfPayment: orderData.proofOfPayment || null,
            
            // Order Details
            total: parseFloat(orderData.total) || 0,
            notes: orderData.notes || 'no additional notes',
            status: orderData.status || 'active',
            
            // Dates
            orderDate: orderData.orderDate || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            
            // Additional metadata
            source: 'checkout_page'
        };
        
        console.log('💾 Saving formatted order to database');
        console.log('Order number:', formattedOrder.orderNumber);
        console.log('Customer:', formattedOrder.fullName);
        console.log('Total:', formattedOrder.total);
        console.log('Status:', formattedOrder.status);
        console.log('Items count:', formattedOrder.itemsordered.length);
        
        const result = await collection.insertOne(formattedOrder);
        
        console.log('✅ Order saved successfully with ID:', result.insertedId);
        
        res.json({ 
            success: true, 
            message: "Order saved successfully", 
            orderId: result.insertedId,
            orderNumber: formattedOrder.orderNumber
        });
        
    } catch (error) {
        console.error("❌ Error saving order:", error);
        console.error("Error details:", error.message);
        res.status(500).json({ error: "Failed to save order", details: error.message });
    }
});

// API endpoint to get pending orders for staff (MUST come before /:userId route)
app.get('/api/orders/pending', async (req, res) => {
    console.log('🔍 Pending orders endpoint hit!');
    console.log('🌐 Client connection state:', client.topology?.s?.state);
    try {
        console.log('🔌 Testing MongoDB connection...');
        await client.db("admin").command({ ping: 1 });
        console.log('✅ MongoDB connection is alive');
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        console.log('📊 Getting total order count...');
        const totalCount = await collection.countDocuments({});
        console.log(`📈 Total orders in database: ${totalCount}`);
        
        console.log('📋 Searching for orders with status: "Pending"');
        
        // First, let's see what statuses actually exist
        const allStatuses = await collection.distinct("status");
        console.log('🔍 All distinct statuses in database:', allStatuses);
        
        // Check for both "Pending" and "pending" (case sensitive issue?)
        const pendingUpperCase = await collection.find({ status: "Pending" }).toArray();
        const pendingLowerCase = await collection.find({ status: "pending" }).toArray();
        
        console.log(`📊 Orders with status "Pending": ${pendingUpperCase.length}`);
        console.log(`📊 Orders with status "pending": ${pendingLowerCase.length}`);
        
        // Return orders with status "Pending" or "active" - include new active orders
        const pendingOrders = await collection.find({ 
            $or: [
                { status: "Pending" },
                { status: "pending" },
                { status: "active" }
            ]
        })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`✅ Found ${pendingOrders.length} pending orders total`);
        console.log('📦 Orders:', JSON.stringify(pendingOrders.map(order => ({
            id: order._id,
            buyer: order.fullName,
            status: order.status,
            total: order.total
        })), null, 2));
        
        res.json(pendingOrders);
    } catch (error) {
        console.error("❌ Error fetching pending orders:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({ error: "Failed to fetch pending orders", details: error.message });
    }
});

// API endpoint to get comprehensive staff statistics from all collections including walk-ins
app.get('/api/orders/stats/staff-overview', async (req, res) => {
    try {
        console.log('📊 Staff comprehensive stats requested');
        
        const database = client.db("MyProductsDb");
        
        // Get counts from all collections
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        
        // Count all orders in each collection
        const totalPending = await pendingCollection.countDocuments({});
        const totalAccepted = await acceptedCollection.countDocuments({});
        const totalDelivered = await deliveredCollection.countDocuments({});
        
        console.log(`📊 Found ${totalPending} pending, ${totalAccepted} accepted, ${totalDelivered} delivered orders`);
        
        // Calculate total revenue from both accepted and delivered orders
        const acceptedOrders = await acceptedCollection.find({}).toArray();
        const deliveredOrders = await deliveredCollection.find({}).toArray();
        
        const totalRevenue = [
            ...acceptedOrders,
            ...deliveredOrders
        ].reduce((sum, order) => {
            return sum + (parseFloat(order.total) || 0);
        }, 0);
        
        const stats = {
            totalPending,
            totalAccepted, 
            totalDelivered,
            totalRevenue,
            totalOrders: totalPending + totalAccepted + totalDelivered
        };
        
        console.log('📊 Staff comprehensive stats response:', stats);
        
        res.json(stats);
    } catch (error) {
        console.error("Error fetching staff comprehensive statistics:", error);
        res.status(500).json({ error: "Failed to fetch staff comprehensive statistics" });
    }
});

// API endpoint to get orders statistics for a user
app.get('/api/orders/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Handle both string and number userIds
        const userIdAsString = String(userId);
        const userIdAsNumber = isNaN(userId) ? null : Number(userId);
        
        // Create query that searches for both string and number versions
        const userQuery = userIdAsNumber !== null ? 
            { $or: [{ userId: userIdAsString }, { userId: userIdAsNumber }] } :
            { userId: userIdAsString };
        
        const database = client.db("MyProductsDb");
        
        // Count orders in each collection
        const pendingCount = await database.collection("PendingOrders").countDocuments(userQuery);
        const acceptedCount = await database.collection("AcceptedOrders").countDocuments(userQuery);
        const deliveredCount = await database.collection("DeliveredOrders").countDocuments(userQuery);
        
        // Calculate total spent across all collections
        const collections = [
            { name: "PendingOrders", collection: database.collection("PendingOrders") },
            { name: "AcceptedOrders", collection: database.collection("AcceptedOrders") },
            { name: "DeliveredOrders", collection: database.collection("DeliveredOrders") }
        ];
        
        let totalSpent = 0;
        for (const { collection } of collections) {
            const orders = await collection.find(userQuery).toArray();
            for (const order of orders) {
                totalSpent += parseFloat(order.total) || 0;
            }
        }
        
        res.json({
            totalOrders: pendingCount + acceptedCount + deliveredCount,
            pendingOrders: pendingCount,
            approvedOrders: acceptedCount,
            deliveredOrders: deliveredCount,
            totalSpent: totalSpent
        });
    } catch (error) {
        console.error("Error fetching order statistics:", error);
        res.status(500).json({ error: "Failed to fetch order statistics" });
    }
});

// API endpoint to get all orders from all collections for staff dashboard
app.get('/api/orders/all-staff', async (req, res) => {
    try {
        console.log('🎯 HIT: /api/orders/all-staff endpoint - this is the correct route!');
        console.log('📋 Fetching all orders from all collections for staff dashboard');
        
        const database = client.db("MyProductsDb");
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        const returnedCollection = database.collection("ReturnedOrders");
        const walkInCollection = database.collection("WalkInOrders");
        
        // Fetch orders from all five collections
        const [pendingOrders, acceptedOrders, deliveredOrders, returnedOrders, walkInOrders] = await Promise.all([
            pendingCollection.find({}).sort({ createdAt: -1 }).toArray(),
            acceptedCollection.find({}).sort({ createdAt: -1 }).toArray(),
            deliveredCollection.find({}).sort({ createdAt: -1 }).toArray(),
            returnedCollection.find({}).sort({ returnedAt: -1 }).toArray(),
            walkInCollection.find({}).sort({ createdAt: -1 }).toArray()
        ]);
        
        console.log(`🔍 Raw collection counts - Pending: ${pendingOrders.length}, Accepted: ${acceptedOrders.length}, Delivered: ${deliveredOrders.length}, Returned: ${returnedOrders.length}, Walk-in: ${walkInOrders.length}`);
        
        // Add collection info to each order for identification
        const allOrders = [
            ...pendingOrders.map(order => ({ ...order, collection: 'pending', displayStatus: order.status === 'active' ? 'pending' : order.status })),
            ...acceptedOrders.map(order => ({ ...order, collection: 'accepted', displayStatus: 'approved' })),
            ...deliveredOrders.map(order => ({ ...order, collection: 'delivered', displayStatus: 'delivered' })),
            ...returnedOrders.map(order => ({ ...order, collection: 'returned', displayStatus: 'returned' })),
            ...walkInOrders.map(order => ({ ...order, collection: 'walkin', displayStatus: 'completed' }))
        ];
        
        // Sort all orders by creation date (newest first)
        allOrders.sort((a, b) => new Date(b.createdAt || b.orderDate || b.returnedAt) - new Date(a.createdAt || a.orderDate || a.returnedAt));
        
        console.log(`✅ Found ${pendingOrders.length} pending, ${acceptedOrders.length} accepted, ${deliveredOrders.length} delivered, ${returnedOrders.length} returned, ${walkInOrders.length} walk-in orders`);
        console.log(`📊 Total orders returned: ${allOrders.length}`);
        
        res.json(allOrders);
        
    } catch (error) {
        console.error("❌ Error fetching all orders for staff:", error);
        res.status(500).json({ error: "Failed to fetch all orders for staff dashboard" });
    }
});

// API endpoint to get all user orders from all three collections
app.get('/api/orders/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`🔍 HIT: /api/orders/:userId endpoint with userId: "${userId}"`);
        
        // Add special check for all-staff
        if (userId === 'all-staff') {
            console.log('❌ ERROR: all-staff request is hitting the wrong route! This should go to /api/orders/all-staff');
            return res.status(400).json({ 
                error: "This endpoint is for specific user orders. Use /api/orders/all-staff for staff dashboard orders." 
            });
        }
        
        console.log(`🔍 Fetching orders for userId: "${userId}"`);
        
        // Handle both string and number userIds
        const userIdAsString = String(userId);
        const userIdAsNumber = isNaN(userId) ? null : Number(userId);
        
        console.log(`🔍 Searching for userId as string: "${userIdAsString}"`);
        console.log(`🔍 Searching for userId as number: ${userIdAsNumber}`);
        
        const database = client.db("MyProductsDb");
        
        // Fetch from all three collections
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        
        // Create query that searches for both string and number versions
        const userQuery = userIdAsNumber !== null ? 
            { $or: [{ userId: userIdAsString }, { userId: userIdAsNumber }] } :
            { userId: userIdAsString };
        
        console.log('🔍 Using query:', JSON.stringify(userQuery));
        
        // Get orders from each collection
        const pendingOrders = await pendingCollection.find(userQuery)
            .sort({ createdAt: -1 })
            .toArray();
        
        const acceptedOrders = await acceptedCollection.find(userQuery)
            .sort({ createdAt: -1 })
            .toArray();
            
        const deliveredOrders = await deliveredCollection.find(userQuery)
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📊 Found ${pendingOrders.length} pending orders for user ${userId}`);
        console.log(`📊 Found ${acceptedOrders.length} accepted orders for user ${userId}`);
        console.log(`📊 Found ${deliveredOrders.length} delivered orders for user ${userId}`);
        
        // Debug: Show what userIds exist in the pending collection
        const allPendingOrders = await pendingCollection.find({}).toArray();
        const existingUserIds = [...new Set(allPendingOrders.map(order => order.userId))];
        console.log(`🔍 Existing userIds in PendingOrders:`, existingUserIds);
        console.log(`🔍 Looking for userId: "${userId}" (type: ${typeof userId})`);
        
        // Add status to each order based on collection
        const pendingWithStatus = pendingOrders.map(order => ({
            ...order,
            status: order.status || 'pending',
            collection: 'pending'
        }));
        
        const acceptedWithStatus = acceptedOrders.map(order => ({
            ...order,
            status: order.status || 'approved',
            collection: 'accepted'
        }));
        
        const deliveredWithStatus = deliveredOrders.map(order => ({
            ...order,
            status: order.status || 'delivered',
            collection: 'delivered'
        }));
        
        // Combine all orders
        const allOrders = [...pendingWithStatus, ...acceptedWithStatus, ...deliveredWithStatus];
        
        // Convert to the format expected by the frontend
        const formattedOrders = allOrders.map(order => ({
            items: order.itemsordered.map(item => ({
                name: item.item_name,
                quantity: item.amount_per_item,
                price: item.price_per_item
            })),
            date: order.orderDate || order.createdAt,
            status: order.status,
            payment: order.payment,
            shipping: { 
                address: order.address,
                phoneNumber: order.phoneNumber || order.shipping?.phoneNumber || ''
            },
            notes: order.notes,
            _id: order._id,
            collection: order.collection,
            orderNumber: order.orderNumber,
            fullName: order.fullName,
            email: order.email,
            paymentMethod: order.paymentMethod,
            paymentReference: order.paymentReference,
            paymentAmount: order.paymentAmount,
            proofOfPayment: order.proofOfPayment,
            total: order.total
        }));
        
        // Sort by date (newest first)
        formattedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`✅ Returning ${formattedOrders.length} formatted orders for user ${userId}`);
        res.json(formattedOrders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// API endpoint to update order payment details
app.put('/api/orders/:orderId/payment', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { paymentUpdates } = req.body;
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.orderId) },
            { $set: { payment: paymentUpdates } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json({ success: true, message: "Payment details updated successfully" });
    } catch (error) {
        console.error("Error updating order payment:", error);
        res.status(500).json({ error: "Failed to update payment details" });
    }
});

// API endpoint to get all orders (for debugging)
app.get('/api/orders', async (req, res) => {
    try {
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        const allOrders = await collection.find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📈 Total orders in database: ${allOrders.length}`);
        if (allOrders.length > 0) {
            console.log('📊 Order statuses found:', [...new Set(allOrders.map(o => o.status))]);
        }
        
        res.json(allOrders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// API endpoint to update order status
app.put('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.orderId) },
            { $set: { status: status } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// API endpoint to get orders with proof of payment (for staff review)
app.get('/api/orders/with-proof', async (req, res) => {
    try {
        console.log('🖼️ Fetching orders with proof of payment...');
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        // Find orders that have proofOfPayment field and it's not null/empty
        const ordersWithProof = await collection.find({ 
            proofOfPayment: { $exists: true, $ne: null, $ne: "" },
            status: { $in: ["active", "Pending", "pending"] }
        })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`✅ Found ${ordersWithProof.length} orders with proof of payment`);
        
        // Format orders for staff review
        const formattedOrders = ordersWithProof.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            fullName: order.fullName,
            email: order.email,
            phoneNumber: order.phoneNumber,
            address: order.address,
            paymentMethod: order.paymentMethod,
            paymentReference: order.paymentReference,
            paymentAmount: order.paymentAmount,
            total: order.total,
            status: order.status,
            notes: order.notes,
            proofOfPayment: order.proofOfPayment,
            orderDate: order.orderDate,
            createdAt: order.createdAt,
            itemsordered: order.itemsordered
        }));
        
        res.json(formattedOrders);
    } catch (error) {
        console.error("❌ Error fetching orders with proof:", error);
        res.status(500).json({ error: "Failed to fetch orders with proof of payment" });
    }
});

// API endpoint to update order payment verification status
app.put('/api/orders/:orderId/verify-payment', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { verified, verifiedBy, verificationNotes } = req.body;
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        const updateData = {
            paymentVerified: verified,
            paymentVerifiedBy: verifiedBy,
            paymentVerificationNotes: verificationNotes || '',
            paymentVerificationDate: new Date(),
            updatedAt: new Date()
        };
        
        // If payment is verified, update status to "confirmed"
        if (verified) {
            updateData.status = "confirmed";
        }
        
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.orderId) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json({ 
            success: true, 
            message: `Payment ${verified ? 'verified' : 'rejected'} successfully` 
        });
    } catch (error) {
        console.error("Error updating payment verification:", error);
        res.status(500).json({ error: "Failed to update payment verification" });
    }
});

// API endpoint to migrate localStorage orders to MongoDB
app.post('/api/orders/migrate', async (req, res) => {
    try {
        const { userCarts } = req.body;
        
        if (!userCarts || typeof userCarts !== 'object') {
            return res.status(400).json({ error: "Invalid userCarts data" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        let totalMigrated = 0;
        let errors = [];
        
        // Process each user's orders
        for (const [userId, orders] of Object.entries(userCarts)) {
            if (!Array.isArray(orders)) continue;
            
            for (const order of orders) {
                try {
                    // Check if order already exists (avoid duplicates)
                    const existingOrder = await collection.findOne({
                        userId: userId,
                        original_date: order.date,
                        "itemsordered.item_name": order.items?.[0]?.name
                    });
                    
                    if (existingOrder) {
                        console.log(`Order already exists for user ${userId}, skipping`);
                        continue;
                    }
                    
                    // Format the order according to MongoDB structure
                    const formattedOrder = {
                        userId: userId,
                        itemsordered: (order.items || []).map(item => ({
                            item_name: item.name || item.item_name || 'Unknown Item',
                            amount_per_item: item.quantity || item.amount_per_item || 1,
                            price_per_item: item.price || item.price_per_item || 0,
                            total_item_price: (item.price || 0) * (item.quantity || 1)
                        })),
                        date_ordered: new Date(order.date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: '2-digit'
                        }),
                        buyerinfo: order.buyerinfo || order.username || `user_${userId}`,
                        address: order.shipping?.address || order.address || '',
                        total: (order.items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) + 150,
                        status: order.status || 'Pending',
                        payment: order.payment || {},
                        shipping: order.shipping || {},
                        notes: order.notes || '',
                        original_date: order.date,
                        createdAt: new Date(order.date),
                        migrated: true
                    };
                    
                    await collection.insertOne(formattedOrder);
                    totalMigrated++;
                    
                } catch (orderError) {
                    console.error(`Error migrating order for user ${userId}:`, orderError);
                    errors.push(`User ${userId}: ${orderError.message}`);
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: `Successfully migrated ${totalMigrated} orders`,
            totalMigrated,
            errors: errors.length > 0 ? errors : undefined
        });
        
    } catch (error) {
        console.error("Error migrating orders:", error);
        res.status(500).json({ error: "Failed to migrate orders" });
    }
});

// API endpoint for staff login
app.post('/api/staff/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Username and password are required" 
            });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("StaffCredentials");
        
        // Find user with matching username and password (unhashed for now)
        const staffUser = await collection.findOne({ 
            username: username,
            password: password // Note: In production, passwords should be hashed
        });
        
        if (!staffUser) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }
        
        // Return success with user info (excluding password)
        const { password: _, ...userInfo } = staffUser;
        res.json({ 
            success: true, 
            message: "Login successful",
            user: userInfo
        });
        
    } catch (error) {
        console.error("Error during staff login:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
});

// API endpoint to save a user address
app.post('/api/user-addresses', async (req, res) => {
    try {
        const { userId, addressData } = req.body;
        if (!userId || !addressData) {
            return res.status(400).json({ error: 'Missing userId or addressData' });
        }
        const database = client.db('MyProductsDb');
        const collection = database.collection('UserAddresses');

        // If this address is set as default, unset all others for this user
        if (addressData.isDefault) {
            await collection.updateMany(
                { userId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const doc = {
            userId,
            ...addressData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(doc);
        res.json({ success: true, message: 'Address saved successfully', addressId: result.insertedId });
    } catch (error) {
        console.error('Error saving user address:', error);
        res.status(500).json({ error: 'Failed to save address' });
    }
});

// API endpoint to get user addresses by userId
app.get('/api/user-addresses', async (req, res) => {
    try {
        let { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }
        // Convert userId to number if possible
        if (!isNaN(userId)) userId = Number(userId);

        const database = client.db('MyProductsDb');
        const collection = database.collection('UserAddresses');
        const addresses = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

// API endpoint to set an address as default
app.put('/api/user-addresses/:id/default', async (req, res) => {
    try {
        const { id } = req.params;
        const database = client.db('MyProductsDb');
        const collection = database.collection('UserAddresses');
        const address = await collection.findOne({ id });

        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Unset all other defaults for this user
        await collection.updateMany(
            { userId: address.userId, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Set this address as default
        await collection.updateOne(
            { id },
            { $set: { isDefault: true } }
        );

        res.json({ success: true, message: 'Default address updated' });
    } catch (error) {
        console.error('Error updating default address:', error);
        res.status(500).json({ error: 'Failed to update default address' });
    }
});

// API endpoint to add order to AcceptedOrders collection
app.post('/api/orders/accepted', async (req, res) => {
    try {
        console.log('📋 Adding order to AcceptedOrders collection');
        
        const orderData = req.body;
        
        if (!orderData) {
            return res.status(400).json({ error: "Order data is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("AcceptedOrders");
        
        // Ensure the order has the correct status and approval metadata
        const acceptedOrder = {
            ...orderData,
            status: 'approved',
            approvedAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(acceptedOrder);
        
        console.log('✅ Order added to AcceptedOrders:', result.insertedId);
        
        res.json({ 
            success: true, 
            message: "Order moved to AcceptedOrders successfully", 
            insertedId: result.insertedId,
            orderId: result.insertedId
        });
        
    } catch (error) {
        console.error("❌ Error adding order to AcceptedOrders:", error);
        res.status(500).json({ error: "Failed to add order to AcceptedOrders" });
    }
});

// API endpoint to get specific order from AcceptedOrders (for verification)
app.get('/api/orders/accepted/:orderId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const orderId = req.params.orderId;
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("AcceptedOrders");
        
        const order = await collection.findOne({ _id: new ObjectId(orderId) });
        
        if (!order) {
            return res.status(404).json({ error: "Order not found in AcceptedOrders" });
        }
        
        res.json(order);
        
    } catch (error) {
        console.error("❌ Error fetching order from AcceptedOrders:", error);
        res.status(500).json({ error: "Failed to fetch order from AcceptedOrders" });
    }
});

// API endpoint to delete order from PendingOrders collection
app.delete('/api/orders/pending/:orderId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const orderId = req.params.orderId;
        
        console.log('🗑️ Deleting order from PendingOrders:', orderId);
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("PendingOrders");
        
        const result = await collection.deleteOne({ _id: new ObjectId(orderId) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Order not found in PendingOrders" });
        }
        
        console.log('✅ Order deleted from PendingOrders:', orderId);
        
        res.json({ 
            success: true, 
            message: "Order removed from PendingOrders successfully",
            deletedCount: result.deletedCount
        });
        
    } catch (error) {
        console.error("❌ Error deleting order from PendingOrders:", error);
        res.status(500).json({ error: "Failed to delete order from PendingOrders" });
    }
});

// API endpoint to add order to DeliveredOrders collection
app.post('/api/orders/delivered', async (req, res) => {
    try {
        console.log('🚚 Adding order to DeliveredOrders collection');
        
        const orderData = req.body;
        
        if (!orderData) {
            return res.status(400).json({ error: "Order data is required" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("DeliveredOrders");
        
        // Ensure the order has the correct status and delivery metadata
        const deliveredOrder = {
            ...orderData,
            status: 'delivered',
            deliveredAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(deliveredOrder);
        
        console.log('✅ Order added to DeliveredOrders:', result.insertedId);
        
        res.json({ 
            success: true, 
            message: "Order moved to DeliveredOrders successfully", 
            insertedId: result.insertedId,
            orderId: result.insertedId
        });
        
    } catch (error) {
        console.error("❌ Error adding order to DeliveredOrders:", error);
        res.status(500).json({ error: "Failed to add order to DeliveredOrders" });
    }
});

// API endpoint to get specific order from DeliveredOrders (for verification)
app.get('/api/orders/delivered/:orderId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const orderId = req.params.orderId;
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("DeliveredOrders");
        
        const order = await collection.findOne({ _id: new ObjectId(orderId) });
        
        if (!order) {
            return res.status(404).json({ error: "Order not found in DeliveredOrders" });
        }
        
        res.json(order);
        
    } catch (error) {
        console.error("❌ Error fetching order from DeliveredOrders:", error);
        res.status(500).json({ error: "Failed to fetch order from DeliveredOrders" });
    }
});

// API endpoint to delete order from AcceptedOrders collection
app.delete('/api/orders/accepted/:orderId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const orderId = req.params.orderId;
        
        console.log('🗑️ Deleting order from AcceptedOrders:', orderId);
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("AcceptedOrders");
        
        const result = await collection.deleteOne({ _id: new ObjectId(orderId) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Order not found in AcceptedOrders" });
        }
        
        console.log('✅ Order deleted from AcceptedOrders:', orderId);
        
        res.json({ 
            success: true, 
            message: "Order removed from AcceptedOrders successfully",
            deletedCount: result.deletedCount
        });
        
    } catch (error) {
        console.error("❌ Error deleting order from AcceptedOrders:", error);
        res.status(500).json({ error: "Failed to delete order from AcceptedOrders" });
    }
});

// API endpoint to save walk-in orders from POS
app.post('/api/orders/walkin', async (req, res) => {
    try {
        console.log('🚶 Saving walk-in order from POS:', JSON.stringify(req.body, null, 2));
        
        const orderData = req.body;
        
        if (!orderData) {
            return res.status(400).json({ error: "Order data is required" });
        }
        
        // Validate required fields
        if (!orderData.fullName || !orderData.itemsordered || !Array.isArray(orderData.itemsordered)) {
            return res.status(400).json({ error: "Missing required fields: fullName and itemsordered" });
        }
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("WalkInOrders");
        
        // Ensure walk-in order has proper structure and timestamps
        const walkInOrder = {
            ...orderData,
            source: 'pos_walkin',
            collection: 'walkin',
            status: orderData.status || 'completed',
            displayStatus: orderData.displayStatus || 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
            staffProcessed: true,
            posTimestamp: new Date()
        };
        
        const result = await collection.insertOne(walkInOrder);
        
        console.log('✅ Walk-in order saved successfully:', result.insertedId);
        
        res.json({ 
            success: true, 
            message: "Walk-in order saved successfully", 
            insertedId: result.insertedId,
            orderId: result.insertedId
        });
        
    } catch (error) {
        console.error("❌ Error saving walk-in order:", error);
        res.status(500).json({ error: "Failed to save walk-in order", details: error.message });
    }
});

// API endpoint to get all walk-in orders
app.get('/api/orders/walkin', async (req, res) => {
    try {
        console.log('📋 Fetching all walk-in orders');
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("WalkInOrders");
        
        const walkInOrders = await collection.find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`✅ Found ${walkInOrders.length} walk-in orders`);
        
        res.json(walkInOrders);
        
    } catch (error) {
        console.error("❌ Error fetching walk-in orders:", error);
        res.status(500).json({ error: "Failed to fetch walk-in orders" });
    }
});

// API endpoint to get walk-in orders stats
app.get('/api/orders/walkin/stats', async (req, res) => {
    try {
        console.log('📊 Fetching walk-in orders statistics');
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("WalkInOrders");
        
        const totalCount = await collection.countDocuments({});
        
        // Get revenue from walk-in orders
        const revenueResult = await collection.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" },
                    avgOrderValue: { $avg: "$total" }
                }
            }
        ]).toArray();
        
        const stats = {
            totalWalkInOrders: totalCount,
            totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
            averageOrderValue: revenueResult.length > 0 ? revenueResult[0].avgOrderValue : 0
        };
        
        console.log('✅ Walk-in order stats:', stats);
        
        res.json(stats);
        
    } catch (error) {
        console.error("❌ Error fetching walk-in order stats:", error);
        res.status(500).json({ error: "Failed to fetch walk-in order stats" });
    }
});

// API endpoint to get user addresses (for order address resolution)
app.get('/api/user-addresses', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        console.log('📮 Fetching addresses for user:', userId);
        
        const database = client.db("MyProductsDb");
        const collection = database.collection("UserAddresses");
        
        const addresses = await collection.find({ userId: userId }).toArray();
        
        console.log(`✅ Found ${addresses.length} addresses for user ${userId}`);
        
        res.json(addresses);
        
    } catch (error) {
        console.error("❌ Error fetching user addresses:", error);
        res.status(500).json({ error: "Failed to fetch user addresses" });
    }
});

// API endpoint for comprehensive staff dashboard statistics
app.get('/api/orders/stats/comprehensive', async (req, res) => {
    try {
        console.log('📊 Fetching comprehensive staff dashboard statistics');
        
        const database = client.db("MyProductsDb");
        
        // Get counts from all order collections
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        const walkInCollection = database.collection("WalkInOrders");
        
        const [pendingCount, acceptedCount, deliveredCount, walkInCount] = await Promise.all([
            pendingCollection.countDocuments({}),
            acceptedCollection.countDocuments({}),
            deliveredCollection.countDocuments({}),
            walkInCollection.countDocuments({})
        ]);
        
        // Calculate revenue from accepted and delivered orders
        const acceptedRevenue = await acceptedCollection.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]).toArray();
        
        const deliveredRevenue = await deliveredCollection.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]).toArray();
        
        const walkInRevenue = await walkInCollection.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]).toArray();
        
        const totalRevenue = 
            (acceptedRevenue.length > 0 ? acceptedRevenue[0].total : 0) +
            (deliveredRevenue.length > 0 ? deliveredRevenue[0].total : 0) +
            (walkInRevenue.length > 0 ? walkInRevenue[0].total : 0);
        
        // Count total delivered products (items in delivered orders)
        const deliveredProductsResult = await deliveredCollection.aggregate([
            { $unwind: "$itemsordered" },
            { $group: { _id: null, totalProducts: { $sum: "$itemsordered.amount_per_item" } } }
        ]).toArray();
        
        const walkInProductsResult = await walkInCollection.aggregate([
            { $unwind: "$itemsordered" },
            { $group: { _id: null, totalProducts: { $sum: "$itemsordered.amount_per_item" } } }
        ]).toArray();
        
        const totalDeliveredProducts = 
            (deliveredProductsResult.length > 0 ? deliveredProductsResult[0].totalProducts : 0) +
            (walkInProductsResult.length > 0 ? walkInProductsResult[0].totalProducts : 0);
        
        const stats = {
            totalPending: pendingCount,
            totalAccepted: acceptedCount,
            totalDelivered: deliveredCount,
            totalWalkIn: walkInCount,
            totalRevenue: totalRevenue,
            totalDeliveredProducts: totalDeliveredProducts,
            lastUpdated: new Date()
        };
        
        console.log('✅ Comprehensive staff statistics:', stats);
        
        res.json(stats);
        
    } catch (error) {
        console.error("❌ Error fetching comprehensive staff statistics:", error);
        res.status(500).json({ error: "Failed to fetch comprehensive staff statistics" });
    }
});

// API endpoint to get all collections data for staff (enhanced)
app.get('/api/orders/all-collections', async (req, res) => {
    try {
        console.log('📋 Fetching orders from all collections for staff dashboard');
        
        const database = client.db("MyProductsDb");
        const pendingCollection = database.collection("PendingOrders");
        const acceptedCollection = database.collection("AcceptedOrders");
        const deliveredCollection = database.collection("DeliveredOrders");
        const walkInCollection = database.collection("WalkInOrders");
        
        // Fetch from all collections in parallel
        const [pendingOrders, acceptedOrders, deliveredOrders, walkInOrders] = await Promise.all([
            pendingCollection.find({}).toArray(),
            acceptedCollection.find({}).toArray(),
            deliveredCollection.find({}).toArray(),
            walkInCollection.find({}).toArray()
        ]);
        
        // Add collection and display status metadata
        const allOrders = [
            ...pendingOrders.map(order => ({
                ...order,
                collection: 'pending',
                displayStatus: order.status === 'active' ? 'pending' : order.status
            })),
            ...acceptedOrders.map(order => ({
                ...order,
                collection: 'accepted',
                displayStatus: 'approved'
            })),
            ...deliveredOrders.map(order => ({
                ...order,
                collection: 'delivered',
                displayStatus: 'delivered'
            })),
            ...walkInOrders.map(order => ({
                ...order,
                collection: 'walkin',
                displayStatus: 'completed'
            }))
        ];
        
        // Sort by most recent first
        allOrders.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.orderDate || a.original_date || 0);
            const dateB = new Date(b.createdAt || b.orderDate || b.original_date || 0);
            return dateB - dateA;
        });
        
        console.log(`✅ Fetched orders: ${pendingOrders.length} pending, ${acceptedOrders.length} accepted, ${deliveredOrders.length} delivered, ${walkInOrders.length} walk-in`);
        
        res.json(allOrders);
        
    } catch (error) {
        console.error("❌ Error fetching orders from all collections:", error);
        res.status(500).json({ error: "Failed to fetch orders from all collections" });
    }
});

// API endpoint to update order status (enhanced for collection movement)
app.put('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const orderId = req.params.orderId;
        const { status, updatedBy } = req.body;
        
        console.log(`📝 Updating order ${orderId} status to: ${status}`);
        
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }
        
        const database = client.db("MyProductsDb");
        
        // Try to find the order in all collections
        const collections = [
            { name: 'PendingOrders', collection: database.collection("PendingOrders") },
            { name: 'AcceptedOrders', collection: database.collection("AcceptedOrders") },
            { name: 'DeliveredOrders', collection: database.collection("DeliveredOrders") }
        ];
        
        let order = null;
        let foundInCollection = null;
        
        for (const { name, collection } of collections) {
            order = await collection.findOne({ _id: new ObjectId(orderId) });
            if (order) {
                foundInCollection = { name, collection };
                break;
            }
        }
        
        if (!order) {
            return res.status(404).json({ error: "Order not found in any collection" });
        }
        
        console.log(`📍 Found order in: ${foundInCollection.name}`);
        
        // Update the order in its current collection
        const updateData = {
            status: status,
            updatedAt: new Date(),
            updatedBy: updatedBy || 'staff'
        };
        
        const result = await foundInCollection.collection.updateOne(
            { _id: new ObjectId(orderId) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Failed to update order" });
        }
        
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
        
        res.json({ 
            success: true, 
            message: `Order status updated to ${status}`,
            orderId: orderId,
            collection: foundInCollection.name
        });
        
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// API endpoint to get order analytics for dashboard
app.get('/api/orders/analytics', async (req, res) => {
    try {
        console.log('📈 Fetching order analytics for dashboard');
        
        const { startDate, endDate } = req.query;
        
        const database = client.db("MyProductsDb");
        
        // Build date filter if provided
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }
        
        const collections = [
            { name: 'pending', collection: database.collection("PendingOrders") },
            { name: 'accepted', collection: database.collection("AcceptedOrders") },
            { name: 'delivered', collection: database.collection("DeliveredOrders") },
            { name: 'walkin', collection: database.collection("WalkInOrders") }
        ];
        
        const analytics = {};
        
        for (const { name, collection } of collections) {
            const count = await collection.countDocuments(dateFilter);
            const revenue = await collection.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]).toArray();
            
            analytics[name] = {
                count: count,
                revenue: revenue.length > 0 ? revenue[0].total : 0
            };
        }
        
        // Calculate totals
        analytics.totals = {
            orders: Object.values(analytics).reduce((sum, item) => sum + item.count, 0),
            revenue: Object.values(analytics).reduce((sum, item) => sum + item.revenue, 0)
        };
        
        console.log('✅ Order analytics calculated:', analytics);
        
        res.json(analytics);
        
    } catch (error) {
        console.error("❌ Error fetching order analytics:", error);
        res.status(500).json({ error: "Failed to fetch order analytics" });
    }
});

// API endpoint to move orders between collections (for staff dashboard status updates)
app.post('/api/orders/move', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { orderId, operation, fromCollection, toCollection, denialReason, returnReason, returnImage } = req.body;
        
        console.log(`🔄 Moving order ${orderId} from ${fromCollection} to ${toCollection}`);
        
        if (!orderId || !operation || !fromCollection || !toCollection) {
            return res.status(400).json({ error: "Missing required fields: orderId, operation, fromCollection, toCollection" });
        }
        
        const database = client.db("MyProductsDb");
        
        // Map collection names to actual MongoDB collection names
        const collectionMapping = {
            'orders': 'PendingOrders',
            'pending': 'PendingOrders',
            'accepted': 'AcceptedOrders',
            'delivered': 'DeliveredOrders',
            'denied': 'DeniedOrders',
            'returned': 'ReturnedOrders'
        };
        
        const sourceCollectionName = collectionMapping[fromCollection];
        const targetCollectionName = collectionMapping[toCollection];
        
        if (!sourceCollectionName || !targetCollectionName) {
            return res.status(400).json({ error: "Invalid collection names" });
        }
        
        const sourceCollection = database.collection(sourceCollectionName);
        const targetCollection = database.collection(targetCollectionName);
        
        // Find the order in the source collection
        const order = await sourceCollection.findOne({ _id: new ObjectId(orderId) });
        
        if (!order) {
            return res.status(404).json({ error: `Order not found in ${sourceCollectionName}` });
        }
        
        // Prepare the order for the target collection
        let updatedOrder = { ...order };
        delete updatedOrder._id; // Remove the _id so MongoDB can assign a new one
        
        // Update order based on the target status
        switch (toCollection) {
            case 'pending':
                updatedOrder.status = 'pending';
                updatedOrder.displayStatus = 'pending';
                break;
            case 'accepted':
                updatedOrder.status = 'approved';
                updatedOrder.displayStatus = 'approved';
                updatedOrder.approvedAt = new Date();
                break;
            case 'delivered':
                updatedOrder.status = 'delivered';
                updatedOrder.displayStatus = 'delivered';
                updatedOrder.deliveredAt = new Date();
                break;
            case 'denied':
                updatedOrder.status = 'denied';
                updatedOrder.displayStatus = 'denied';
                updatedOrder.deniedAt = new Date();
                if (denialReason) {
                    updatedOrder.denialReason = denialReason;
                }
                break;
            case 'returned':
                updatedOrder.status = 'returned';
                updatedOrder.displayStatus = 'returned';
                updatedOrder.returnedAt = new Date();
                
                // Handle return documentation
                if (returnReason) {
                    updatedOrder.returnReason = returnReason;
                    console.log(`📝 Return reason recorded: ${returnReason}`);
                }
                
                if (returnImage) {
                    updatedOrder.returnImage = returnImage;
                    updatedOrder.returnImageUploadedAt = new Date();
                    console.log(`📷 Return documentation image saved (${returnImage.length} characters)`);
                }
                
                // Add return processing metadata
                updatedOrder.returnProcessedBy = 'staff';
                updatedOrder.returnProcessingDate = new Date();
                
                console.log(`✅ Return documentation complete for order ${orderId}`);
                break;
        }
        
        updatedOrder.updatedAt = new Date();
        updatedOrder.lastModifiedBy = 'staff';
        
        // Insert into target collection
        const insertResult = await targetCollection.insertOne(updatedOrder);
        
        if (!insertResult.insertedId) {
            throw new Error('Failed to insert order into target collection');
        }
        
        // Remove from source collection
        const deleteResult = await sourceCollection.deleteOne({ _id: new ObjectId(orderId) });
        
        if (deleteResult.deletedCount === 0) {
            // If deletion failed, we should remove the inserted order to maintain consistency
            await targetCollection.deleteOne({ _id: insertResult.insertedId });
            throw new Error('Failed to remove order from source collection');
        }
        
        console.log(`✅ Order ${orderId} successfully moved from ${fromCollection} to ${toCollection}`);
        
        res.json({
            success: true,
            message: `Order successfully moved to ${toCollection}`,
            newOrderId: insertResult.insertedId,
            operation: operation,
            ...(returnReason && { returnReason }),
            ...(returnImage && { returnImageSaved: true })
        });
        
    } catch (error) {
        console.error("❌ Error moving order between collections:", error);
        res.status(500).json({ error: "Failed to move order between collections", details: error.message });
    }
});

// API endpoint to get return documentation for an order
app.get('/api/orders/:orderId/return-documentation', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { orderId } = req.params;
        
        console.log(`📄 Fetching return documentation for order: ${orderId}`);
        
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        
        const database = client.db("MyProductsDb");
        const returnedOrdersCollection = database.collection("ReturnedOrders");
        
        // Find the returned order
        const returnedOrder = await returnedOrdersCollection.findOne({ 
            _id: new ObjectId(orderId) 
        });
        
        if (!returnedOrder) {
            return res.status(404).json({ error: "Returned order not found" });
        }
        
        // Extract return documentation
        const returnDocumentation = {
            orderId: returnedOrder._id,
            orderNumber: returnedOrder.orderNumber || `ORD-${returnedOrder._id.toString().slice(-6)}`,
            customerName: returnedOrder.fullName || returnedOrder.buyerinfo || 'N/A',
            returnReason: returnedOrder.returnReason || 'No reason provided',
            returnImage: returnedOrder.returnImage || null,
            returnedAt: returnedOrder.returnedAt || returnedOrder.returnProcessingDate,
            returnProcessedBy: returnedOrder.returnProcessedBy || 'staff',
            returnImageUploadedAt: returnedOrder.returnImageUploadedAt || null
        };
        
        console.log(`✅ Return documentation retrieved for order ${orderId}`);
        
        res.json(returnDocumentation);
        
    } catch (error) {
        console.error("❌ Error fetching return documentation:", error);
        res.status(500).json({ error: "Failed to fetch return documentation", details: error.message });
    }
});

// API endpoint to get all returned orders with documentation
app.get('/api/orders/returned', async (req, res) => {
    try {
        console.log(`📦 Fetching all returned orders with documentation`);

        const database = client.db("MyProductsDb");
        const returnedOrdersCollection = database.collection("ReturnedOrders");

        // Get all returned orders, sorted by most recent first
        const returnedOrders = await returnedOrdersCollection.find({})
            .sort({ returnedAt: -1 })
            .toArray();

        // Format the returned orders with documentation info
        const formattedOrders = returnedOrders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6)}`,
            customerName: order.fullName || order.buyerinfo || 'N/A',
            customerEmail: order.email || 'N/A',
            customerPhone: order.phoneNumber || 'N/A',
            total: order.total || 0,
            itemsCount: (order.itemsordered || []).length,
            returnReason: order.returnReason || 'No reason provided',
            hasReturnImage: !!(order.returnImage),
            returnedAt: order.returnedAt || order.returnProcessingDate,
            returnProcessedBy: order.returnProcessedBy || 'staff',
            originalOrderDate: order.orderDate || order.createdAt || order.original_date,
            paymentMethod: order.paymentMethod || 'N/A',
            // Only include these for summary, actual image data retrieved separately
            returnImageAvailable: !!(order.returnImage),
            returnImageUploadedAt: order.returnImageUploadedAt || null
        }));

        console.log(`✅ Retrieved ${formattedOrders.length} returned orders`);

        res.json({
            success: true,
            count: formattedOrders.length,
            returnedOrders: formattedOrders
        });

    } catch (error) {
        console.error("❌ Error fetching returned orders:", error);
        res.status(500).json({ error: "Failed to fetch returned orders", details: error.message });
    }
});

// API endpoint to submit return/exchange request from order history
app.post('/api/orders/return-request', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const {
            orderId,
            returnType,
            selectedItems,
            reason,
            additionalComments,
            returnImage
        } = req.body;

        console.log('🔄 Processing return/exchange request:', {
            orderId,
            returnType,
            selectedItems: selectedItems?.length,
            reason,
            hasImage: !!returnImage
        });

        if (!orderId || !returnType || !selectedItems || selectedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: orderId, returnType, and selectedItems"
            });
        }

        const database = client.db("MyProductsDb");

        // Find the original order in any collection
        const collections = [
            { name: 'DeliveredOrders', collection: database.collection("DeliveredOrders") },
            { name: 'AcceptedOrders', collection: database.collection("AcceptedOrders") },
            { name: 'PendingOrders', collection: database.collection("PendingOrders") }
        ];

        let originalOrder = null;
        let sourceCollection = null;

        for (const { name, collection } of collections) {
            originalOrder = await collection.findOne({ _id: new ObjectId(orderId) });
            if (originalOrder) {
                sourceCollection = { name, collection };
                break;
            }
        }

        if (!originalOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Create return request record
        const returnRequest = {
            originalOrderId: orderId,
            orderNumber: originalOrder.orderNumber || `ORD-${orderId.slice(-6)}`,
            customerName: originalOrder.fullName || originalOrder.buyerinfo || 'N/A',
            customerEmail: originalOrder.email || 'N/A',
            customerPhone: originalOrder.phoneNumber || 'N/A',
            returnType: returnType, // 'return' or 'exchange'
            selectedItems: selectedItems,
            reason: reason,
            additionalComments: additionalComments || '',
            returnImage: returnImage || null,
            originalOrderTotal: originalOrder.total || 0,
            originalOrderDate: originalOrder.orderDate || originalOrder.createdAt,
            status: 'pending_review', // pending_review, approved, rejected, processed
            submittedAt: new Date(),
            submittedBy: 'customer',
            sourceCollection: sourceCollection.name
        };

        // Save return request to ReturnRequests collection
        const returnRequestsCollection = database.collection("ReturnRequests");
        const result = await returnRequestsCollection.insertOne(returnRequest);

        console.log(`✅ Return request saved with ID: ${result.insertedId}`);

        // Create staff notification for new return request
        const staffNotificationsCollection = database.collection("StaffNotifications");
        const notification = {
            id: `return_${result.insertedId}_${Date.now()}`,
            title: '🔄 New Return/Exchange Request',
            message: `${returnRequest.customerName} submitted a ${returnType} request for order ${returnRequest.orderNumber}`,
            type: 'return_request',
            orderId: orderId,
            requestId: result.insertedId,
            customerName: returnRequest.customerName,
            customerEmail: returnRequest.customerEmail,
            orderNumber: returnRequest.orderNumber,
            returnType: returnType,
            reason: reason,
            read: false,
            createdAt: new Date(),
            priority: 'medium'
        };

        await staffNotificationsCollection.insertOne(notification);
        console.log(`🔔 Staff notification created for return request: ${notification.id}`);

        res.json({
            success: true,
            message: "Return/exchange request submitted successfully",
            requestId: result.insertedId,
            status: 'pending_review'
        });

    } catch (error) {
        console.error("❌ Error processing return request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit return request",
            error: error.message
        });
    }
});

// API endpoint to submit cancellation request from order history
app.post('/api/orders/cancel-request', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const {
            orderId,
            reason,
            additionalComments
        } = req.body;

        console.log('🚫 Processing cancellation request:', {
            orderId,
            reason,
            additionalComments: additionalComments?.substring(0, 50) + '...'
        });

        if (!orderId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: orderId and reason"
            });
        }

        const database = client.db("MyProductsDb");

        // Find the original order in any collection
        const collections = [
            { name: 'PendingOrders', collection: database.collection("PendingOrders") },
            { name: 'AcceptedOrders', collection: database.collection("AcceptedOrders") }
        ];

        let originalOrder = null;
        let sourceCollection = null;

        for (const { name, collection } of collections) {
            originalOrder = await collection.findOne({ _id: new ObjectId(orderId) });
            if (originalOrder) {
                sourceCollection = { name, collection };
                break;
            }
        }

        if (!originalOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found or cannot be cancelled"
            });
        }

        // Check if order can be cancelled (only pending and accepted orders)
        const currentStatus = originalOrder.status || 'pending';
        if (!['pending', 'active', 'approved'].includes(currentStatus.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled at this stage"
            });
        }

        // Create cancellation request record
        const cancellationRequest = {
            originalOrderId: orderId,
            orderNumber: originalOrder.orderNumber || `ORD-${orderId.slice(-6)}`,
            customerName: originalOrder.fullName || originalOrder.buyerinfo || 'N/A',
            customerEmail: originalOrder.email || 'N/A',
            customerPhone: originalOrder.phoneNumber || 'N/A',
            reason: reason,
            additionalComments: additionalComments || '',
            originalOrderTotal: originalOrder.total || 0,
            originalOrderDate: originalOrder.orderDate || originalOrder.createdAt,
            originalOrderStatus: currentStatus,
            status: 'pending_review', // pending_review, approved, rejected, processed
            submittedAt: new Date(),
            submittedBy: 'customer',
            sourceCollection: sourceCollection.name
        };

        // Save cancellation request to CancellationRequests collection
        const cancellationRequestsCollection = database.collection("CancellationRequests");
        const result = await cancellationRequestsCollection.insertOne(cancellationRequest);

        console.log(`✅ Cancellation request saved with ID: ${result.insertedId}`);

        // Create staff notification for new cancellation request
        const staffNotificationsCollection = database.collection("StaffNotifications");
        const notification = {
            id: `cancel_${result.insertedId}_${Date.now()}`,
            title: '🚫 New Cancellation Request',
            message: `${cancellationRequest.customerName} requested to cancel order ${cancellationRequest.orderNumber}`,
            type: 'cancellation_request',
            orderId: orderId,
            requestId: result.insertedId,
            customerName: cancellationRequest.customerName,
            customerEmail: cancellationRequest.customerEmail,
            orderNumber: cancellationRequest.orderNumber,
            reason: reason,
            read: false,
            createdAt: new Date(),
            priority: 'high'
        };

        await staffNotificationsCollection.insertOne(notification);
        console.log(`🔔 Staff notification created for cancellation request: ${notification.id}`);

        res.json({
            success: true,
            message: "Cancellation request submitted successfully",
            requestId: result.insertedId,
            status: 'pending_review'
        });

    } catch (error) {
        console.error("❌ Error processing cancellation request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit cancellation request",
            error: error.message
        });
    }
});

// API endpoint to get return requests for staff review
app.get('/api/orders/return-requests', async (req, res) => {
    try {
        console.log('📋 Fetching return requests for staff review');

        const database = client.db("MyProductsDb");
        const returnRequestsCollection = database.collection("ReturnRequests");

        const returnRequests = await returnRequestsCollection.find({})
            .sort({ submittedAt: -1 })
            .toArray();

        console.log(`✅ Found ${returnRequests.length} return requests`);

        res.json({
            success: true,
            count: returnRequests.length,
            returnRequests: returnRequests
        });

    } catch (error) {
        console.error("❌ Error fetching return requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch return requests",
            error: error.message
        });
    }
});

// API endpoint to get cancellation requests for staff review
app.get('/api/orders/cancellation-requests', async (req, res) => {
    try {
        console.log('📋 Fetching cancellation requests for staff review');

        const database = client.db("MyProductsDb");
        const cancellationRequestsCollection = database.collection("CancellationRequests");

        const cancellationRequests = await cancellationRequestsCollection.find({})
            .sort({ submittedAt: -1 })
            .toArray();

        console.log(`✅ Found ${cancellationRequests.length} cancellation requests`);

        res.json({
            success: true,
            count: cancellationRequests.length,
            cancellationRequests: cancellationRequests
        });

    } catch (error) {
        console.error("❌ Error fetching cancellation requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cancellation requests",
            error: error.message
        });
    }
});

// API endpoint to process return request (approve/reject)
app.put('/api/orders/return-request/:requestId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { requestId } = req.params;
        const { action, staffNotes } = req.body; // action: 'approve' or 'reject'

        console.log(`🔄 Processing return request ${requestId} with action: ${action}`);

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'approve' or 'reject'"
            });
        }

        const database = client.db("MyProductsDb");
        const returnRequestsCollection = database.collection("ReturnRequests");

        // Find the return request
        const returnRequest = await returnRequestsCollection.findOne({ _id: new ObjectId(requestId) });

        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found"
            });
        }

        // Update the return request status
        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            processedAt: new Date(),
            processedBy: 'staff',
            staffNotes: staffNotes || ''
        };

        await returnRequestsCollection.updateOne(
            { _id: new ObjectId(requestId) },
            { $set: updateData }
        );

        // If approved, move the original order to ReturnedOrders collection
        if (action === 'approve') {
            // Find and move the original order to ReturnedOrders
            const collections = [
                { name: 'DeliveredOrders', collection: database.collection("DeliveredOrders") },
                { name: 'AcceptedOrders', collection: database.collection("AcceptedOrders") }
            ];

            for (const { collection } of collections) {
                const originalOrder = await collection.findOne({ _id: new ObjectId(returnRequest.originalOrderId) });
                if (originalOrder) {
                    // Move to ReturnedOrders
                    const returnedOrder = {
                        ...originalOrder,
                        returnReason: returnRequest.reason,
                        returnType: returnRequest.returnType,
                        returnImage: returnRequest.returnImage,
                        returnedAt: new Date(),
                        returnProcessedBy: 'staff',
                        returnRequestId: requestId
                    };

                    delete returnedOrder._id; // Remove _id for new document

                    const returnedCollection = database.collection("ReturnedOrders");
                    await returnedCollection.insertOne(returnedOrder);

                    // Remove from original collection
                    await collection.deleteOne({ _id: new ObjectId(returnRequest.originalOrderId) });

                    console.log(`✅ Order moved to ReturnedOrders collection`);
                    break;
                }
            }
        }

        console.log(`✅ Return request ${requestId} ${action}d successfully`);

        res.json({
            success: true,
            message: `Return request ${action}d successfully`,
            status: updateData.status
        });

    } catch (error) {
        console.error("❌ Error processing return request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process return request",
            error: error.message
        });
    }
});

// API endpoint to process cancellation request (approve/reject)
app.put('/api/orders/cancellation-request/:requestId', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { requestId } = req.params;
        const { action, staffNotes } = req.body; // action: 'approve' or 'reject'

        console.log(`🔄 Processing cancellation request ${requestId} with action: ${action}`);

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'approve' or 'reject'"
            });
        }

        const database = client.db("MyProductsDb");
        const cancellationRequestsCollection = database.collection("CancellationRequests");

        // Find the cancellation request
        const cancellationRequest = await cancellationRequestsCollection.findOne({ _id: new ObjectId(requestId) });

        if (!cancellationRequest) {
            return res.status(404).json({
                success: false,
                message: "Cancellation request not found"
            });
        }

        // Update the cancellation request status
        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            processedAt: new Date(),
            processedBy: 'staff',
            staffNotes: staffNotes || ''
        };

        await cancellationRequestsCollection.updateOne(
            { _id: new ObjectId(requestId) },
            { $set: updateData }
        );

        // If approved, move the original order to CancelledOrders collection
        if (action === 'approve') {
            // Find and move the original order to CancelledOrders
            const collections = [
                { name: 'PendingOrders', collection: database.collection("PendingOrders") },
                { name: 'AcceptedOrders', collection: database.collection("AcceptedOrders") }
            ];

            for (const { collection } of collections) {
                const originalOrder = await collection.findOne({ _id: new ObjectId(cancellationRequest.originalOrderId) });
                if (originalOrder) {
                    // Move to CancelledOrders
                    const cancelledOrder = {
                        ...originalOrder,
                        cancellationReason: cancellationRequest.reason,
                        cancelledAt: new Date(),
                        cancellationProcessedBy: 'staff',
                        cancellationRequestId: requestId
                    };

                    delete cancelledOrder._id; // Remove _id for new document

                    const cancelledCollection = database.collection("CancelledOrders");
                    await cancelledCollection.insertOne(cancelledOrder);

                    // Remove from original collection
                    await collection.deleteOne({ _id: new ObjectId(cancellationRequest.originalOrderId) });

                    console.log(`✅ Order moved to CancelledOrders collection`);
                    break;
                }
            }
        }

        console.log(`✅ Cancellation request ${requestId} ${action}d successfully`);

        res.json({
            success: true,
            message: `Cancellation request ${action}d successfully`,
            status: updateData.status
        });

    } catch (error) {
        console.error("❌ Error processing cancellation request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process cancellation request",
            error: error.message
        });
    }
});

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sanricomercantileofficial@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use environment variable for security
    }
});

// Send verification email endpoint
app.post('/api/auth/send-verification', async (req, res) => {
    try {
        const { email, code, fromEmail } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and verification code are required' 
            });
        }
        
        const mailOptions = {
            from: fromEmail || 'sanricomercantileofficial@gmail.com',
            to: email,
            subject: 'Verify Your Email - Sanrico Mercantile Inc.',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                        .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 40px 20px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                        .content { padding: 40px 20px; text-align: center; }
                        .verification-code { background: #f8f9fa; border: 2px dashed #3498db; border-radius: 8px; padding: 20px; margin: 30px 0; font-size: 36px; font-weight: bold; color: #2c3e50; letter-spacing: 8px; }
                        .footer { background: #2c3e50; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; color: #856404; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Email Verification</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome to Sanrico Mercantile Inc.!</h2>
                            <p>Thank you for creating an account with us. To complete your registration, please enter the verification code below:</p>
                            
                            <div class="verification-code">${code}</div>
                            
                            <p>Enter this code on the verification page to activate your account.</p>
                            
                            <div class="warning">
                                <strong>Security Notice:</strong><br>
                                • This code expires in 15 minutes<br>
                                • Never share this code with anyone<br>
                                • If you didn't request this, please ignore this email
                            </div>
                            
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Sanrico Mercantile Inc. All rights reserved.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        await emailTransporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'Verification email sent successfully' 
        });
        
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification email' 
        });
    }
});

// Create and store verification code in AuthCodes collection
app.post('/api/auth/create-verification-code', async (req, res) => {
    try {
        const { email, userName } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        // Generate 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);
        
        const database = client.db("MyProductsDb");
        const authCodesCollection = database.collection("AuthCodes");
        
        // Check if there's an existing code for this email
        await authCodesCollection.deleteMany({ email: email.toLowerCase() });
        
        // Create new verification code entry
        const codeEntry = {
            email: email.toLowerCase(),
            verificationCode: verificationCode,
            userName: userName || '',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
            used: false,
            attempts: 0,
            maxAttempts: 5
        };
        
        const result = await authCodesCollection.insertOne(codeEntry);
        
        if (result.insertedId) {
            console.log(`✅ Verification code saved to AuthCodes collection for ${email}`);
            
            res.json({ 
                success: true, 
                message: 'Verification code created successfully',
                codeId: result.insertedId,
                verificationCode: verificationCode // For immediate email sending
            });
        } else {
            throw new Error('Failed to save verification code');
        }
        
    } catch (error) {
        console.error('Error creating verification code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create verification code' 
        });
    }
});

// Send verification email endpoint via n8n webhook
app.post('/api/auth/send-verification-email', async (req, res) => {
    try {
        const { email, userName, verificationCode, code } = req.body;
        
        // Use either 'code' or 'verificationCode' parameter
        const finalCode = code || verificationCode;
        
        if (!email || !finalCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and verification code are required' 
            });
        }
        
        console.log(`📧 Sending verification email via n8n for ${email}`);
        console.log(`📊 Data being sent to n8n:`, {
            to: email,
            verificationCode: finalCode,
            userName: userName || '',
            type: 'verification'
        });
        
        // Send email via n8n webhook
        const n8nResponse = await fetch('http://localhost:5678/webhook/send-verification-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email,
                verificationCode: finalCode,
                userName: userName || '',
                type: 'verification'
            })
        });
        
        if (!n8nResponse.ok) {
            console.error('❌ n8n webhook failed:', n8nResponse.status);
            throw new Error('Email service temporarily unavailable');
        }
        
        const n8nResult = await n8nResponse.json();
        console.log('✅ Email sent successfully via n8n:', n8nResult);
        
        res.json({ 
            success: true, 
            message: 'Verification email sent successfully' 
        });
        
    } catch (error) {
        console.error('❌ Email sending error:', error);
        
        // No fallback - force n8n only
        console.error('❌ N8N webhook failed. Error details:', error.message);
        
        res.status(500).json({ 
            success: false, 
            message: 'Email service unavailable. Please ensure n8n workflow is active and try again.' 
        });
    }
});

// Verify code from AuthCodes collection
app.post('/api/auth/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and verification code are required' 
            });
        }
        
        const database = client.db("MyProductsDb");
        const authCodesCollection = database.collection("AuthCodes");
        
        // Find the verification code entry
        const codeEntry = await authCodesCollection.findOne({ 
            email: email.toLowerCase(),
            used: false
        });
        
        if (!codeEntry) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid verification code found for this email' 
            });
        }
        
        // Check if code has expired
        if (new Date() > codeEntry.expiresAt) {
            await authCodesCollection.updateOne(
                { _id: codeEntry._id },
                { $set: { used: true, expiredAt: new Date() } }
            );
            return res.status(400).json({ 
                success: false, 
                message: 'Verification code has expired. Please request a new one.' 
            });
        }
        
        // Check if max attempts reached
        if (codeEntry.attempts >= codeEntry.maxAttempts) {
            await authCodesCollection.updateOne(
                { _id: codeEntry._id },
                { $set: { used: true, maxAttemptsReached: true } }
            );
            return res.status(400).json({ 
                success: false, 
                message: 'Maximum verification attempts exceeded. Please request a new code.' 
            });
        }
        
        // Verify the code
        if (String(codeEntry.verificationCode) !== String(code)) {
            // Increment attempts
            await authCodesCollection.updateOne(
                { _id: codeEntry._id },
                { $inc: { attempts: 1 } }
            );
            
            const remainingAttempts = codeEntry.maxAttempts - (codeEntry.attempts + 1);
            return res.status(400).json({ 
                success: false, 
                message: `Invalid verification code. ${remainingAttempts} attempts remaining.` 
            });
        }
        
        // Code is valid - mark as used
        await authCodesCollection.updateOne(
            { _id: codeEntry._id },
            { 
                $set: { 
                    used: true, 
                    verifiedAt: new Date(),
                    successful: true
                } 
            }
        );
        
        console.log(`✅ Verification code verified successfully for ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Verification code verified successfully',
            userName: codeEntry.userName
        });
        
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify code' 
        });
    }
});

// Check email existence endpoint
app.post('/api/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        // Check if email exists in UserCredentials collection
        const db = await connectToDatabase();
        const existingUser = await db.collection('UserCredentials').findOne({ email: email.toLowerCase() });
        
        res.json({ 
            success: true, 
            exists: !!existingUser 
        });
        
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking email' 
        });
    }
});

// Invalidate all verification codes for an email (cancel registration)
app.post('/api/auth/invalidate-codes', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        const db = await connectToDatabase();
        const authCodesCollection = db.collection('AuthCodes');
        
        // Mark all active codes for this email as used/invalid
        const result = await authCodesCollection.updateMany(
            { 
                email: email.toLowerCase(),
                used: false,
                expiresAt: { $gt: new Date() }
            },
            { 
                $set: { 
                    used: true,
                    cancelledAt: new Date(),
                    cancelled: true
                } 
            }
        );
        
        console.log(`✅ Invalidated ${result.modifiedCount} verification codes for ${email}`);
        
        res.json({ 
            success: true, 
            message: 'All verification codes invalidated',
            invalidatedCount: result.modifiedCount
        });
        
    } catch (error) {
        console.error('Error invalidating codes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error invalidating verification codes' 
        });
    }
});

// Complete registration endpoint (after email verification)
app.post('/api/auth/complete-registration', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        
        if (!fullname || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        const db = await connectToDatabase();
        
        // Check if user already exists in UserCredentials collection
        const existingUser = await db.collection('UserCredentials').findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        
        // Hash password for security
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user credentials object for UserCredentials collection
        const userCredentials = {
            fullName: fullname,
            email: email.toLowerCase(),
            password: hashedPassword,
            emailVerified: true,
            registrationDate: new Date(),
            lastUpdated: new Date(),
            status: 'active',
            verificationCompletedAt: new Date()
        };
        
        // Save to UserCredentials collection (only after successful verification)
        const result = await db.collection('UserCredentials').insertOne(userCredentials);
        
        if (result.insertedId) {
            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: result.insertedId, 
                    email: userCredentials.email,
                    fullName: userCredentials.fullName,
                    verified: true
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );
            
            // Log successful registration
            console.log(`✅ New user registered and verified: ${userCredentials.email} at ${new Date().toISOString()}`);
            
            // Return success response
            res.status(201).json({
                success: true,
                message: 'Account created and verified successfully',
                token: token,
                user: {
                    id: result.insertedId,
                    fullName: userCredentials.fullName,
                    email: userCredentials.email,
                    emailVerified: true,
                    registrationDate: userCredentials.registrationDate,
                    status: userCredentials.status
                }
            });
        } else {
            throw new Error('Failed to save user credentials');
        }
        
    } catch (error) {
        console.error('❌ Registration completion error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to complete registration' 
        });
    }
});

// User login endpoint - Updated to use UserCredentials collection
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        const db = await connectToDatabase();
        
        // Find user in UserCredentials collection
        const user = await db.collection('UserCredentials').findOne({ 
            email: email.toLowerCase() 
        });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is not active' 
            });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email before logging in' 
            });
        }
        
        // Update last login time
        await db.collection('UserCredentials').updateOne(
            { _id: user._id },
            { 
                $set: { 
                    lastLogin: new Date(),
                    lastUpdated: new Date()
                }
            }
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                fullName: user.fullName,
                verified: user.emailVerified
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        // Log successful login
        console.log(`✅ User logged in: ${user.email} at ${new Date().toISOString()}`);
        
        // Return success response (don't include password)
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                emailVerified: user.emailVerified,
                registrationDate: user.registrationDate,
                lastLogin: new Date(),
                status: user.status
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed. Please try again.' 
        });
    }
});

// API endpoint to get staff notifications
app.get('/api/staff/notifications', async (req, res) => {
    try {
        console.log('🔔 Fetching staff notifications');

        const database = client.db("MyProductsDb");
        const staffNotificationsCollection = database.collection("StaffNotifications");

        // Get all unread notifications, sorted by creation date (newest first)
        const notifications = await staffNotificationsCollection.find({ read: false })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`✅ Found ${notifications.length} unread staff notifications`);

        res.json({
            success: true,
            count: notifications.length,
            notifications: notifications
        });

    } catch (error) {
        console.error("❌ Error fetching staff notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch staff notifications",
            error: error.message
        });
    }
});

// API endpoint to mark staff notification as read
app.put('/api/staff/notifications/:notificationId/read', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { notificationId } = req.params;

        console.log(`📖 Marking notification ${notificationId} as read`);

        const database = client.db("MyProductsDb");
        const staffNotificationsCollection = database.collection("StaffNotifications");

        const result = await staffNotificationsCollection.updateOne(
            { _id: new ObjectId(notificationId) },
            { $set: { read: true, readAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        console.log(`✅ Notification ${notificationId} marked as read`);

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
            error: error.message
        });
    }
});

// API endpoint to get all staff notifications (for history)
app.get('/api/staff/notifications/all', async (req, res) => {
    try {
        console.log('📋 Fetching all staff notifications');

        const database = client.db("MyProductsDb");
        const staffNotificationsCollection = database.collection("StaffNotifications");

        // Get all notifications, sorted by creation date (newest first)
        const notifications = await staffNotificationsCollection.find({})
            .sort({ createdAt: -1 })
            .limit(100) // Limit to last 100 notifications
            .toArray();

        console.log(`✅ Found ${notifications.length} total staff notifications`);

        res.json({
            success: true,
            count: notifications.length,
            notifications: notifications
        });

    } catch (error) {
        console.error("❌ Error fetching all staff notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch all staff notifications",
            error: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    connectToMongo();
});
