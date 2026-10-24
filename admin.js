/*
 * Funciones de administración del menú de La Casona.
 * Este archivo gestiona el formulario CRUD y el cambio entre vistas.
 */
(function () {
    // Referencias al contenedor y a los campos del formulario administrativo.
    const appAdmin = document.getElementById("app");
    const campoId = document.getElementById("plato-id");
    const campoNombre = document.getElementById("plato-nombre-input");
    const campoCategoria = document.getElementById("plato-categoria-input");
    const campoPrecio = document.getElementById("plato-precio-input");
    const campoDescripcion = document.getElementById("plato-descripcion-input");
    const tituloAdmin = document.getElementById("admin-titulo");
    const mensajeAdmin = document.getElementById("mensaje-admin");
    const panelAdmin = document.getElementById("admin");

    // El nuevo plato recibe un id mayor al de todos los platos del HTML.
    let siguienteId = 1;
    document.querySelectorAll(".plato").forEach((plato) => {
        const id = Number(plato.dataset.id);
        if (id >= siguienteId) siguienteId = id + 1;
    });

    // Convierte un precio numérico al formato de moneda usado en Colombia.
    function formatearPrecio(numero) {
        return "$" + Number(numero).toLocaleString("es-CO");
    }

    // Muestra mensajes de validación o resultado en el panel administrativo.
    function mostrarMensaje(texto, tipo) {
        mensajeAdmin.textContent = texto;
        mensajeAdmin.className = "mensaje-admin" + (tipo ? " " + tipo : "");
    }

    // Restablece el formulario y quita el resaltado del plato que se editaba.
    function limpiarFormulario() {
        campoId.value = "";
        campoNombre.value = "";
        campoCategoria.value = "entradas";
        campoPrecio.value = "";
        campoDescripcion.value = "";
        tituloAdmin.textContent = "Agregar plato";
        panelAdmin.querySelector('[data-accion="guardar"]').textContent = "Guardar plato";

        const enEdicion = document.querySelector(".plato.editando");
        if (enEdicion) enEdicion.classList.remove("editando");
    }

    // Construye una tarjeta de plato con botones para cliente y administrador.
    function crearPlato(datos) {
        const plato = document.createElement("article");
        plato.className = "plato";
        plato.dataset.id = siguienteId;
        plato.dataset.categoria = datos.categoria;
        plato.dataset.precio = datos.precio;
        siguienteId++;

        const nombre = document.createElement("h4");
        nombre.className = "plato-nombre";
        nombre.textContent = datos.nombre;

        const descripcion = document.createElement("p");
        descripcion.className = "plato-descripcion";
        descripcion.textContent = datos.descripcion;

        const precio = document.createElement("span");
        precio.className = "plato-precio";
        precio.textContent = formatearPrecio(datos.precio);

        const accionesCliente = document.createElement("div");
        accionesCliente.className = "acciones-cliente solo-cliente";
        const btnAgregar = document.createElement("button");
        btnAgregar.type = "button";
        btnAgregar.className = "btn-agregar";
        btnAgregar.dataset.accion = "agregar";
        btnAgregar.textContent = "Agregar";
        accionesCliente.appendChild(btnAgregar);

        const accionesAdmin = document.createElement("div");
        accionesAdmin.className = "acciones-admin solo-admin";
        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.dataset.accion = "editar";
        btnEditar.textContent = "Editar";
        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn-eliminar";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.textContent = "Eliminar";
        accionesAdmin.append(btnEditar, btnEliminar);

        plato.append(nombre, descripcion, precio, accionesCliente, accionesAdmin);

        // Coloca la tarjeta en la lista de la categoría seleccionada.
        const lista = document.querySelector(
            '.categoria[data-categoria="' + datos.categoria + '"] .lista-platos'
        );
        lista.appendChild(plato);
        return plato;
    }

    // Carga los datos de una tarjeta en el formulario para editarlos.
    function cargarEnFormulario(plato) {
        const nombre = plato.firstElementChild;
        const descripcion = nombre.nextElementSibling;

        campoId.value = plato.dataset.id;
        campoNombre.value = nombre.textContent;
        campoDescripcion.value = descripcion.textContent;
        campoPrecio.value = plato.dataset.precio;
        campoCategoria.value = plato.dataset.categoria;

        tituloAdmin.textContent = "Editar plato";
        panelAdmin.querySelector('[data-accion="guardar"]').textContent = "Guardar cambios";

        const anterior = document.querySelector(".plato.editando");
        if (anterior) anterior.classList.remove("editando");
        plato.classList.add("editando");

        mostrarMensaje("Editando: " + nombre.textContent, "");
        campoNombre.focus();
        panelAdmin.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Actualiza nombre, descripción, precio y categoría de una tarjeta existente.
    function actualizarPlato(plato, datos) {
        const nombre = plato.firstElementChild;
        const descripcion = nombre.nextElementSibling;
        const precio = descripcion.nextElementSibling;

        nombre.textContent = datos.nombre;
        descripcion.textContent = datos.descripcion;
        precio.textContent = formatearPrecio(datos.precio);
        plato.dataset.precio = datos.precio;

        // Si cambia la categoría, mueve la tarjeta a la lista correspondiente.
        if (plato.dataset.categoria !== datos.categoria) {
            plato.dataset.categoria = datos.categoria;
            document
                .querySelector('.categoria[data-categoria="' + datos.categoria + '"] .lista-platos')
                .appendChild(plato);
        }
    }

    // Valida el formulario y crea un plato nuevo o actualiza el seleccionado.
    function guardarPlato() {
        const datos = {
            nombre: campoNombre.value.trim(),
            categoria: campoCategoria.value,
            precio: Number(campoPrecio.value),
            descripcion: campoDescripcion.value.trim()
        };

        if (datos.nombre === "") {
            mostrarMensaje("Escribe el nombre del plato.", "error");
            campoNombre.focus();
            return;
        }
        if (!(datos.precio > 0)) {
            mostrarMensaje("El precio debe ser mayor que 0.", "error");
            campoPrecio.focus();
            return;
        }
        if (datos.descripcion === "") {
            mostrarMensaje("Escribe una descripción corta.", "error");
            campoDescripcion.focus();
            return;
        }

        if (campoId.value === "") {
            crearPlato(datos);
            limpiarFormulario();
            mostrarMensaje("Plato agregado al menú.", "exito");
        } else {
            const plato = document.querySelector('.plato[data-id="' + campoId.value + '"]');
            actualizarPlato(plato, datos);
            limpiarFormulario();
            mostrarMensaje("Plato actualizado.", "exito");
        }
    }

    // Confirma y elimina del menú la tarjeta seleccionada.
    function eliminarPlato(plato) {
        const nombre = plato.firstElementChild.textContent;
        if (!confirm("¿Eliminar \"" + nombre + "\" del menú?")) return;

        if (plato.dataset.id === campoId.value) limpiarFormulario();
        plato.remove();
        mostrarMensaje("Plato eliminado.", "exito");
    }

    // Alterna el modo visual y deja limpio el formulario al cambiar de rol.
    function alternarModoAdmin(boton) {
        const esAdmin = document.body.classList.toggle("modo-admin");
        boton.textContent = esAdmin ? "Volver a vista de cliente" : "Entrar como administrador";
        limpiarFormulario();
        mostrarMensaje("", "");
    }

    // Atiende los clics administrativos mediante delegación en el contenedor.
    appAdmin.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const plato = boton.closest(".plato");
        switch (boton.dataset.accion) {
            case "alternar-admin":
                alternarModoAdmin(boton);
                break;
            case "guardar":
                guardarPlato();
                break;
            case "cancelar":
                limpiarFormulario();
                mostrarMensaje("", "");
                break;
            case "editar":
                cargarEnFormulario(plato);
                break;
            case "eliminar":
                eliminarPlato(plato);
                break;
        }
    });
})();
