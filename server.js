const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');
const Purchase = require('./models/Purchase');

const app = express();
const PORT = 3000;

const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/products/assets');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookstore')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// User routes
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Add new product
app.post('/api/admin/products', async (req, res) => {
    try {
        const { title, author, price, image, shortDescription, fullDescription } = req.body;

        // Validate input
        if (!title || !author || !price || !image || !shortDescription || !fullDescription) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert price to decimal
        const decimalPrice = new mongoose.Types.Decimal128(price.toString());

        const product = new Product({
            title,
            author,
            price: decimalPrice,
            image,
            shortDescription,
            fullDescription
        });

        await product.save();
        res.json({ message: 'Product added successfully', product: product });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            message: 'Error adding product', 
            error: error.message 
        });
    }
});

// Update a product
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { title, author, price, image, shortDescription, fullDescription } = req.body;

        // Validate input
        if (!title || !author || !price || !image || !shortDescription || !fullDescription) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert price to decimal
        const decimalPrice = new mongoose.Types.Decimal128(price.toString());

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.title = title;
        product.author = author;
        product.price = decimalPrice;
        product.image = image;
        product.shortDescription = shortDescription;
        product.fullDescription = fullDescription;

        await product.save();
        res.json({ message: 'Product updated successfully', product: product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            message: 'Error updating product', 
            error: error.message 
        });
    }
});

// Get all products
app.get('/api/admin/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Delete a product
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        // First check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

app.get('/api/books', async (req, res) => {
    try {
        const books = await Product.find({});
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Product.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Error fetching book' });
    }
});

app.get('/products/book-:id.html', (req, res) => {
    const id = req.params.id;
    res.sendFile(path.join(__dirname, 'public', 'products', 'book-template.html'));
});

app.post('/api/books/:id/reviews', async (req, res) => {
    try {
        const { review } = req.body;
        const bookId = req.params.id;

        // Remove "book-" prefix if it exists
        const cleanId = bookId.replace('book-', '');

        // Validate review text
        if (!review || typeof review !== 'string' || review.trim() === '') {
            return res.status(400).json({ message: 'Review text is required and must be a string' });
        }

        const book = await Product.findById(cleanId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Trim and sanitize the review text
        const sanitizedReview = review.trim();

        book.reviews.push(sanitizedReview);
        await book.save();

        res.json({ message: 'Review added successfully', review: sanitizedReview });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

// Add new purchase
app.post('/api/purchases', async (req, res) => {
    try {
        const { product, customer, quantity } = req.body;

        // Validate input
        if (!product || !customer || !quantity) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Remove "book-" prefix if it exists
        const cleanProductId = product.replace('book-', '');

        // Find the product
        const productData = await Product.findById(cleanProductId);
        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Calculate total amount
        const price = parseFloat(productData.price);
        const totalAmount = price * quantity;

        // Create purchase
        const purchase = new Purchase({
            product: cleanProductId,
            customer,
            quantity,
            totalAmount,
            purchaseDate: new Date()
        });

        await purchase.save();

        // Update product statistics
        productData.totalSales += quantity;
        await productData.save();

        res.status(201).json({ 
            message: 'Purchase recorded successfully',
            purchase: purchase
        });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ 
            message: 'Error recording purchase', 
            error: error.message 
        });
    }
});

// Get purchase details by ID
app.get('/api/purchases/:id', async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate('product', 'title author price');
        
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        res.json(purchase);
    } catch (error) {
        console.error('Error fetching purchase details:', error);
        res.status(500).json({ 
            message: 'Error fetching purchase details', 
            error: error.message 
        });
    }
});
// Get purchase history with filters
app.get('/api/admin/purchases', async (req, res) => {
    try {
        const { status, email } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query['status'] = status;
        }

        if (email) {
            query['customer.email'] = email;
        }

        const purchases = await Purchase.find(query)
            .populate('product', 'title author price')
            .sort('-purchaseDate');

        res.json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ message: 'Error fetching purchases' });
    }
});

// Update purchase status
app.put('/api/admin/purchases/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        purchase.status = status;
        await purchase.save();

        res.json({ message: 'Status updated successfully', purchase });
    } catch (error) {
        console.error('Error updating purchase status:', error);
        res.status(500).json({ message: 'Error updating purchase status' });
    }
});

// Create image upload endpoint
app.post('/api/admin/upload-image', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Return the path where the image was saved
        res.json({
            path: `/products/assets/${req.file.filename}`,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
})

// Serve uploaded images
app.use('/products/assets', express.static('public/products/assets'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});