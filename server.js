const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Connect to MongoDB Atlas using an Environment Variable for security
// If the variable isn't set yet, it will fallback to a local database for testing
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clothing-shop';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Permanent Cloud Database Connected Successfully!'))
    .catch(err => console.error('❌ Database Connection Failure:', err));

// 2. Define the structural blueprint (Schema) for saving automated location orders
const OrderSchema = new mongoose.Schema({
    product: String,
    customerName: String,
    phone: String,
    latitude: Number,
    longitude: Number,
    timestamp: { type: String, default: () => new Date().toLocaleString() }
});

const Order = mongoose.model('Order', OrderSchema);

// 3. API Endpoint to capture and save the incoming GPS order details
app.post('/submit-order', async (req, res) => {
    try {
        const { product, customerName, phone, latitude, longitude, timestamp } = req.body;

        // Create a new database entry
        const newOrder = new Order({
            product,
            customerName,
            phone,
            latitude,
            longitude,
            timestamp
        });

        // Save permanently to the cloud cluster
        await newOrder.save();
        console.log(`📦 Order saved to cloud database for customer: ${customerName}`);
        res.status(200).send("Order recorded successfully");
    } catch (err) {
        console.error("Failed to write to cloud database:", err);
        res.status(500).send("Database record failure.");
    }
});

// 4. Admin View Dashboard Panel to cleanly read the stored coordinates
app.get('/admin/view-orders', async (req, res) => {
    try {
        // Retrieve all records from the database, newest first
        const orders = await Order.find().sort({ _id: -1 });

        let htmlOutput = `
            <html>
            <head>
                <title>Automated Order Location Control Panel</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; color: #333; padding: 2rem; }
                    h1 { color: #7f00ff; border-bottom: 3px solid #ff007f; padding-bottom: 10px; margin-bottom: 20px; }
                    .order-card { background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 20px; margin-bottom: 20px; font-size: 1.05rem; border-left: 6px solid #007bff; }
                    .order-header { display: flex; justify-content: space-between; font-weight: bold; color: #555; margin-bottom: 10px; font-size: 0.9rem; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
                    pre { background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #eee; font-family: monospace; white-space: pre-wrap; font-size: 1.1rem; color:#222; margin: 0; }
                    .maps-btn { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 15px; font-size: 0.95rem; box-shadow: 0 4px 10px rgba(40,167,69,0.3); }
                    .maps-btn:hover { background: #218838; }
                </style>
            </head>
            <body>
                <h1>📋 Live COD Orders Control Center (Cloud Database Storage)</h1>
                <p>Total Automated Orders Captured: <strong>${orders.length}</strong></p>
        `;

        if (orders.length === 0) {
            htmlOutput += `<h2 style='text-align:center; color:#888; margin-top:50px;'>No custom orders placed yet!</h2>`;
        }

        orders.forEach(order => {
            const googleMapsLink = `https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
            
            htmlOutput += `
                <div class="order-card">
                    <div class="order-header">
                        <span>📄 Database Record ID: ${order._id}</span>
                        <span style="color: #28a745;">STORAGE STATUS: Permanent Cloud Sync</span>
                    </div>
                    <pre>
--- NEW AUTOMATED LOCATION COD ORDER ---
Timestamp       : ${order.timestamp}
Item Purchased  : ${order.product}
Price Total     : ₹100 (COD Available)
Customer Name   : ${order.customerName}
Mobile Phone    : ${order.phone}
Auto Latitude   : ${order.latitude}
Auto Longitude  : ${order.longitude}
                    </pre>
                    <a href="${googleMapsLink}" target="_blank" class="maps-btn">📍 Navigate Directly to Customer Door (Google Maps)</a>
                </div>
            `;
        });

        htmlOutput += `</body></html>`;
        res.send(htmlOutput);
    } catch (err) {
        res.status(500).send("Error compiling dashboard from database rows.");
    }
});

app.listen(PORT, () => {
    console.log(`Auto-location server active on port ${PORT}`);
});
