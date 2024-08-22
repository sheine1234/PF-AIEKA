document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el carrito desde LocalStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    actualizarContadorCarrito();

    function actualizarContadorCarrito() {
        let carritoCountElements = document.querySelectorAll('#carritoCount');
        carritoCountElements.forEach(element => {
            element.innerText = carrito.length;
        });
    }

    // Obtener el menú desde el archivo JSON
    function obtenerMenu() {
        return fetch('/api/menu')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el archivo JSON');
                }
                return response.json();
            })
            .then(menu => {
                return menu;
            })
            .catch(error => console.error('Error:', error));
    }
    
    




    // Mostrar el menú completo en el DOM
    function mostrarMenuCompleto(menu) {
        let menuDiv = document.getElementById('menuCompleto');
        menuDiv.innerHTML = '';
        menu.forEach(producto => {
            menuDiv.innerHTML += `
                <div class="col-md-4 menu-item">
                    <div class="card shadow-sm">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">$${producto.precio}</p>
                            <button class="btn btn-primary add-to-cart" data-id="${producto.id}">Agregar al Carrito</button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Añadir event listeners a los botones "Agregar al Carrito"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                agregarAlCarrito(parseInt(this.getAttribute('data-id')));
            });
        });
    }

    // Mostrar el carrito en el DOM
    function mostrarCarrito() {
        let carritoDiv = document.getElementById('carrito');
        if (carritoDiv) {
            carritoDiv.innerHTML = '';
            let totalCuenta = 0;
            carrito.forEach(producto => {
                carritoDiv.innerHTML += `
                    <div class="col-md-4 menu-item">
                        <div class="card shadow-sm">
                            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                            <div class="card-body">
                                <h5 class="card-title">${producto.nombre}</h5>
                                <p class="card-text">$${producto.precio}</p>
                            </div>
                        </div>
                    </div>
                `;
                totalCuenta += producto.precio;
            });
            document.getElementById('totalCuenta').innerText = `$${totalCuenta}`;
        } else {
            console.error('No se encontró el elemento con id "carrito"');
        }
    }

    // Función para agregar productos al carrito
    function agregarAlCarrito(id) {
        obtenerMenu().then(menu => {
            let producto = menu.find(p => p.id === id);
            if (producto) {
                carrito.push(producto);
                localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardar en LocalStorage
                mostrarCarrito();
                actualizarContadorCarrito();
            } else {
                console.error('Producto no encontrado:', id);
            }
        });
    }

    // Calcular descuento
    function calcularDescuento(totalCuenta) {
        let totalConDescuento = totalCuenta;
        if (totalCuenta > 5000) {
            let descuento = totalCuenta * 0.1;
            totalConDescuento = totalCuenta - descuento;
            return { totalConDescuento, descuento: true };
        } else {
            return { totalConDescuento, descuento: false };
        }
    }

    // Calcular propina
    function calcularPropina() {
        let totalCuenta = parseFloat(document.getElementById('totalCuenta').innerText.replace('$', ''));
        let porcentajePropina = parseFloat(document.getElementById('porcentajePropina').value);
        let resultadoDiv = document.getElementById('resultadoPropina');
        let { totalConDescuento, descuento } = calcularDescuento(totalCuenta);
        let propina = totalConDescuento * (porcentajePropina / 100);
        let totalConPropina = totalConDescuento + propina;
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = `La propina es: $${propina.toFixed(2)}<br>El total con propina es: $${totalConPropina.toFixed(2)}<br>`;
        if (descuento) {
            resultadoDiv.innerHTML += `¡Felicidades! Se aplicó un descuento del 10%<br>`;
        } else {
            resultadoDiv.innerHTML += `Lo sentimos, no se aplicó descuento.<br>`;
        }
    }

    // Añadir event listener al botón "Calcular Propina"
    document.getElementById('calcularPropinaBtn')?.addEventListener('click', calcularPropina);

    // Añadir event listener al botón "Vaciar Carrito"
    function vaciarCarrito() {
        carrito = [];
        localStorage.removeItem('carrito'); // Eliminar del LocalStorage
        mostrarCarrito();
        actualizarContadorCarrito();
    }
    document.getElementById('vaciarCarritoBtn')?.addEventListener('click', vaciarCarrito);

    // Añadir event listener al botón "Finalizar Compra"
    function finalizarCompra() {
        if (carrito.length === 0) {
            document.getElementById('mensajeError').style.display = 'block';
            return;
        } else {
            document.getElementById('mensajeError').style.display = 'none';
        }

        // Mostrar resumen de la compra
        let totalCuenta = parseFloat(document.getElementById('totalCuenta').innerText.replace('$', ''));
        let { totalConDescuento, descuento } = calcularDescuento(totalCuenta);
        let porcentajePropina = parseFloat(document.getElementById('porcentajePropina').value);
        let propina = totalConDescuento * (porcentajePropina / 100);
        let totalConPropina = totalConDescuento + propina;

        let resumenDetalles = `
            <strong>Total de la Cuenta:</strong> $${totalCuenta.toFixed(2)}<br>
            <strong>Total con Descuento:</strong> $${totalConDescuento.toFixed(2)}<br>
            <strong>Propina:</strong> $${propina.toFixed(2)}<br>
            <strong>Total con Propina:</strong> $${totalConPropina.toFixed(2)}<br>
        `;

        document.getElementById('resumenDetalles').innerHTML = resumenDetalles;
        document.getElementById('resumenCompra').style.display = 'block';
        document.getElementById('notificacionCompra').style.display = 'block';

        // Limpiar carrito y actualizar estado
        vaciarCarrito();
    }
    document.getElementById('finalizarCompraBtn')?.addEventListener('click', finalizarCompra);

    // Cargar el menú al iniciar la página
    if (document.getElementById('menuCompleto')) {
        obtenerMenu().then(menu => {
            mostrarMenuCompleto(menu);
        });
    }

    // Cargar el carrito al iniciar la página del carrito
    if (document.getElementById('carrito')) {
        mostrarCarrito();
    }
});

obtenerMenu()
    .then(menu => {
        console.log(menu); // Deberías ver el menú en la consola si todo está correcto
    })
    .catch(error => console.error(error));