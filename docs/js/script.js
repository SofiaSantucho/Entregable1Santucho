Swal = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-secondary'
  },
  buttonsStyling: false
});

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || null;
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

const contenedorProductos = document.querySelector(".productos__grid");
const listaCarrito = document.getElementById("lista-carrito");
const totalElement = document.getElementById("total");


const mensaje = document.createElement("p");
mensaje.id = "mensaje";
document.querySelector(".carrito .container").prepend(mensaje);

let postCompra = document.createElement("div");
postCompra.id = "post-compra";
postCompra.style.display = "none";
postCompra.style.textAlign = "center";
postCompra.style.marginTop = "1rem";
postCompra.innerHTML = `
  <p>¡Compra completada!</p>
  <button id="seguir-comprando" class="btn">Seguir Comprando</button>
`;
document.querySelector(".carrito .container").appendChild(postCompra);

fetch("docs/productos.json")
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    productos = data;
    mostrarProductos();
    actualizarCarrito();
  })
  .catch(err => {
    console.error("Error al cargar productos:", err);
    contenedorProductos.innerHTML = "<p>Error al cargar productos. Revisa la ruta del JSON.</p>";
  });

function mostrarProductos() {
  contenedorProductos.innerHTML = "";

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <div class="producto__imagen">
        <img src="docs/img/${producto.imagen}" alt="${producto.nombre}">
        <div class="producto__badge">${producto.categoria}</div>
      </div>
      <div class="producto__content">
        <h3>${producto.nombre}</h3>
        <p class="producto__descripcion">${producto.descripcion || ''}</p>
        <div class="producto__info">
          <span class="producto__precio">$${producto.precio.toLocaleString("es-AR")}</span>
          <span class="producto__stock">Stock: ${producto.stock}</span>
        </div>
        <button class="btn" data-id="${producto.id}">Añadir al carrito</button>
      </div>
    `;

    contenedorProductos.appendChild(div);
  });

  
  document.querySelectorAll(".producto .btn").forEach(btn => {
    btn.addEventListener("click", () => agregarAlCarrito(btn.dataset.id));
  });
  
  configurarFiltros();
}

function mostrarMensaje(texto) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: texto,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const cantidad = Number(item.cantidad) || 1;
    const li = document.createElement("li");

    li.innerHTML = `
      ${item.nombre} - $${item.precio} x 
      <input type="number" min="1" value="${cantidad}" data-index="${index}" class="cantidad">
      = $${item.precio * cantidad}
    `;

    listaCarrito.appendChild(li);
    total += item.precio * cantidad;
  });

  totalElement.textContent = `$${total}`;
  localStorage.setItem("carrito", JSON.stringify(carrito));

  document.querySelectorAll(".cantidad").forEach(input => {
    input.addEventListener("change", e => {
      const idx = parseInt(e.target.dataset.index);
      const nuevaCantidad = parseInt(e.target.value) || 1;
      carrito[idx].cantidad = nuevaCantidad;
      actualizarCarrito();
    });
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id == id);
  if (!producto) return;

  const existe = carrito.find(p => p.id == id);
  if (existe) {
    existe.cantidad = (existe.cantidad || 1) + 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarrito();
  mostrarMensaje(`Producto agregado: ${producto.nombre}`);
}

function inicializarInterfazUsuario() {
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const userMenu = document.getElementById("user-menu");
  const usernameDisplay = document.getElementById("username-display");

  if (usuarioActual) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    userMenu.style.display = "flex";
    usernameDisplay.textContent = usuarioActual.nombre;
  } else {
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    userMenu.style.display = "none";
  }
}

document.getElementById("finalizar-compra-btn").addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'No hay productos en el carrito para finalizar la compra.',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  if (!usuarioActual) {
    Swal.fire({
      icon: 'warning',
      title: 'Acceso requerido',
      text: 'Debes iniciar sesión para finalizar la compra.',
      confirmButtonText: 'Iniciar Sesión',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById("login-modal").style.display = "block";
      }
    });
    return;
  }


  const productosConStock = carrito.filter(item => {
    const producto = productos.find(p => p.id === item.id);
    return producto && producto.stock >= (item.cantidad || 1);
  });

  if (productosConStock.length !== carrito.length) {
    Swal.fire({
      icon: 'error',
      title: 'Stock insuficiente',
      text: 'Algunos productos no tienen stock suficiente. Por favor, revisa tu carrito.',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  const totalCompra = carrito.reduce((sum, p) => sum + p.precio * (p.cantidad || 1), 0);
  

  Swal.fire({
    icon: 'question',
    title: 'Confirmar compra',
    text: `¿Confirmas la compra por un total de $${totalCompra.toLocaleString("es-AR")}?`,
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      procesarCompra(totalCompra);
    }
  });
});


function procesarCompra(totalCompra) {
  const pedido = {
    usuario: usuarioActual.email,
    productos: [...carrito],
    total: totalCompra,
    fecha: new Date().toISOString()
  };

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));


  carrito.forEach(item => {
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
      producto.stock -= (item.cantidad || 1);
    }
  });

  carrito = [];
  actualizarCarrito();
  
  Swal.fire({
    icon: 'success',
    title: '¡Compra exitosa!',
    text: `Tu pedido ha sido procesado correctamente. Total: $${totalCompra.toLocaleString("es-AR")}`,
    confirmButtonText: 'Continuar'
  }).then(() => {
    postCompra.style.display = "block";
  });
}


document.addEventListener("click", e => {
  if(e.target && e.target.id === "seguir-comprando") {
    postCompra.style.display = "none";
    document.getElementById("productos").scrollIntoView({behavior:"smooth"});
  }
});


function configurarFiltros() {
  const filtros = document.querySelectorAll(".filtro-btn");
  
  filtros.forEach(filtro => {
    filtro.addEventListener("click", () => {
      filtros.forEach(f => f.classList.remove("active"));
      filtro.classList.add("active");
      
      const categoria = filtro.dataset.categoria;
      filtrarProductos(categoria);
    });
  });
}


function filtrarProductos(categoria) {
  const productosDOM = document.querySelectorAll(".producto");
  
  productosDOM.forEach(producto => {
    const badge = producto.querySelector(".producto__badge");
    const categoriaProducto = badge ? badge.textContent.trim() : "";
    
    if (categoria === "todos" || categoriaProducto === categoria) {
      producto.classList.remove("oculto");
      producto.style.display = "block";
    } else {
      producto.classList.add("oculto");
      producto.style.display = "none";
    }
  });
}


const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");


loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
});

registerBtn.addEventListener("click", () => {
  registerModal.style.display = "block";
});


document.querySelectorAll(".close").forEach(closeBtn => {
  closeBtn.addEventListener("click", (e) => {
    e.target.closest(".modal").style.display = "none";
  });
});


document.getElementById("switch-to-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.style.display = "none";
  registerModal.style.display = "block";
});

document.getElementById("switch-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.style.display = "none";
  loginModal.style.display = "block";
});


window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});


document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById("register-nombre").value;
  const email = document.getElementById("register-email").value;
  const telefono = document.getElementById("register-telefono").value;
  const direccion = document.getElementById("register-direccion").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;


  if (!nombre || !email || !telefono || !direccion || !password || !confirmPassword) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, completa todos los campos',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  const nuevoUsuario = {
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    telefono: formData.get("telefono"),
    direccion: formData.get("direccion"),
    password: formData.get("password")
  };


  if (nuevoUsuario.password !== confirmarPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Error de contraseña',
      text: 'Las contraseñas no coinciden.',
      confirmButtonText: 'Entendido'
    });
    return;
  }


  if (usuarios.find(u => u.email === nuevoUsuario.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Usuario existente',
      text: 'Ya existe un usuario con este email.',
      confirmButtonText: 'Entendido'
    });
    return;
  }


  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  Swal.fire({
    icon: 'success',
    title: '¡Registro exitoso!',
    text: 'Tu cuenta ha sido creada correctamente.',
    confirmButtonText: 'Continuar'
  }).then(() => {
    document.getElementById("register-modal").style.display = "none";
    e.target.reset();
  });
});


document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const email = formData.get("email");
  const password = formData.get("password");

  const usuario = usuarios.find(u => u.email === email && u.password === password);
  
  if (usuario) {
    usuarioActual = usuario;
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
    inicializarInterfazUsuario();
    
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola ${usuario.nombre}, has iniciado sesión correctamente.`,
      confirmButtonText: 'Continuar'
    }).then(() => {
      document.getElementById("login-modal").style.display = "none";
      e.target.reset();
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de acceso',
      text: 'Email o contraseña incorrectos.',
      confirmButtonText: 'Intentar de nuevo'
    });
  }
});


document.getElementById("logout-btn").addEventListener("click", () => {
  Swal.fire({
    icon: 'question',
    title: 'Cerrar sesión',
    text: '¿Estás seguro de que quieres cerrar sesión?',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      usuarioActual = null;
      localStorage.removeItem("usuarioActual");
      inicializarInterfazUsuario();
      
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente.',
        confirmButtonText: 'Continuar'
      });
    }
  });
});

document.getElementById("contacto-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const mensaje = document.getElementById("mensaje").value;


  const contacto = {
    nombre,
    email,
    telefono,
    mensaje,
    fecha: new Date().toISOString()
  };

  let mensajesContacto = JSON.parse(localStorage.getItem("mensajesContacto")) || [];
  mensajesContacto.push(contacto);
  localStorage.setItem("mensajesContacto", JSON.stringify(mensajesContacto));


  Swal.fire({
    icon: 'success',
    title: '¡Mensaje enviado!',
    text: 'Tu mensaje ha sido enviado correctamente. Te contactaremos pronto.',
    confirmButtonText: 'Perfecto'
  }).then(() => {
    document.getElementById("contacto-form").reset();
  });
});


function showConfirmModal(title, message, onConfirm, onCancel = null) {
  const modal = document.getElementById("confirm-modal");
  const titleEl = document.getElementById("confirm-title");
  const messageEl = document.getElementById("confirm-message");
  const confirmBtn = document.getElementById("confirm-accept");
  const cancelBtn = document.getElementById("confirm-cancel");

  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.style.display = "block";

  
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  
  newConfirmBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (onConfirm) onConfirm();
  });

  newCancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (onCancel) onCancel();
  });

  
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none";
      if (onCancel) onCancel();
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);
}


function showSuccessModal(title, message, onOk = null) {
  const modal = document.getElementById("success-modal");
  const titleEl = document.getElementById("success-title");
  const messageEl = document.getElementById("success-message");
  const okBtn = document.getElementById("success-ok");

  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.style.display = "block";

 
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);

  
  newOkBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (onOk) onOk();
  });

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none";
      if (onOk) onOk();
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);
}


function showErrorModal(title, message, onOk = null) {
  const modal = document.getElementById("error-modal");
  const titleEl = document.getElementById("error-title");
  const messageEl = document.getElementById("error-message");
  const okBtn = document.getElementById("error-ok");

  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.style.display = "block";


  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);


  newOkBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (onOk) onOk();
  });


  const handleEsc = (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none";
      if (onOk) onOk();
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);
}

window.addEventListener("click", (e) => {
  const modals = ["confirm-modal", "success-modal", "error-modal"];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  inicializarInterfazUsuario();
});