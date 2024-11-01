const productContainer = document.querySelector('.product-container');

async function cargarProductos() {
    try {
        const response = await fetch('data/productos.json');
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarProductos(productos) {
    productContainer.innerHTML = '';
    productos.forEach(producto => {
        const productHTML = `
            <div class="product" data-id="${producto.id}">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
                <h3>${producto.nombre}</h3>
                <p class="price">$${producto.precio.toFixed(2)}</p>
                <button class="add-to-cart">Agregar</button>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product');
            const productId = product.getAttribute('data-id');
            const productName = product.querySelector('h3').textContent;
            const productPrice = parseFloat(product.querySelector('.price').textContent.slice(1));
            const productImg = product.querySelector('img').src;

            agregarAlCarrito(productId, productName, productPrice, productImg);
            guardarCarritoEnStorage();
        });
    });
}

function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(cart));
}

cargarProductos();
