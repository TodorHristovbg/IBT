fetch('/api/products')
  .then(res => res.json())
  .then(products => {
    const container = document.querySelector('.edit'); // Use .edit for class or #edit for id
    products.forEach(product => {
      const el = document.createElement('div');
      el.className = 'product';
      el.innerHTML = `
      <div class="editcontainer">
        <div class="imageinfo"> 
          <p2 class="title">${product.title}</p2>
          <img src="${product.image}" class="image"/>
        </div>
        <p class="shortdescription">${product.shortDescription}</p>
        <p class="description">${product.fullDescription}</p>
        <p class="price">Price: $${product.price}</p>
        <button class="custombutton edit">Edit</button>
      </div>
      `;
      // Add edit button logic
      el.querySelector('.edit').addEventListener('click', function() {
        const container = el.querySelector('.editcontainer');
        container.innerHTML = `
          <div class="imageinfo"> 
            <input class="title" value="${product.title}" />
            <img src="${product.image}" class="image"/>
          </div>
          <textarea class="shortdescription">${product.shortDescription}</textarea >
          <textarea class="description">${product.fullDescription}</textarea>
          <input class="price" value="${product.price}" type="number" step="0.01" />
          <button class="custombutton save">Save</button>
        `;
        container.querySelector('.save').addEventListener('click', function() {
          // Gather updated values
          const updatedProduct = {
            title: container.querySelector('.title').value,
            shortDescription: container.querySelector('.shortdescription').value,
            fullDescription: container.querySelector('.description').value,
            price: container.querySelector('.price').value
          };
          // Send update to backend
          fetch(`/api/products/${product._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
          })
          .then(res => res.json())
          .then(data => {
            alert('Product updated!');
            location.reload();
          })
          .catch(err => {
            alert('Error updating product.');
            console.error(err);
          });
        });
      });
      container.appendChild(el);
    });
  })
  .catch(err => {
    document.body.innerHTML = '<p>Error loading products.</p>';
    console.error(err);
  });