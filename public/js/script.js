import {
  getProducts,
  filterProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  syncProductsFromSupabase,
  addProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase
} from "./products.js";
import {
  addToCart,
  getCart,
  updateQty,
  removeItem,
  clearCart,
  cartCount,
  syncCartFromSupabase
} from "./cart.js";
import { registerUser, login, getCurrentUser, logout, requestPasswordReset } from "./users.js";
import { createOrder, getUserOrders, syncOrdersFromSupabase } from "./orders.js";
import {
  showToast,
  setButtonLoading,
  validateField,
  formatPrice,
  updateCartBadge,
  smoothScrollTo
} from "./ui-helpers.js";
import { initMenu, initLoader, initScrollReveal, initPageTransitions, initTiltEffects, initParallax, initBackToTop } from "./ui.js";
import { initRouter } from "./router.js";

const page = document.body.dataset.page;

initMenu();
initLoader();
initScrollReveal();
initPageTransitions();
initTiltEffects();
initParallax();
initBackToTop();
initRouter();
initMobileNav();
updateCartBadge();

await syncProductsFromSupabase();
await syncCartFromSupabase();
await syncOrdersFromSupabase();
updateCartBadge();

if (page === "shop") initShop();
if (page === "product") initProduct();
if (page === "cart") initCart();
if (page === "checkout") initCheckout();
if (page === "login") initLogin();
if (page === "forgot-password") initForgotPassword();
if (page === "register") initRegister();
if (page === "profile") initProfile();
if (page === "orders") initOrders();
if (page === "admin") initAdmin();
if (page === "contact") initContact();
if (page === "home") initHome();

function initMobileNav() {
  const navLinks = document.getElementById("navLinks");
  if (!navLinks) return;

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

function simulateAsync(callback, delay = 450) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        const result = callback();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

async function runButtonAction(button, loadingText, task) {
  const restore = setButtonLoading(button, true, loadingText);
  try {
    return await task();
  } finally {
    restore();
  }
}

function getCartDetails() {
  const products = getProducts();
  const cart = getCart();
  const items = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal: product.price * item.qty
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, total };
}

function renderProducts(container, products) {
  if (!container) return;

  container.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-img ${product.image}"></div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <div class="card-actions">
          <a class="btn ghost" href="product?id=${product.id}">Ver</a>
          <button class="btn add-to-cart" data-id="${product.id}" type="button">Añadir al carrito</button>
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async () => {
      const product = getProductById(button.dataset.id);
      if (!product) return;

      await runButtonAction(button, "Añadiendo...", async () => {
        await simulateAsync(() => addToCart(product.id, 1, "M"), 320);
        updateCartBadge();
        showToast(`${product.name} se ha añadido al carrito en talla M.`, "success");
      });
    });
  });
}

function initShop() {
  const grid = document.getElementById("shopGrid");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const price = document.getElementById("priceFilter");
  const sort = document.getElementById("sortFilter");

  if (!grid || !search || !category || !price || !sort) return;

  const applyFilters = () => {
    const products = filterProducts({
      search: search.value,
      category: category.value,
      price: price.value,
      sort: sort.value
    });
    renderProducts(grid, products);
  };

  [search, category, price, sort].forEach((element) => {
    element.addEventListener("input", applyFilters);
    element.addEventListener("change", applyFilters);
  });

  const initialCategory = new URLSearchParams(window.location.search).get("category");
  if (initialCategory && [...category.options].some((option) => option.value === initialCategory)) {
    category.value = initialCategory;
  }

  applyFilters();
}

function initProduct() {
  const container = document.getElementById("productDetail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "p1";
  const product = getProductById(id) || getProducts()[0];

  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-gallery">
        <div class="gallery-main ${product.image}"></div>
        <div class="gallery-thumbs">
          <div class="thumb ${product.image}"></div>
          <div class="thumb img-4"></div>
          <div class="thumb img-7"></div>
        </div>
      </div>
      <div class="card">
        <h1>${product.name}</h1>
        <p class="price">${formatPrice(product.price)}</p>
        <p class="muted">${product.description}</p>
        <div class="size-selector" id="sizeSelector">
          ${product.sizes.map((size) => `<button type="button" data-size="${size}">${size}</button>`).join("")}
        </div>
        <small class="error" id="sizeError"></small>
        <div class="qty">
          <button type="button" id="qtyMinus">-</button>
          <span id="qtyValue">1</span>
          <button type="button" id="qtyPlus">+</button>
        </div>
        <button class="btn" id="addProduct" type="button">Añadir al carrito</button>
      </div>
    </div>
  `;

  let qty = 1;
  let selectedSize = "";

  const qtyValue = document.getElementById("qtyValue");
  const sizeError = document.getElementById("sizeError");
  const sizeButtons = [...document.querySelectorAll("#sizeSelector button")];
  const addButton = document.getElementById("addProduct");

  document.getElementById("qtyMinus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValue.textContent = String(qty);
  });

  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty += 1;
    qtyValue.textContent = String(qty);
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      sizeButtons.forEach((entry) => entry.classList.toggle("active", entry === button));
      if (sizeError) sizeError.textContent = "";
    });
  });

  addButton.addEventListener("click", async () => {
    if (!selectedSize) {
      if (sizeError) sizeError.textContent = "Selecciona una talla.";
      showToast("Selecciona una talla antes de añadir el producto.", "error");
      return;
    }

    await runButtonAction(addButton, "Añadiendo...", async () => {
      await simulateAsync(() => addToCart(product.id, qty, selectedSize), 360);
      updateCartBadge();
      if (sizeError) sizeError.textContent = "";
      showToast(`${product.name} añadido al carrito. Talla ${selectedSize}.`, "success");
    });
  });

  const related = document.getElementById("relatedProducts");
  const relatedProducts = getProducts().filter((entry) => entry.id !== product.id).slice(0, 4);
  renderProducts(related, relatedProducts);
}

function initCart() {
  const itemsElement = document.getElementById("cartItems");
  const summaryElement = document.getElementById("cartSummary");
  if (!itemsElement || !summaryElement) return;

  const renderCart = () => {
    const { items, total } = getCartDetails();

    if (!items.length) {
      itemsElement.innerHTML = "<p class='muted'>Tu carrito está vacío.</p>";
      summaryElement.innerHTML = "<p class='muted'>Añade productos para continuar.</p>";
      updateCartBadge();
      return;
    }

    itemsElement.innerHTML = items.map((item) => `
      <div class="cart-item card">
        <div class="product-img ${item.product.image}"></div>
        <div class="cart-meta">
          <h3>${item.product.name}</h3>
          <p class="muted">${formatPrice(item.product.price)}</p>
          <span class="cart-size">Talla ${item.size || "M"}</span>
          <div class="qty">
            <button data-action="minus" data-id="${item.product.id}" data-size="${item.size}" type="button">-</button>
            <span>${item.qty}</span>
            <button data-action="plus" data-id="${item.product.id}" data-size="${item.size}" type="button">+</button>
            <button data-action="remove" data-id="${item.product.id}" data-size="${item.size}" class="btn ghost" type="button">Eliminar</button>
          </div>
        </div>
        <strong>${formatPrice(item.lineTotal)}</strong>
      </div>
    `).join("");

    summaryElement.innerHTML = `
      <h3>Resumen</h3>
      <p>Artículos: <strong>${cartCount()}</strong></p>
      <p>Total: <strong>${formatPrice(total)}</strong></p>
      <a class="btn" href="checkout">Pagar</a>
    `;

    itemsElement.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", async () => {
        const { id, size, action } = button.dataset;
        const currentItem = getCart().find((entry) => entry.id === id && entry.size === size);
        if (!currentItem) return;

        await runButtonAction(button, "Actualizando...", async () => {
          await simulateAsync(() => {
            if (action === "minus") updateQty(id, size, currentItem.qty - 1);
            if (action === "plus") updateQty(id, size, currentItem.qty + 1);
            if (action === "remove") removeItem(id, size);
          }, 220);

          updateCartBadge();
          renderCart();

          if (action === "remove") {
            showToast("Producto eliminado del carrito.", "info");
          }
        });
      });
    });
  };

  renderCart();
}

function initCheckout() {
  const summary = document.getElementById("checkoutSummary");
  const form = document.getElementById("checkoutForm");
  const success = document.getElementById("checkoutSuccess");
  if (!summary || !form || !success) return;

  const renderSummary = () => {
    const { items, total } = getCartDetails();
    summary.innerHTML = `
      <h3>Resumen del pedido</h3>
      ${items.map((item) => `
        <p>${item.product.name} x${item.qty} <span class="muted">(Talla ${item.size || "M"})</span></p>
      `).join("")}
      <p>Artículos: ${cartCount()}</p>
      <p>Total: <strong>${formatPrice(total)}</strong></p>
    `;
  };

  renderSummary();

  const name = document.getElementById("fullName");
  const email = document.getElementById("email");
  const address = document.getElementById("address");
  const card = document.getElementById("card");
  const submitButton = form.querySelector('button[type="submit"]');

  const rules = [
    { input: name, config: { errorId: "nameError", required: true, minLength: 3 } },
    { input: email, config: { errorId: "emailError", required: true, isEmail: true } },
    { input: address, config: { errorId: "addressError", required: true, minLength: 8 } },
    { input: card, config: { errorId: "cardError", required: true, isCreditCard: true } }
  ];

  rules.forEach(({ input, config }) => {
    input?.addEventListener("blur", () => {
      validateField(input, config);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const { items, total } = getCartDetails();
    if (!items.length) {
      showToast("Tu carrito está vacío.", "error");
      return;
    }

    const isValid = rules.every(({ input, config }) => validateField(input, config));
    if (!isValid) {
      showToast("Revisa los campos marcados antes de continuar.", "error");
      return;
    }

    await runButtonAction(submitButton, "Procesando...", async () => {
      await simulateAsync(async () => {
        const user = getCurrentUser();
        await createOrder({
          id: `o${Date.now()}`,
          userId: user ? user.id : "guest",
          name: name.value.trim(),
          items,
          total,
          date: new Date().toISOString()
        });
        clearCart();
      }, 520);

      updateCartBadge();
      renderSummary();
      success.textContent = "Pedido realizado correctamente.";
      form.reset();
      [name, email, address, card].forEach((input) => {
        input.classList.remove("input-valid", "input-invalid");
      });
      showToast("Pedido completado con éxito.", "success");
      smoothScrollTo(success, { offset: 120 });
    });
  });
}

function initLogin() {
  const form = document.getElementById("loginForm");
  const success = document.getElementById("loginSuccess");
  if (!form || !success) return;

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const submitButton = form.querySelector('button[type="submit"]');

  const rules = [
    { input: email, config: { errorId: "emailError", required: true, isEmail: true } },
    { input: password, config: { errorId: "passwordError", required: true, minLength: 6 } }
  ];

  rules.forEach(({ input, config }) => {
    input?.addEventListener("blur", () => validateField(input, config));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const isValid = rules.every(({ input, config }) => validateField(input, config));
    if (!isValid) {
      showToast("Introduce un email y contraseña válidos.", "error");
      return;
    }

    await runButtonAction(submitButton, "Entrando...", async () => {
      const result = await simulateAsync(() => login(email.value.trim(), password.value), 420);
      if (result.success) {
        await syncCartFromSupabase();
        await syncOrdersFromSupabase();
        updateCartBadge();
        success.textContent = "Inicio de sesión correcto.";
        showToast("Sesión iniciada correctamente.", "success");
      } else {
        success.textContent = "";
        showToast(result.message, "error");
      }
    });
  });
}

function initForgotPassword() {
  const form = document.getElementById("forgotPasswordForm");
  const success = document.getElementById("forgotPasswordSuccess");
  if (!form || !success) return;

  const email = document.getElementById("email");
  const submitButton = form.querySelector('button[type="submit"]');
  const rule = { input: email, config: { errorId: "emailError", required: true, isEmail: true } };

  email?.addEventListener("blur", () => validateField(rule.input, rule.config));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const isValid = validateField(rule.input, rule.config);
    if (!isValid) {
      showToast("Introduce un correo válido.", "error");
      return;
    }

    await runButtonAction(submitButton, "Enviando...", async () => {
      const result = await simulateAsync(() => requestPasswordReset(email.value.trim()), 420);
      if (result.success) {
        success.textContent = "Te hemos enviado un correo para recuperar la contraseña.";
        showToast("Correo de recuperación enviado.", "success");
        form.reset();
        email.classList.remove("input-valid", "input-invalid");
      } else {
        showToast(result.message, "error");
      }
    });
  });
}

function initRegister() {
  const form = document.getElementById("registerForm");
  const success = document.getElementById("registerSuccess");
  if (!form || !success) return;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const submitButton = form.querySelector('button[type="submit"]');

  const rules = [
    { input: name, config: { errorId: "nameError", required: true, minLength: 3 } },
    { input: email, config: { errorId: "emailError", required: true, isEmail: true } },
    { input: password, config: { errorId: "passwordError", required: true, minLength: 6 } }
  ];

  rules.forEach(({ input, config }) => {
    input?.addEventListener("blur", () => validateField(input, config));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const isValid = rules.every(({ input, config }) => validateField(input, config));
    if (!isValid) {
      showToast("Completa correctamente los campos del registro.", "error");
      return;
    }

    await runButtonAction(submitButton, "Creando...", async () => {
      const result = await simulateAsync(() => registerUser({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value
      }), 450);

      if (result.success) {
        await syncCartFromSupabase();
        await syncOrdersFromSupabase();
        updateCartBadge();
        success.textContent = "Cuenta creada.";
        form.reset();
        [name, email, password].forEach((input) => input.classList.remove("input-valid", "input-invalid"));
        showToast("Cuenta creada correctamente.", "success");
      } else {
        success.textContent = "";
        showToast(result.message, "error");
      }
    });
  });
}

function initProfile() {
  const card = document.getElementById("profileCard");
  if (!card) return;

  const user = getCurrentUser();
  if (!user) {
    card.innerHTML = "<p class='muted'>No has iniciado sesión.</p><a class='btn' href='login.html'>Iniciar sesión</a>";
    return;
  }

  card.innerHTML = `
    <h2>${user.name}</h2>
    <p class="muted">${user.email}</p>
    <button class="btn ghost" id="logoutBtn" type="button">Cerrar sesión</button>
  `;

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await logout();
    showToast("Sesión cerrada.", "info");
    window.setTimeout(() => window.location.reload(), 250);
  });
}

function initOrders() {
  const list = document.getElementById("ordersList");
  if (!list) return;

  const user = getCurrentUser();
  const orders = user ? getUserOrders(user.id) : [];

  if (!orders.length) {
    list.innerHTML = "<p class='muted'>Aún no hay pedidos.</p>";
    return;
  }

  list.innerHTML = orders.map((order) => `
    <div class="order-card">
      <h3>Pedido ${order.id}</h3>
      <p class="muted">${new Date(order.date).toLocaleDateString()}</p>
      <p>Total: ${formatPrice(order.total)}</p>
    </div>
  `).join("");
}

function initAdmin() {
  const list = document.getElementById("adminList");
  const form = document.getElementById("adminForm");
  const success = document.getElementById("adminSuccess");
  if (!list || !form || !success) return;

  const fields = {
    id: document.getElementById("productId"),
    name: document.getElementById("productName"),
    category: document.getElementById("productCategory"),
    price: document.getElementById("productPrice"),
    image: document.getElementById("productImage")
  };

  const submitButton = form.querySelector('button[type="submit"]');
  const rules = [
    { input: fields.name, config: { errorId: "productNameError", required: true, minLength: 3 } },
    { input: fields.price, config: { errorId: "productPriceError", required: true } },
    { input: fields.image, config: { errorId: "productImageError", required: true, minLength: 5 } }
  ];

  rules.forEach(({ input, config }) => {
    input?.addEventListener("blur", () => validateField(input, config));
  });

  const render = () => {
    const products = getProducts();
    list.innerHTML = `
      <h3>Productos</h3>
      <div class="admin-list">
        ${products.map((product) => `
          <div class="admin-item">
            <span>${product.name} - ${formatPrice(product.price)}</span>
            <div>
              <button class="btn ghost" data-action="edit" data-id="${product.id}" type="button">Editar</button>
              <button class="btn ghost" data-action="delete" data-id="${product.id}" type="button">Eliminar</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    list.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", async () => {
        const { id, action } = button.dataset;

        if (action === "edit") {
          const product = getProductById(id);
          if (!product) return;
          fields.id.value = product.id;
          fields.name.value = product.name;
          fields.category.value = product.category;
          fields.price.value = product.price;
          fields.image.value = product.image;
          showToast("Producto cargado para edición.", "info");
          smoothScrollTo(form, { offset: 100 });
          return;
        }

        await runButtonAction(button, "Eliminando...", async () => {
          await simulateAsync(async () => {
            try {
              await deleteProductFromSupabase(id);
            } catch (error) {
              console.warn(error);
              deleteProduct(id);
            }
          }, 280);
          render();
          showToast("Producto eliminado.", "success");
        });
      });
    });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const isValid = rules.every(({ input, config }) => validateField(input, config));
    if (!isValid) {
      showToast("Revisa los datos del producto.", "error");
      return;
    }

    const product = {
      id: fields.id.value || `p${Date.now()}`,
      name: fields.name.value.trim(),
      category: fields.category.value,
      price: Number(fields.price.value),
      image: fields.image.value.trim(),
      description: "Producto personalizado",
      sizes: ["S", "M", "L", "XL"]
    };

    await runButtonAction(submitButton, "Guardando...", async () => {
      await simulateAsync(async () => {
        const exists = getProductById(product.id);
        try {
          if (exists) await updateProductInSupabase(product);
          else await addProductToSupabase(product);
        } catch (error) {
          console.warn(error);
          if (exists) updateProduct(product);
          else addProduct(product);
        }
      }, 420);

      success.textContent = "Producto guardado.";
      form.reset();
      fields.id.value = "";
      Object.values(fields).forEach((field) => field?.classList.remove("input-valid", "input-invalid"));
      render();
      showToast("Producto guardado correctamente.", "success");
    });
  });

  render();
}

function initContact() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("contactSuccess");
  if (!form || !success) return;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  const submitButton = form.querySelector('button[type="submit"]');

  const rules = [
    { input: name, config: { errorId: "nameError", required: true, minLength: 2 } },
    { input: email, config: { errorId: "emailError", required: true, isEmail: true } },
    { input: message, config: { errorId: "messageError", required: true, minLength: 10 } }
  ];

  rules.forEach(({ input, config }) => {
    input?.addEventListener("blur", () => validateField(input, config));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    success.textContent = "";

    const isValid = rules.every(({ input, config }) => validateField(input, config));
    if (!isValid) {
      showToast("Completa correctamente el formulario de contacto.", "error");
      return;
    }

    await runButtonAction(submitButton, "Enviando...", async () => {
      await simulateAsync(() => true, 500);
      success.textContent = "¡Gracias! Te responderemos pronto.";
      form.reset();
      [name, email, message].forEach((input) => input.classList.remove("input-valid", "input-invalid"));
      showToast("Mensaje enviado. Te responderemos pronto.", "success");
    });
  });
}

function initHome() {
  const newsletterForm = document.querySelector(".newsletter-form");
  if (!newsletterForm) return;

  const emailInput = newsletterForm.querySelector('input[type="email"]');
  const submitButton = newsletterForm.querySelector('button[type="submit"]');
  if (!emailInput || !submitButton) return;

  emailInput.addEventListener("blur", () => {
    validateField(emailInput, { required: true, isEmail: true });
  });

  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateField(emailInput, { required: true, isEmail: true })) {
      showToast("Introduce un email válido para suscribirte.", "error");
      return;
    }

    await runButtonAction(submitButton, "Enviando...", async () => {
      await simulateAsync(() => true, 350);
      newsletterForm.reset();
      emailInput.classList.remove("input-valid", "input-invalid");
      showToast("Suscripción completada.", "success");
    });
  });
}
