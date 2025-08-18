
const productos = [
  { id: 1, nombre: "Cartera Marrón", precio: 45000, imagen: "img/cartera1.jpg" },
  { id: 2, nombre: "Cartera Verde", precio: 52000, imagen: "img/cartera2.jpg" },
  { id: 3, nombre: "Cartera Burdeos", precio: 60000, imagen: "img/cartera3.jpg" }
];


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


const listaCarrito = document.getElementById("lista-carrito");
const totalElement = document.getElementById("total");
const mensaje = document.createElement("p");
mensaje.id = "mensaje";
document.querySelector(".carrito .container").prepend(mensaje);


let postCompra = document.getElementById("post-compra");
if (!postCompra) {
  postCompra = document.createElement("div");
  postCompra.id = "post-compra";
  postCompra.style.display = "none";
  postCompra.style.textAlign = "center";
  postCompra.style.marginTop = "1rem";
  postCompra.innerHTML = `
    <p>¡Compra completada!</p>
    <button id="seguir-comprando" class="btn">Seguir Comprando</button>
  `;
  document.querySelector(".carrito .container").appendChild(postCompra);
}

const btnSeguir = document.getElementById("seguir-comprando");


function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.style.opacity = "1";
  mensaje.style.transition = "opacity 0.5s";
  setTimeout(() => { mensaje.style.opacity = "0"; }, 2000);
}


function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    const cantidad = Number(item.cantidad) || 1;

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
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existe = carrito.find(p => p.id === id);
  if (existe) {
    existe.cantidad = (existe.cantidad || 1) + 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarrito();
  mostrarMensaje(`Producto agregado: ${producto.nombre}`);
}


function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarMensaje("No hay productos en el carrito");
    return;
  }

  const totalCompra = carrito.reduce((sum, p) => sum + p.precio * (p.cantidad || 1), 0);
  mostrarMensaje(`¡Compra finalizada! Total: $${totalCompra}`);

 
  carrito = [];
  actualizarCarrito();

  
  postCompra.style.display = "block";
}


btnSeguir.addEventListener("click", () => {
  postCompra.style.display = "none";
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
});


document.querySelectorAll(".producto .btn").forEach((btn, index) => {
  btn.dataset.id = index + 1; 
  btn.addEventListener("click", () => {
    const id = parseInt(btn.dataset.id);
    agregarAlCarrito(id);
  });
});


document.querySelector(".carrito .btn").addEventListener("click", finalizarCompra);


actualizarCarrito();
