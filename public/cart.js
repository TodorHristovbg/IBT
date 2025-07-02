let counts = {};
// ot stz
window.cart.forEach(id => {
  counts[id] = (counts[id] || 0) + 1;
});

const container = document.querySelector('.cart');
container.innerHTML = '<p>Loading cart...</p>';
let total = 0;
Promise.all(
  Object.entries(counts).map(([id, count]) =>
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(product => ({
        html: `<div class="cart-item">
          <img src="${product.image}" class="imageincart" />
          <span style="font-size:1.2em; font-weight:bold;">${product.title}</span>
          <p> ${product.price} (x${count})</p>
        </div>`,
        price: parseFloat(product.price),
        count
      }))
      .catch(() => ({
        html: `<div class="cart-item">Item not found (ID: ${id}) (x${count})</div>`,
        price: 0,
        count: 0
      }))
  )
).then(items => {
  container.innerHTML = items.map(item => item.html).join('');
  const totalraw = items.reduce((sum, item) => sum + item.price * item.count, 0);
  const total = Number(totalraw.toFixed(2));
  console.log('Total:', total);
  if (total === 0) {
    container.innerHTML = '<p class="empty">Your cart is empty.</p>';
    return;
  }
  container.innerHTML += `
  <button class="custombutton carttotal" id="checkout-btn">Total: $${total.toFixed(2)}</button>
  <div id="checkout-form-container" style="display:none; margin-top:30px;"></div>
  `;

  document.getElementById('checkout-btn').addEventListener('click', function() {
    const formContainer = document.getElementById('checkout-form-container');
    formContainer.innerHTML = `
      <div class="checkout">

        <form id="checkout-form" class="checkoutbox">
          <h2>Checkout</h2>
          <input type="text" id="checkout-name" placeholder="Your Name" required>
          <input type="text" id="checkout-address" placeholder="Your Address" required>
          <button type="submit" class="custombutton">Submit Order</button>
        </form>
      </div>
    `;
    formContainer.style.display = 'block';
    document.getElementById('checkout-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('checkout-name').value.trim();
      const address = document.getElementById('checkout-address').value.trim();
      alert(`Order placed for ${name} at ${address}!`);

     
      const items = Object.entries(counts).map(([id, count]) => ({
        product: id,
        quantity: count
      }));

      const time = new Date().toISOString();
      const orderData = { name, address, items, total, time};

      try {
        const response = await fetch('/add-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        const result = await response.json();
    if (response.ok) {
      alert('Order placed successfully!');
      window.cart = [];
      localStorage.setItem('cart', JSON.stringify(window.cart));
      formContainer.style.display = 'none';
      location.reload();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    alert('Failed to submit order.');
  }
    });
  });
});