<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sigilious | Tienda</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/animations.css" />


</head>
<body data-page="shop">
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
        <h1>Tienda</h1>
        <p>Encuentra tu ajuste perfecto con esenciales seleccionados.</p>
      </div>

      <div class="shop-controls">
        <input class="search" type="text" id="searchInput" placeholder="Buscar productos..." />
        <select id="categoryFilter">
          <option value="all">Todas las categorías</option>
          <option value="tshirts">Camisetas</option>
          <option value="hoodies">Sudaderas</option>
          <option value="pants">Pantalones</option>
          <option value="accessories">Accesorios</option>
          <option value="shoes">Calzado</option>
        </select>
        <select id="priceFilter">
          <option value="all">Todos los precios</option>
          <option value="0-40">Menos de €40</option>
          <option value="40-80">€40 - €80</option>
          <option value="80-150">€80 - €150</option>
        </select>
        <select id="sortFilter">
          <option value="featured">Orden: Destacados</option>
          <option value="low">Precio: menor a mayor</option>
          <option value="high">Precio: mayor a menor</option>
          <option value="name">Nombre: A-Z</option>
        </select>
      </div>

      <div class="products" id="shopGrid"></div>
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




