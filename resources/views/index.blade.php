<!doctype html>
<html lang="es">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sigilious | Moda premium</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/layout.css" />
  <link rel="stylesheet" href="/css/animations.css" />


</head>

<body data-page="home">
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
        <a href="index" class="active">Inicio</a>
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
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <p class="eyebrow">Colección Sigilious 2026</p>
          <h1 class="hero-title animated-text">Precisión. Comodidad. Poder silencioso.</h1>
          <p class="hero-sub">Una línea premium inspirada en la claridad de Apple y la energía de Nike.</p>
          <div class="hero-cta">
            <a class="btn" href="shop">Comprar ahora</a>
            <a class="btn ghost" href="about">Nuestra historia</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card" data-parallax>
            <div class="hero-glow"></div>
            <div class="hero-label">Ajuste exclusivo</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Lanzamientos destacados</h2>
        <p>Esenciales seleccionados para el armario moderno.</p>
      </div>
      <div class="slider" id="featuredSlider">
        <div class="slide">
          <div class="product-thumb img-1"></div>
          <div class="slide-info">
            <h3>Sudadera Airline Tech</h3>
            <span>€98</span>
          </div>
        </div>
        <div class="slide">
          <div class="product-thumb img-2"></div>
          <div class="slide-info">
            <h3>Camiseta Costura Contour</h3>
            <span>€42</span>
          </div>
        </div>
        <div class="slide">
          <div class="product-thumb img-3"></div>
          <div class="slide-info">
            <h3>Pantalón Studio Taper</h3>
            <span>€76</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="section-head">
        <h2>Categorías</h2>
        <p>Encuentra tu talla en segundos.</p>
      </div>
      <div class="categories">
        <a class="category-card" href="/shop?category=tshirts">Camisetas</a>
        <a class="category-card" href="/shop?category=hoodies">Sudaderas</a>
        <a class="category-card" href="/shop?category=pants">Pantalones</a>
        <a class="category-card" href="/shop?category=accessories">Accesorios</a>
        <a class="category-card" href="/shop?category=shoes">Calzado</a>
      </div>
    </section>

    <section class="section brand">
      <div class="brand-content">
        <h2>Diseñado para moverse</h2>
        <p>Sigilious combina tejidos técnicos con una estética minimalista, ofreciendo básicos premium y siluetas de rendimiento para la vida urbana.</p>
        <a class="btn" href="shop">Explorar colección</a>
      </div>
    </section>

    <section class="section newsletter">
      <div class="newsletter-card">
        <h3>Únete al círculo Sigilious</h3>
        <p>Accede antes a los lanzamientos y ofertas exclusivas.</p>
        <form class="newsletter-form">
          <input type="email" placeholder="tu@email.com" required />
          <button class="btn" type="submit">Suscribirme</button>
        </form>
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

  <script type="module" src="/js/script.js"></script> <button class="back-to-top" id="backToTop" aria-label="Volver arriba">↑</button>
</body>

</html>