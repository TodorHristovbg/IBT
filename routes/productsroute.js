const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 


router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().lean();
        const formatted = products.map(p => ({
            ...p,
            price: parseFloat(p.price).toFixed(2)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (product) {
      product.price = parseFloat(product.price).toFixed(2);
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/api/products/:id', async (req, res) => {
  try {
    const { title, shortDescription, fullDescription, price } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        shortDescription,
        fullDescription,
        price
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


module.exports = router;