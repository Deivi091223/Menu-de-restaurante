/* =========================================================
   Restaurante La Casona — script.js
   - Un solo addEventListener (delegación de eventos) en #app
   - textContent (nunca innerHTML) para los textos
   - DOM Traversing: closest, parentElement, firstElementChild,
     nextElementSibling, previousElementSibling, lastElementChild
   ========================================================= */

// ---------- 1. Referencias al DOM ----------
const app = document.getElementById("app");

// Campos del formulario del administrador
const campoId = document.getElementById("plato-id");
const campoNombre = document.getElementById("plato-nombre-input");
const campoCategoria = document.getElementById("plato-categoria-input");
const campoPrecio = document.getElementById("plato-precio-input");
const campoDescripcion = document.getElementById("plato-descripcion-input");
const tituloAdmin = document.getElementById("admin-titulo");
const mensajeAdmin = document.getElementById("mensaje-admin");
const panelAdmin = document.getElementById("admin");

// Lista del pedido (desde aquí recorremos a sus vecinos)
const listaPedido = document.querySelector(".lista-pedido");

// ---------- 2. Variables de estado ----------
// Calculamos el siguiente id mirando el id más alto que ya existe en el HTML
let siguienteId = 1;
document.querySelectorAll(".plato").forEach((plato) => {
    const id = Number(plato.dataset.id);
    if (id >= siguienteId) siguienteId = id + 1;
});

// ---------- 3. Funciones de ayuda ----------

// Convierte 12000 en "$12.000"
function formatearPrecio(numero) {
    return "$" + Number(numero).toLocaleString("es-CO");
}

// Muestra un mensaje en el panel admin. tipo: "error" | "exito" | ""
function mostrarMensaje(texto, tipo) {
    mensajeAdmin.textContent = texto; // textContent: seguro con texto del usuario
    mensajeAdmin.className = "mensaje-admin" + (tipo ? " " + tipo : "");
}

// Deja el formulario como "Agregar plato" y quita el resaltado de edición
function limpiarFormulario() {
    campoId.value = "";
    campoNombre.value = "";
    campoCategoria.value = "entradas";
    campoPrecio.value = "";
    campoDescripcion.value = "";
    tituloAdmin.textContent = "Agregar plato";
    panelAdmin.querySelector('[data-accion="guardar"]').textContent = "Guardar plato";

    // Quitamos la clase "editando" de cualquier plato que la tenga
    const enEdicion = document.querySelector(".plato.editando");
    if (enEdicion) enEdicion.classList.remove("editando");
}

// ---------- 4. CRUD del administrador ----------

// CREATE: construye un <article class="plato"> igual a los del HTML
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

    // Botón del cliente
    const accionesCliente = document.createElement("div");
    accionesCliente.className = "acciones-cliente solo-cliente";
    const btnAgregar = document.createElement("button");
    btnAgregar.type = "button";
    btnAgregar.className = "btn-agregar";
    btnAgregar.dataset.accion = "agregar";
    btnAgregar.textContent = "Agregar";
    accionesCliente.appendChild(btnAgregar);

    // Botones del administrador
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

    // Lo metemos en la lista de su categoría
    const lista = document.querySelector(
        '.categoria[data-categoria="' + datos.categoria + '"] .lista-platos'
    );
    lista.appendChild(plato);
    return plato;
}

// READ (hacia el formulario): lee los datos de un plato recorriendo el DOM
function cargarEnFormulario(plato) {
    // Recorrido: article → h4 → p → span
    const nombre = plato.firstElementChild;             // h4.plato-nombre
    const descripcion = nombre.nextElementSibling;      // p.plato-descripcion
    const precio = descripcion.nextElementSibling;      // span.plato-precio

    campoId.value = plato.dataset.id;
    campoNombre.value = nombre.textContent;
    campoDescripcion.value = descripcion.textContent;
    campoPrecio.value = plato.dataset.precio;
    campoCategoria.value = plato.dataset.categoria;
    // precio.textContent no se usa para el valor numérico: usamos data-precio

    tituloAdmin.textContent = "Editar plato";
    panelAdmin.querySelector('[data-accion="guardar"]').textContent = "Guardar cambios";

    // Resaltamos solo la fila que se edita
    const anterior = document.querySelector(".plato.editando");
    if (anterior) anterior.classList.remove("editando");
    plato.classList.add("editando");

    mostrarMensaje("Editando: " + nombre.textContent, "");
    campoNombre.focus();
    panelAdmin.scrollIntoView({ behavior: "smooth", block: "start" });
}

// UPDATE: cambia los textos del plato usando DOM Traversing
function actualizarPlato(plato, datos) {
    const nombre = plato.firstElementChild;             // h4
    const descripcion = nombre.nextElementSibling;      // p
    const precio = descripcion.nextElementSibling;      // span

    nombre.textContent = datos.nombre;
    descripcion.textContent = datos.descripcion;
    precio.textContent = formatearPrecio(datos.precio);
    plato.dataset.precio = datos.precio;

    // Si cambió la categoría, movemos el plato a la lista correspondiente
    if (plato.dataset.categoria !== datos.categoria) {
        plato.dataset.categoria = datos.categoria;
        document
            .querySelector('.categoria[data-categoria="' + datos.categoria + '"] .lista-platos')
            .appendChild(plato);
    }
}

// Guarda: decide si es CREATE o UPDATE según el campo oculto #plato-id
function guardarPlato() {
    const datos = {
        nombre: campoNombre.value.trim(),
        categoria: campoCategoria.value,
        precio: Number(campoPrecio.value),
        descripcion: campoDescripcion.value.trim()
    };

    // Validaciones simples
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
        // CREATE
        crearPlato(datos);
        limpiarFormulario();
        mostrarMensaje("Plato agregado al menú.", "exito");
    } else {
        // UPDATE: buscamos el plato por su data-id
        const plato = document.querySelector('.plato[data-id="' + campoId.value + '"]');
        actualizarPlato(plato, datos);
        limpiarFormulario();
        mostrarMensaje("Plato actualizado.", "exito");
    }
}

// DELETE: elimina el plato completo
function eliminarPlato(plato) {
    const nombre = plato.firstElementChild.textContent;
    if (!confirm("¿Eliminar \"" + nombre + "\" del menú?")) return;

    // Si justo se estaba editando este plato, limpiamos el formulario
    if (plato.dataset.id === campoId.value) limpiarFormulario();

    plato.remove();
    mostrarMensaje("Plato eliminado.", "exito");
}

// ---------- 5. Modo administrador / cliente ----------
function alternarModoAdmin(boton) {
    const esAdmin = document.body.classList.toggle("modo-admin");
    boton.textContent = esAdmin ? "Volver a vista de cliente" : "Entrar como administrador";

    // Al cambiar de modo dejamos todo limpio
    limpiarFormulario();
    mostrarMensaje("", "");
}

// ---------- 6. Pedido del cliente ----------

// Recalcula el total y muestra u oculta el mensaje "Aún no has agregado platos"
function actualizarPedido() {
    let total = 0;
    for (const item of listaPedido.children) {
        total += Number(item.dataset.precio);
    }

    // DOM Traversing desde la lista:
    const mensajeVacio = listaPedido.previousElementSibling;       // p.pedido-vacio
    const filaTotal = listaPedido.nextElementSibling;              // p.pedido-total
    const valorTotal = filaTotal.lastElementChild;                 // span.total-valor

    valorTotal.textContent = formatearPrecio(total);
    mensajeVacio.hidden = listaPedido.children.length > 0;
}

// Agrega un plato al pedido
function agregarAlPedido(plato) {
    const nombre = plato.firstElementChild.textContent; // h4

    const item = document.createElement("li");
    item.dataset.precio = plato.dataset.precio;

    const textoNombre = document.createElement("span");
    textoNombre.textContent = nombre;

    const textoPrecio = document.createElement("span");
    textoPrecio.textContent = formatearPrecio(plato.dataset.precio);

    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "btn-quitar";
    btnQuitar.dataset.accion = "quitar";
    btnQuitar.textContent = "Quitar";

    item.append(textoNombre, textoPrecio, btnQuitar);
    listaPedido.appendChild(item);
    actualizarPedido();
}

// ---------- 7. UN SOLO addEventListener (delegación de eventos) ----------
app.addEventListener("click", (e) => {
    // Subimos desde lo que se tocó hasta el botón con data-accion
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return; // si no fue un botón, no hacemos nada

    const accion = boton.dataset.accion;
    const plato = boton.closest(".plato"); // fila del plato (null si no está en uno)

    switch (accion) {
        // --- Administrador ---
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

        // --- Cliente ---
        case "agregar":
            agregarAlPedido(plato);
            break;
        case "quitar":
            boton.closest("li").remove(); // del botón al <li>
            actualizarPedido();
            break;
        case "vaciar":
            listaPedido.replaceChildren(); // borra todos los <li>
            actualizarPedido();
            break;
        case "confirmar":
            if (listaPedido.children.length === 0) {
                alert("Tu pedido está vacío.");
            } else {
                alert("¡Pedido confirmado! Gracias por elegir La Casona.");
                listaPedido.replaceChildren();
                actualizarPedido();
            }
            break;
    }
});

// ---------- 8. Estado inicial ----------
actualizarPedido();
