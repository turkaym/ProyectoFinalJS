let cart = JSON.parse(localStorage.getItem('cart')) || []; 

const cartIcon = document.getElementById('cartIcon');
const cartDropdown = document.getElementById('cartDropdown');
const cartCount = document.getElementById('cartCount');
const cartTableBody = document.querySelector('#cartTable tbody');
const cartTotal = document.getElementById('cartTotal');
const clearCartButton = document.getElementById('clearCartButton');
const payButton = document.getElementById('payButton');


cartIcon.addEventListener('click', () => {
    cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
});


function agregarAlCarrito(id, nombre, precio, img) {
    const productoExistente = cart.find(item => item.id === id);
    if (productoExistente) {
        productoExistente.quantity += 1;
    } else {
        cart.push({ id, nombre, precio, quantity: 1, img });
    }
    actualizarCarrito();
}


function actualizarCarrito() {
    cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartTableBody.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${item.img}" width="50"> ${item.nombre}</td>
            <td>${item.quantity}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${(item.precio * item.quantity).toFixed(2)}</td>
            <td>
                <button onclick="modificarCantidad('${item.id}', 1)">+</button>
                <button onclick="modificarCantidad('${item.id}', -1)">-</button>
                <button onclick="eliminarProducto('${item.id}')">Eliminar</button>
            </td>
        `;
        cartTableBody.appendChild(row);
        total += item.precio * item.quantity;
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
    localStorage.setItem('cart', JSON.stringify(cart)); 
}


function modificarCantidad(id, cambio) {
    const producto = cart.find(item => item.id === id);
    if (producto) {
        producto.quantity += cambio;
        if (producto.quantity <= 0) {
            eliminarProducto(id);
        } else {
            actualizarCarrito();
        }
    }
}

function eliminarProducto(id) {
    cart = cart.filter(item => item.id !== id);
    actualizarCarrito();
}

clearCartButton.addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción vaciará tu carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, vaciar carrito',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            actualizarCarrito();
            Swal.fire('Carrito vaciado', '', 'success');
        }
    });
});


payButton.addEventListener('click', () => {
    if (cart.length === 0) {
        Swal.fire('Error', 'No hay productos en el carrito para pagar.', 'error');
        return;
    }

    Swal.fire({
        title: 'Detalles de Pago',
        html: `
            <input id="nombre" class="swal2-input" placeholder="Nombre">
            <input id="apellido" class="swal2-input" placeholder="Apellido">
            <input id="tarjeta" class="swal2-input" placeholder="Número de tarjeta" type="text">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const tarjeta = document.getElementById('tarjeta').value;
           
            const nombreApellidoRegex = /^[a-zA-Z\s]+$/;
            if (!nombreApellidoRegex.test(nombre)) {
                Swal.showValidationMessage('El nombre solo debe contener letras.');
                return false; 
            }
            if (!nombreApellidoRegex.test(apellido)) {
                Swal.showValidationMessage('El apellido solo debe contener letras.');
                return false; 
            }
          
            const tarjetaRegex = /^\d+$/;
            if (!tarjetaRegex.test(tarjeta)) {
                Swal.showValidationMessage('El número de tarjeta debe contener solo números.');
                return false; 
            }

            return { nombre, apellido, tarjeta }; 
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const usuario = result.value;
            const resumen = cart.map(item => `${item.nombre} (x${item.quantity})`).join(', ');
            const totalCompra = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

            Swal.fire({
                title: 'Resumen de Compra',
                html: `
                    <p><strong>Productos:</strong> ${resumen}</p>
                    <p><strong>Total:</strong> $${totalCompra.toFixed(2)}</p>
                    <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellido}</p>
                    <p><strong>Número de Tarjeta:</strong> ${usuario.tarjeta}</p>
                `,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
           
            cart = [];
            actualizarCarrito();
        }
    });
});

fetch('./data/productos.json')
    .then(response => response.json())
    .then(data => {
        
        mostrarProductos(data);
    })
    .catch(error => console.error('Error al cargar los productos:', error));
