<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sigilious | Pago</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/animations.css" />


</head>
<body data-page="checkout">
  <div class="loader" id="loader">
    <div class="loader-ring"></div>
    <div class="loader-text">Sigilious</div>
  </div>

  <header class="header glass">
    <nav class="nav">
      <a class="logo" href="index">Sigilious</a>
      <button class="menu-toggle" id="menuToggle" aria-label="Alternar navegación">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        <a href="index">Inicio</a>
        <a href="shop" class="active">Tienda</a>
        <a href="about">Sobre nosotros</a>
        <a href="contact">Contacto</a>
      </div>
      <div class="nav-actions">
        <a class="icon-btn" href="cart" aria-label="Carrito">
          <span class="icon">🛍️</span>
          <span class="badge" id="cartCount">0</span>
        </a>
        <a class="icon-btn" href="profile" aria-label="Perfil">
          <span class="icon">👤</span>
        </a>


      </div>
    </nav>
  </header>

  <main class="page fade-in">
    <section class="section">
      <div class="section-head">
        <h1>Pago</h1>
        <p>Completa tu compra de forma segura.</p>
      </div>
      <div class="checkout-layout">
        <form class="form card" id="checkoutForm" novalidate>
          <div class="form-row">
            <label for="fullName">Nombre completo</label>
            <input type="text" id="fullName" required />
            <small class="error" id="nameError"></small>
          </div>
          <div class="form-row">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" required />
            <small class="error" id="emailError"></small>
          </div>
          <div class="form-row">
            <label for="address">Dirección</label>
            <input type="text" id="address" required />
            <small class="error" id="addressError"></small>
          </div>
          <div class="form-row">
            <label for="card">Número de tarjeta</label>
            <input type="text" id="card" placeholder="4242 4242 4242 4242" required />
            <small class="error" id="cardError"></small>
          </div>
          <button type="submit" class="btn">Realizar pedido</button>
          <p class="form-success" id="checkoutSuccess"></p>
        </form>
        <div class="card" id="checkoutSummary"></div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">Sigilious</div>
      <div class="footer-links">
        <a href="about">Sobre nosotros</a>
        <a href="contact">Contacto</a>
        <a href="orders">Pedidos</a>
      </div>
      <div class="socials">
        <a href="#" aria-label="Instagram">Instagram</a>
        <a href="#" aria-label="Pinterest">Pinterest</a>
        <a href="#" aria-label="TikTok">TikTok</a>
      </div>
      <p class="muted">© 2026 Sigilious. Todos los derechos reservados.</p>
    </div>
  </footer>

  <script type="module" src="/js/script.js"></script>  <button class="back-to-top" id="backToTop" aria-label="Volver arriba">↑</button>
</body>
</html>




