document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();
  setupFormValidation();

  if (window.location.pathname.includes("carrito.html")) {
    renderCart();
  }
});


async function loadProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  try {
    const response = await fetch("https://fakestoreapi.com/products");
    let data = await response.json();

    data = data.slice(8, 14);
    grid.innerHTML = "";

    data.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <img src="${prod.image}" alt="${prod.title}">
        <h3>${prod.title.slice(0, 40)}...</h3>
        <p class="price">$${prod.price}</p>
        <button class="btn-add" data-id="${prod.id}">Añadir al carrito</button>
      `;

      grid.appendChild(card);
    });

    addCartListeners();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}


function addCartListeners() {
  const buttons = document.querySelectorAll(".btn-add");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;

      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      const product = await response.json();

      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image
      });

      alert("Producto añadido al carrito");
    });
  });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  let item = cart.find(p => p.id === product.id);

  if (item) {
    item.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(cart));
  updateCartCount();
}


function updateCartCount() {
  const span = document.getElementById("cart-count");
  if (!span) return;

  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  span.textContent = count;
}


function renderCart() {
  const container = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  if (!container) return;

  let cart = JSON.parse(localStorage.getItem("carrito")) || [];

  container.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
        <img src="${item.image}" />

        <div class="cart-info">
            <h3>${item.title}</h3>
            <p>$${item.price}</p>
            <p>Cantidad: ${item.quantity}</p>
        </div>

        <div class="cart-actions">
            <button class="increase" data-id="${item.id}">▲</button>
            <button class="decrease" data-id="${item.id}">▼</button>
            <button class="remove" data-id="${item.id}">X</button>
        </div>
    `;

    container.appendChild(div);
  });

  totalElement.textContent = total.toFixed(2);

  cartActions();
}


function cartActions() {
  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      let cart = JSON.parse(localStorage.getItem("carrito")) || [];
      let item = cart.find(p => p.id === id);

      item.quantity++;
      localStorage.setItem("carrito", JSON.stringify(cart));
      renderCart();
      updateCartCount();
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      let cart = JSON.parse(localStorage.getItem("carrito")) || [];
      let item = cart.find(p => p.id === id);

      if (item.quantity > 1) item.quantity--;
      localStorage.setItem("carrito", JSON.stringify(cart));
      renderCart();
      updateCartCount();
    });
  });

  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      let cart = JSON.parse(localStorage.getItem("carrito")) || [];

      cart = cart.filter(p => p.id !== id);
      localStorage.setItem("carrito", JSON.stringify(cart));
      renderCart();
      updateCartCount();
    });
  });
}


function setupFormValidation() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (nombre.length < 3) {
      alert("El nombre debe tener al menos 3 caracteres.");
      e.preventDefault();
      return;
    }

    if (!validateEmail(email)) {
      alert("Ingresa un email válido.");
      e.preventDefault();
      return;
    }

    if (mensaje.length < 10) {
      alert("El mensaje debe contener al menos 10 caracteres.");
      e.preventDefault();
      return;
    }

    alert("Formulario enviado correctamente");
  });
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
let selectedStars = 0;

document.querySelectorAll(".stars-selector span").forEach(star => {
  star.addEventListener("click", () => {

    const stars = Array.from(document.querySelectorAll(".stars-selector span"));
    const index = stars.indexOf(star);
    selectedStars = 5 - index;

    stars.forEach(s => s.classList.remove("active"));

    for (let i = 0; i < selectedStars; i++) {
      stars[4 - i].classList.add("active");
    }
  });
});


function loadComments() {
  const comments = JSON.parse(localStorage.getItem("comments")) || [];
  const list = document.getElementById("comments-list");
  list.innerHTML = "";

  comments.forEach((c, index) => {
    const div = document.createElement("div");
    div.classList.add("comment");

    div.innerHTML = `
      <img src="media/img/anonimo.webp" alt="Avatar Anónimo">

      <div class="info">
        <h4>${c.user} • <span style="color:#888">${c.date}</span></h4>

        <div class="rating">${"★".repeat(c.stars)}${"☆".repeat(5 - c.stars)}</div>

        <p>${c.text}</p>
      </div>

      <button class="delete-comment" data-index="${index}">✕</button>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll(".delete-comment").forEach(btn => {
    btn.addEventListener("click", deleteComment);
  });
}


function deleteComment(event) {
  const index = event.target.dataset.index;

  const comments = JSON.parse(localStorage.getItem("comments")) || [];

  comments.splice(index, 1);

  localStorage.setItem("comments", JSON.stringify(comments));

  loadComments();
}


document.getElementById("submit-comment").addEventListener("click", () => {
  const input = document.getElementById("comment-input");
  const text = input.value.trim();

  if (text === "" || selectedStars === 0) {
    alert("Debes escribir un comentario y elegir un número de estrellas.");
    return;
  }

  const comments = JSON.parse(localStorage.getItem("comments")) || [];

  comments.push({
    user: "Usuario Anónimo",
    text: text,
    stars: selectedStars,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("comments", JSON.stringify(comments));

  input.value = "";
  selectedStars = 0;

  document.querySelectorAll(".stars-selector span").forEach(s => s.classList.remove("active"));

  loadComments();
});


document.addEventListener("DOMContentLoaded", loadComments);
