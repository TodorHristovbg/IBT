// DOM Elements
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const booksContainer = document.getElementById('booksContainer');

// Book Functions
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();

        if (books && Array.isArray(books)) {
            booksContainer.innerHTML = '';

            books.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'item';
                bookDiv.innerHTML = `
                    <h2>${book.title}</h2>
                    <img src="${book.image}" alt="${book.title}">
                    <p>Author: ${book.author}</p>
                    <p>Description: ${book.shortDescription || 'No description available'}</p>
                    <p>Price: $${book.price}</p>
                    <a href="/products/book-${book._id}.html">View Details</a>
                `;
                booksContainer.appendChild(bookDiv);
            });
        }
    } catch (error) {
        console.error('Error loading books:', error);
        booksContainer.innerHTML = '<p>Error loading books. Please try again later.</p>';
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {

    // Event Listeners
    if (loginButton) loginButton.addEventListener("click", () => {
        window.location.href = '/login';
    });
    if (registerButton) registerButton.addEventListener("click", () => {
        window.location.href = '/register';
    });

    // Load books when page loads
    loadBooks();
});