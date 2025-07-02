const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const productsRoute = require('./routes/productsroute');
const Product = require('./models/Product'); // Add this line
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(productsRoute);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/item/:id', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'item.html')); // adjust if your HTML is elsewhere
});


// Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb://localhost:27017/mydb', {

}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Example Mongoose schema/model
const userSchema = new mongoose.Schema({

name: {type: String, required: true},
product: {type: String, required: true},
address: {type: String, required: true},
})


const User = mongoose.model('User',userSchema); //WHAT IT DO?


// API route example
app.post('/add-user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
app.post('/add-review', async (req, res) => {
  const { productId, user, feedback } = req.body;
  console.log('Received review:', { productId, user, feedback });
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Ensure reviews array exists
    if (!product.reviews) product.reviews = [];
    product.reviews.push({ user, feedback });
    await product.save();
    res.status(201).json({ message: 'Review added', product });
  } catch (err) {
    console.error('Error saving review:', err); // Log the actual error
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.post('/add-order', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: 'Order saved', order });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().lean();
        const formatted = orders.map(p => ({
            ...p,
            price: parseFloat(p.price).toFixed(2)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});