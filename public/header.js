const header = document.createElement('div');
header.className="header";

const left = document.createElement('div');
left.className="left";

const h1 = document.createElement('h1');
h1.innerHTML="Sweet Tooth";
left.appendChild(h1);

const middle = document.createElement('div');
middle.className="middle";

const homepagebtn = document.createElement('button');
homepagebtn.className="custombutton";
homepagebtn.innerHTML="Homepage";
homepagebtn.onclick = () => window.location.href="/index.html";
middle.appendChild(homepagebtn);

const menubtn = document.createElement('button');
menubtn.className="custombutton";
menubtn.innerHTML="Menu";
menubtn.onclick = () => window.location.href="/menu.html";
middle.appendChild(menubtn);

const right = document.createElement('div');
right.className="right";

const cartbutton = document.createElement('button');
cartbutton.className="custombutton";
cartbutton.id="cartbutton";
cartbutton.onclick = () => window.location.href="/cart.html";
right.appendChild(cartbutton);

const logs = document.createElement('button');
logs.className="custombutton";
logs.innerHTML="Order Logs";
logs.onclick = () => window.location.href="/logs.html"; 
right.appendChild(logs);

const Edit = document.createElement('button');
Edit.className="custombutton";
Edit.innerHTML="Edit Menu";
Edit.onclick = () => window.location.href="/edit.html";
right.appendChild(Edit);


header.appendChild(left);
header.appendChild(middle);
header.appendChild(right);

document.body.appendChild(header);

// Global cart array
window.cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Listen for custom add-to-cart events
window.addEventListener('add-to-cart', function(e) {
  if (e.detail && e.detail.productId) {
    window.cart.push(e.detail.productId);
    localStorage.setItem('cart', JSON.stringify(window.cart)); // Save to localStorage
    console.log('Cart:', window.cart);
  }
});