 fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                const container = document.getElementById('product-list');
                products.forEach(product => {
                    const el = document.createElement('div');
                    el.className = `item ${product.background}`;
                    el.innerHTML = `
                        <img src="${product.image}" id="homepagecake" alt="${product.title}"/>
                        <div class="description"> 
                        <p2 class="titles">${product.title}</p2>
                        <p>${product.shortDescription}</p>

                       <button class="custombutton"> See More </button>
                        </div>
                    `;
                    container.appendChild(el);
                });
            })
            .catch(err => {
                document.body.innerHTML = '<p>Error loading products.</p>';
                console.error(err);
            });