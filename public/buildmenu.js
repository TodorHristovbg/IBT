 fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                const container = document.getElementById('menuid');

                products.forEach(product => {
                    const el = document.createElement('div');
                    el.className = `product`;
                    el.innerHTML = `
                        <p2 class="menutitle">${product.title}</p2>
                        <img src="${product.image}" class="menuimage" alt="${product.title}"/>
                    
                        <p class="menudesc">${product.shortDescription}</p>

                       <button class="custombutton"> See More </button>
            
                    `;
                    const button = el.querySelector('button');
    button.addEventListener('click', () => {
        window.location.href = `item/${product._id}`;
    });
                    container.appendChild(el);
                });
            })
            .catch(err => {
                document.body.innerHTML = '<p>Error loading products.</p>';
                console.error(err);
            });