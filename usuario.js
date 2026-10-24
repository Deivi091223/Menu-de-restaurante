/*
 * Funciones del cliente para armar, consultar y confirmar pedidos.
 * El estado se conserva en localStorage para seguir disponible al recargar.
 */
(function () {
    // Contenedor de eventos, lista actual y espacio para pedidos confirmados.
    const appUsuario = document.getElementById("app");
    const listaPedido = document.querySelector(".lista-pedido");
    const listaHistorial = document.getElementById("historial-pedidos");
    const mensajeHistorialVacio = document.querySelector(".pedidos-historial-vacio");
    const clavePedidos = "laCasonaPedidos";

    // Lee y valida los pedidos guardados para evitar usar datos con estructura incorrecta.
    function cargarPedidosGuardados() {
        try {
            const guardado = localStorage.getItem(clavePedidos);
            if (!guardado) return { actual: [], historial: [] };

            const datos = JSON.parse(guardado);
            if (!datos || !Array.isArray(datos.actual) || !Array.isArray(datos.historial)) {
                throw new Error("La estructura guardada de pedidos no es válida.");
            }

            const pedidoValido = (item) =>
                item &&
                typeof item.nombre === "string" &&
                Number.isFinite(Number(item.precio)) &&
                Number(item.precio) > 0;

            if (!datos.actual.every(pedidoValido)) {
                throw new Error("El carrito guardado contiene elementos no válidos.");
            }
            if (!datos.historial.every((pedido) =>
                pedido &&
                typeof pedido.fecha === "string" &&
                Array.isArray(pedido.items) &&
                pedido.items.every(pedidoValido)
            )) {
                throw new Error("El historial guardado contiene pedidos no válidos.");
            }

            return datos;
        } catch (error) {
            console.error("No se pudieron leer los pedidos guardados:", error);
            return { actual: [], historial: [] };
        }
    }

    // Mantiene el carrito y el historial juntos en una sola entrada del navegador.
    let pedidos = cargarPedidosGuardados();

    // Formatea un precio numérico como moneda colombiana.
    function formatearPrecio(numero) {
        return "$" + Number(numero).toLocaleString("es-CO");
    }

    // Guarda el estado actual y avisa si el navegador no permite conservarlo.
    function guardarPedidos() {
        try {
            localStorage.setItem(clavePedidos, JSON.stringify(pedidos));
            return true;
        } catch (error) {
            console.error("No se pudieron guardar los pedidos:", error);
            alert("No se pudo guardar el pedido en este navegador.");
            return false;
        }
    }

    // Dibuja el carrito desde el estado, recalcula el total y actualiza el mensaje vacío.
    function actualizarPedido() {
        listaPedido.replaceChildren();
        let total = 0;

        pedidos.actual.forEach((datos) => {
            const item = document.createElement("li");
            item.dataset.precio = datos.precio;

            const textoNombre = document.createElement("span");
            textoNombre.textContent = datos.nombre;

            const textoPrecio = document.createElement("span");
            textoPrecio.textContent = formatearPrecio(datos.precio);

            const btnQuitar = document.createElement("button");
            btnQuitar.type = "button";
            btnQuitar.className = "btn-quitar";
            btnQuitar.dataset.accion = "quitar";
            btnQuitar.textContent = "Quitar";

            item.append(textoNombre, textoPrecio, btnQuitar);
            listaPedido.appendChild(item);
            total += Number(datos.precio);
        });

        const mensajeVacio = listaPedido.previousElementSibling;
        const filaTotal = listaPedido.nextElementSibling;
        filaTotal.lastElementChild.textContent = formatearPrecio(total);
        mensajeVacio.hidden = pedidos.actual.length > 0;
    }

    // Muestra los pedidos confirmados sin depender del contenido temporal de la página.
    function actualizarHistorial() {
        listaHistorial.replaceChildren();
        mensajeHistorialVacio.hidden = pedidos.historial.length > 0;

        pedidos.historial.forEach((pedido, indice) => {
            const itemPedido = document.createElement("li");
            itemPedido.className = "pedido-anterior";

            const titulo = document.createElement("h3");
            titulo.textContent = "Pedido " + (indice + 1) + " · " + pedido.fecha;
            itemPedido.appendChild(titulo);

            const items = document.createElement("ul");
            let total = 0;
            pedido.items.forEach((item) => {
                const detalle = document.createElement("li");
                detalle.textContent = item.nombre + " — " + formatearPrecio(item.precio);
                items.appendChild(detalle);
                total += Number(item.precio);
            });
            itemPedido.appendChild(items);

            const totalPedido = document.createElement("p");
            totalPedido.textContent = "Total: " + formatearPrecio(total);
            itemPedido.appendChild(totalPedido);
            listaHistorial.appendChild(itemPedido);
        });
    }

    // Añade al carrito una copia del nombre y precio del plato elegido.
    function agregarAlPedido(plato) {
        const item = {
            nombre: plato.querySelector(".plato-nombre").textContent,
            precio: Number(plato.dataset.precio)
        };

        pedidos.actual.push(item);
        if (!guardarPedidos()) pedidos.actual.pop();
        actualizarPedido();
    }

    // Quita del carrito el elemento correspondiente al botón seleccionado.
    function quitarDelPedido(boton) {
        const elemento = boton.closest("li");
        const indice = Array.from(listaPedido.children).indexOf(elemento);
        const [eliminado] = pedidos.actual.splice(indice, 1);

        if (!guardarPedidos()) pedidos.actual.splice(indice, 0, eliminado);
        actualizarPedido();
    }

    // Vacía el carrito después de conservarlo temporalmente para poder revertir un error.
    function vaciarPedido() {
        const pedidoAnterior = pedidos.actual;
        pedidos.actual = [];

        if (!guardarPedidos()) pedidos.actual = pedidoAnterior;
        actualizarPedido();
    }

    // Pasa el carrito al historial como pedido confirmado y mantiene su contenido visible.
    function confirmarPedido() {
        if (pedidos.actual.length === 0) {
            alert("Tu pedido está vacío.");
            return;
        }

        const pedidoConfirmado = {
            fecha: new Date().toLocaleString("es-CO"),
            items: pedidos.actual.map((item) => ({ ...item }))
        };
        const pedidoAnterior = pedidos.actual;
        pedidos.historial.push(pedidoConfirmado);
        pedidos.actual = [];

        if (!guardarPedidos()) {
            pedidos.historial.pop();
            pedidos.actual = pedidoAnterior;
            return;
        }

        actualizarPedido();
        actualizarHistorial();
        alert("¡Pedido confirmado! Puedes consultarlo en Mis pedidos.");
    }

    // Atiende las acciones del cliente sin interferir con los botones administrativos.
    appUsuario.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        switch (boton.dataset.accion) {
            case "agregar":
                agregarAlPedido(boton.closest(".plato"));
                break;
            case "quitar":
                quitarDelPedido(boton);
                break;
            case "vaciar":
                vaciarPedido();
                break;
            case "confirmar":
                confirmarPedido();
                break;
        }
    });

    // Restaura el carrito y los pedidos anteriores al abrir o recargar la página.
    actualizarPedido();
    actualizarHistorial();
})();
