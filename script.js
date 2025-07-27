console.log ("El script funciona")

const titulo = document.getElementById("Titulo")
titulo.textContent = "Hola, mundo!"


function verificarEdad() {
  let edad = prompt("¿Cuántos años tenés?");
  if (edad >= 18) {
    return true;
  } else {
    alert("Debés tener al menos 18 años para usar el simulador.");
    return false;
  }
}


function elegirCartera() {
  alert("Catálogo de Carteras:\n1 - Cartera Roja ($10.000)\n2 - Cartera Negra ($12.000)\n3 - Cartera Marrón ($15.000)");

  let eleccion = prompt("Elegí el número de la cartera que querés comprar (1, 2 o 3):");
  let nombre = "";
  let precio = 0;

  if (eleccion == "1") {
    nombre = "Cartera Roja";
    precio = 10000;
  } else if (eleccion == "2") {
    nombre = "Cartera Negra";
    precio = 12000;
  } else if (eleccion == "3") {
    nombre = "Cartera Marrón";
    precio = 15000;
  } else {
    alert("Opción no válida.");
    return;
  }

  // Función 3: Confirmar compra
  let confirmar = confirm("¿Querés comprar la " + nombre + " por $" + precio + "?");
  if (confirmar) {
    alert("¡Gracias por tu compra!");
  } else {
    alert("Compra cancelada.");
  }
}

// Inicio del simulador
alert("Bienvenida al Simulador de Venta de Carteras");

let puedeContinuar = verificarEdad();

if (puedeContinuar) {
  elegirCartera();
}
