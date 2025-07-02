document.addEventListener("DOMContentLoaded", function () {
    const url = window.location.pathname;
    const bookId = url.substring(url.lastIndexOf('/') + 1).replace('.html', '').replace('book-', '');

    // Function to load book details
    async function loadBookDetails() {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            const book = await response.json();

            if (book) {
                // Display book details
                const bookDetails = document.getElementById('book-info');
                if (bookDetails) {
                    bookDetails.innerHTML = `
                        <h1>${book.title}</h1>
                        <img src="${book.image}" alt="${book.title}">
                        <h2>Brief Description</h2>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p>${book.shortDescription || 'No brief description available'}</p>
                        <h2>Full Description</h2>
                        <p>${book.fullDescription || 'No full description available'}</p>
                        <h2>Price: $${book.price}</h2>
                    `;
                }

                // Initialize purchase form
                const purchaseForm = document.getElementById('purchaseForm');
                if (purchaseForm) {
                    // Set product ID and price as data attributes
                    purchaseForm.dataset.productId = bookId;
                    purchaseForm.dataset.productPrice = book.price;

                    // Update total amount when quantity changes
                    const quantityInput = document.getElementById('quantity');
                    const totalAmountSpan = document.getElementById('totalAmount');

                    function updateTotalAmount() {
                        const quantity = parseInt(quantityInput.value) || 1;
                        const price = parseFloat(purchaseForm.dataset.productPrice);
                        const total = (price * quantity).toFixed(2);
                        totalAmountSpan.textContent = `$${total}`;
                    }

                    // Initial update
                    updateTotalAmount();

                    // Update on quantity change
                    quantityInput.addEventListener('change', updateTotalAmount);
                    quantityInput.addEventListener('input', updateTotalAmount);

                    purchaseForm.addEventListener('submit', async function (event) {
                        event.preventDefault();

                        const formData = {
                            product: bookId,
                            customer: {
                                name: document.getElementById('name').value.trim(),
                                email: document.getElementById('email').value.trim()
                            },
                            quantity: parseInt(document.getElementById('quantity').value) || 1
                        };

                        try {
                            const response = await fetch('/api/purchases', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            });

                            const data = await response.json();

                            if (response.ok) {
                                // Redirect to confirmation page with purchase ID
                                window.location.href = `/confirmation.html?purchaseId=${data.purchase._id}`;
                            } else {
                                alert(data.message || 'Error processing purchase');
                                console.error('Server response:', data);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            alert('Error processing purchase. Please try again.');
                        }
                    });
                }

                // Load and display reviews
                const reviewsContainer = document.getElementById('reviewsContainer');
                if (reviewsContainer) {
                    reviewsContainer.innerHTML = `
                        <h2>User Reviews</h2>
                        <div id="reviewsList"></div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading book details:', error);
            const bookDetails = document.getElementById('book-info');
            if (bookDetails) {
                bookDetails.innerHTML = '<p>Error loading book details. Please try again later.</p>';
            }
        }
    }

    // Function to load and display reviews
    async function loadReviews() {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            const book = await response.json();

            if (book && Array.isArray(book.reviews)) {
                const reviewsList = document.getElementById('reviewsList');
                if (reviewsList) {
                    reviewsList.innerHTML = '';
                    book.reviews.forEach((review, index) => {
                        const reviewDiv = document.createElement('div');
                        reviewDiv.className = 'review';
                        reviewDiv.innerHTML = `
                            <p>${review}</p>
                        `;
                        reviewsList.appendChild(reviewDiv);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    // Load book details and reviews when page loads
    loadBookDetails();
    loadReviews();
});