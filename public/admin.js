
const statusColors = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red'
};

document.addEventListener("DOMContentLoaded", function () {
    // Image preview functionality
    const imageFile = document.getElementById('imageFile');
    const previewImage = document.getElementById('previewImage');

    if (imageFile && previewImage) {
        imageFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file');
                previewImage.style.display = 'none';
                previewImage.src = '#';
            }
        });
    }

    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Get form data
            const title = document.getElementById('title').value.trim();
            const author = document.getElementById('author').value.trim();
            const price = document.getElementById('price').value.trim();
            const imageFile = document.getElementById('imageFile').files[0];
            const shortDescription = document.getElementById('shortDescription').value.trim();
            const fullDescription = document.getElementById('fullDescription').value.trim();

            // Validate form data
            if (!title || !author || !price) {
                alert('Please fill in title, author, and price');
                return;
            }

            if (isNaN(price) || parseFloat(price) <= 0) {
                alert('Please enter a valid positive price');
                return;
            }

            // Only require image for new products
            if (!this.dataset.productId && !imageFile) {
                alert('Please select an image for new products');
                return;
            }

            try {
                let response;
                const productId = this.dataset.productId;

                // Handle image upload if new image is selected
                let imagePath;
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('imageFile', imageFile);

                    const imageResponse = await fetch('/api/admin/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    if (!imageResponse.ok) {
                        throw new Error('Failed to upload image');
                    }

                    const imageData = await imageResponse.json();
                    imagePath = imageData.path;
                } else if (this.dataset.productId) {
                    // Use existing image path when editing and no new image is uploaded
                    imagePath = this.dataset.existingImage;
                }

                // Prepare product data
                const productData = {
                    title,
                    author,
                    price: parseFloat(price),
                    image: imagePath, // This will be undefined if no new image was uploaded
                    shortDescription,
                    fullDescription
                };

                // Remove undefined fields
                Object.keys(productData).forEach(key => {
                    if (productData[key] === undefined) {
                        delete productData[key];
                    }
                });

                if (productId) { // Update existing product
                    response = await fetch(`/api/admin/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                } else { // Add new product
                    response = await fetch('/api/admin/products', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                }

                const data = await response.json();

                if (response.ok) {
                    alert(productId ? 'Product updated successfully' : 'Product added successfully');
                    this.reset();
                    if (previewImage) {
                        previewImage.style.display = 'none';
                        previewImage.src = '#';
                    }
                    this.dataset.productId = '';
                    this.querySelector('input[type="submit"]').value = 'Add Product';
                    loadItems();
                } else {
                    alert(data.message || 'Error saving product');
                    console.error('Server response:', data);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error saving product. Please check the console for details.');
            }
        });
    }

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const productId = this.dataset.id;
            const item = items.find(i => i._id === productId);

            if (item) {
                // Set form values
                document.getElementById('title').value = item.title;
                document.getElementById('author').value = item.author;
                document.getElementById('price').value = item.price;
                document.getElementById('shortDescription').value = item.shortDescription;
                document.getElementById('fullDescription').value = item.fullDescription;

                // Set image preview
                const previewImage = document.getElementById('previewImage');
                if (previewImage) {
                    previewImage.src = item.image;
                    previewImage.style.display = 'block';
                }

                addItemForm.dataset.productId = productId;
                addItemForm.querySelector('input[type="submit"]').value = 'Update Product';
            }
        });
    });

    // Load items when page loads
    loadItems();

    // Purchase management
    const statusFilter = document.getElementById('statusFilter');
    const searchEmail = document.getElementById('searchEmail');
    const refreshPurchases = document.getElementById('refreshPurchases');

    if (statusFilter) statusFilter.addEventListener('change', () => loadPurchases(statusFilter.value, searchEmail.value));
    if (searchEmail) searchEmail.addEventListener('input', () => loadPurchases(statusFilter.value, searchEmail.value));
    if (refreshPurchases) refreshPurchases.addEventListener('click', () => loadPurchases(statusFilter.value, searchEmail.value));

    // Handle status changes
    document.addEventListener('change', async function (e) {
        if (e.target.classList.contains('status-select')) {
            const purchaseId = e.target.dataset.purchaseId;
            const newStatus = e.target.value;

            try {
                const response = await fetch(`/api/admin/purchases/${purchaseId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Failed to update status');
                }

                // Update UI immediately
                e.target.parentElement.parentElement.parentElement.querySelector('.status-badge').style.backgroundColor =
                    statusColors[newStatus];
                e.target.parentElement.parentElement.parentElement.querySelector('.status-badge').textContent =
                    newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Error updating status. Please try again.');
            }
        }
    });

    // Load purchases when page loads
    loadPurchases();
});
async function loadItems() {
    try {
        const response = await fetch('/api/admin/products');
        const items = await response.json();

        const itemsList = document.getElementById('itemsList');
        if (!itemsList) {
            console.error('Items list container not found');
            return;
        }

        itemsList.innerHTML = '';

        if (items && Array.isArray(items)) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'admin-item';
                itemDiv.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>Author: ${item.author}</p>
                    <p>Price: $${item.price}</p>
                    <div class="stats">
                        <p><strong>Total Sales:</strong> ${item.totalSales || 0}</p>
                    </div>
                    <button class="edit-btn" data-id="${item._id}">Edit</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                `;
                itemsList.appendChild(itemDiv);
            });

            /// Add event listeners for edit buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const productId = this.dataset.id;
                    const item = items.find(i => i._id === productId);

                    if (item) {
                        // Set form values
                        document.getElementById('title').value = item.title;
                        document.getElementById('author').value = item.author;
                        document.getElementById('price').value = item.price;
                        document.getElementById('shortDescription').value = item.shortDescription;
                        document.getElementById('fullDescription').value = item.fullDescription;

                        // Set image preview
                        const previewImage = document.getElementById('previewImage');
                        if (previewImage) {
                            previewImage.src = item.image;
                            previewImage.style.display = 'block';
                        }

                        // Store the existing image path
                        addItemForm.dataset.existingImage = item.image;

                        addItemForm.dataset.productId = productId;
                        addItemForm.querySelector('input[type="submit"]').value = 'Update Product';
                    }
                });
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    if (confirm('Are you sure you want to delete this product?')) {
                        const productId = this.dataset.id;

                        try {
                            const response = await fetch(`/api/admin/products/${productId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            const data = await response.json();

                            if (response.ok) {
                                alert('Product deleted successfully');
                                loadItems(); // Refresh the list
                            } else {
                                alert(data.message || 'Error deleting product');
                            }
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            alert('Error deleting product. Please try again.');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Error loading items. Please try again.');
    }
}

// Add this function to load purchases
async function loadPurchases(status = 'all', email = '') {
    try {
        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (email) params.append('email', email);

        const response = await fetch(`/api/admin/purchases?${params.toString()}`);
        const purchases = await response.json();

        const purchasesList = document.getElementById('purchasesList');
        if (!purchasesList) {
            console.error('Purchases list container not found');
            return;
        }

        purchasesList.innerHTML = '';

        if (purchases && Array.isArray(purchases)) {
            purchases.forEach(purchase => {
                const purchaseDiv = document.createElement('div');
                purchaseDiv.className = 'purchase-item';
                purchaseDiv.innerHTML = `
                    <div class="purchase-header">
                        <h3>Order #${purchase._id}</h3>
                        <span class="status-badge" style="background-color: ${statusColors[purchase.status]}">
                            ${purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                    </div>
                    <div class="purchase-details">
                        <div class="customer-info">
                            <p><strong>Customer:</strong> ${purchase.customer.name}</p>
                            <p><strong>Email:</strong> ${purchase.customer.email}</p>
                        </div>
                        <div class="product-info">
                            <p><strong>Product:</strong> ${purchase.product.title}</p>
                            <p><strong>Quantity:</strong> ${purchase.quantity}</p>
                            <p><strong>Total Amount:</strong> $${purchase.totalAmount.toFixed(2)}</p>
                        </div>
                        <div class="purchase-actions">
                            <select class="status-select" data-purchase-id="${purchase._id}">
                                <option value="pending" ${purchase.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${purchase.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="cancelled" ${purchase.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </div>
                `;
                purchasesList.appendChild(purchaseDiv);
            });
        }
    } catch (error) {
        console.error('Error loading purchases:', error);
        alert('Error loading purchases. Please try again.');
    }
}


