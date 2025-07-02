const path = window.location.pathname;
const splits = path.split('/');
console.log("Script is running from:",splits[2]);



fetch(`/api/products/${splits[2]}`)
  .then(res => res.json())
  .then(product => {

    const reviewsHtml = product.reviews
  .map(review => `
    <div class="singlereview">
    <p class="user">${review.user}: </p>
    <p class="feedback">${review.feedback}</p>
    </div>
    `)
  .join('');
    
    const container = document.getElementById('singleitem');
    const el = document.createElement('div');
    el.className = `singleproduct`;
    el.innerHTML = `
    <img src="${product.image}" class="itemimage" alt="${product.title}"/>
    <div class="iteminfo">
      <p2 class="title">${product.title}</p2>
      <p class="description">${product.fullDescription}</p>
      <button class="custombutton pagebutton" id="purchase-btn"> Purchase Now ${product.price} </button>
    </div>
    `;
    const Reviews = document.createElement('div');
    Reviews.className = 'reviews';
    Reviews.innerHTML = `
      <h3>Reviews:</h3>
      ${reviewsHtml}
      <form id="review-form" class="singlereview" >
        <input type="text" id="user" placeholder="Your Name" required>
        <textarea id="feedback" placeholder="Your Review" required></textarea>
        <button class="custombutton">Submit Review</button>
    `;
    
    container.appendChild(el);
    container.appendChild(Reviews);

    // Attach the event listener after the form is in the DOM
    document.getElementById('review-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const user = document.getElementById('user').value.trim();
      const feedback = document.getElementById('feedback').value.trim();
      if (!user || !feedback) return;

      fetch(`/add-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId:splits[2], user, feedback })
      })
      .then(res => res.json())
      .then(data => {
        // Add the new review to the reviews section without reloading
        const reviewsContainer = document.querySelector('.reviews');
        const newReview = document.createElement('div');
        newReview.className = 'singlereview';
        newReview.innerHTML = `
          <p class="user">${user}: </p>
          <p class="feedback">${feedback}</p>
        `;
        // Insert before the form
        reviewsContainer.insertBefore(newReview, document.getElementById('review-form'));

        document.getElementById('user').value = '';
        document.getElementById('feedback').value = '';
      })
      .catch(err => {
        alert('Error submitting review.');
        console.error(err);
      });
    });

    // Add event listener for purchase button
    el.querySelector('#purchase-btn').addEventListener('click', function() {
      window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { productId: product._id || product.id || splits[2] } }));
      alert('Added to cart!');
    });
  })
  .catch(err => {
    document.body.innerHTML = '<p>Error loading product.</p>';
    console.error(err);
  });