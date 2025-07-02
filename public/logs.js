fetch('get-orders')
  .then(res => res.json())
  .then(async orders => {

    const logsHtml = await Promise.all(orders.map(async order => {

      const productsHtml = await Promise.all((order.items || []).map(async item => {
        const res = await fetch(`/api/products/${item.product}`);
        const product = await res.json();
        return `<div class="log-product">
          <img src="${product.image}" class="imageincart" style="width:60px;vertical-align:middle;" />
          <span>${product.title}</span>
          <span> (x${item.quantity})</span>
        </div>`;
      }));
      return `
      <div class="singlelog">
       <div class="log-products">${productsHtml.join('')}</div>
        <p class="logtime">Time: ${new Date(order.createdAt).toLocaleString()}</p>
        <p class="logname">Name: ${order.name}</p>
        <p class="logaddress">Address: ${order.address}</p>
       
      </div>
      `;
    }));
    document.querySelector('.logs').innerHTML = logsHtml.join('');
  })
  .catch(err => {
    document.querySelector('.logs').innerHTML = '<p>Error loading logs.</p>';
    console.error(err);
  });