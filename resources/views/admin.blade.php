<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sigilious | Administración</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/animations.css" />


</head>
<body data-page="admin">
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
        <a href="shop">Tienda</a>
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
        <h1>Panel de administración</h1>
        <p>Gestiona el catálogo de productos.</p>
      </div>
      <div class="admin-layout">
        <form class="form card" id="adminForm" novalidate>
          <h3>Añadir / Editar producto</h3>
          <input type="hidden" id="productId" />
          <div class="form-row">
            <label for="productName">Nombre</label>
            <input type="text" id="productName" required />
            <small class="error" id="productNameError"></small>
          </div>
          <div class="form-row">
            <label for="productCategory">Categoría</label>
            <select id="productCategory" required>
              <option value="tshirts">Camisetas</option>
              <option value="hoodies">Sudaderas</option>
              <option value="pants">Pantalones</option>
              <option value="accessories">Accesorios</option>
              <option value="shoes">Calzado</option>
            </select>
          </div>
          <div class="form-row">
            <label for="productPrice">Precio</label>
            <input type="number" id="productPrice" required />
            <small class="error" id="productPriceError"></small>
          </div>
          <div class="form-row">
            <label for="productImage">Clase de imagen (img-1...img-9)</label>
            <input type="text" id="productImage" placeholder="img-1" required />
            <small class="error" id="productImageError"></small>
          </div>
          <button class="btn" type="submit">Guardar producto</button>
          <p class="form-success" id="adminSuccess"></p>
        </form>

        <div class="card" id="adminList"></div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">Sigilious</div>
      <p class="muted">© 2026 Sigilious. Todos los derechos reservados.</p>
    </div>
  </footer>

  <script type="module" src="/js/script.js"></script>  <button class="back-to-top" id="backToTop" aria-label="Volver arriba">↑</button>
</body>
</html>




