# Sigilious

Tienda online de ropa creada junto a un compañero. Esta versión migra el frontend original (HTML, CSS y JavaScript) a un proyecto **Laravel** con **MySQL**, añadiendo un backend completo: productos, usuarios, carrito, pedidos y panel de administración.

## Funcionalidades

- **Catálogo** con búsqueda, filtros por categoría y precio, y ordenación. Desde la página principal se puede entrar directamente a una categoría (`/shop?category=tshirts`).
- **Página de producto** con selección de talla y cantidad.
- **Carrito** que se guarda en la base de datos para cada usuario, de modo que le acompaña al iniciar sesión desde otro navegador.
- **Pedidos** guardados en MySQL. El servidor calcula el total a partir de los precios de la base de datos, sin fiarse del cliente.
- **Registro e inicio de sesión** con tokens de Laravel Sanctum.
- **Panel de administración** para crear, editar y borrar productos, accesible solo para usuarios con `is_admin`.
- Diseño responsive.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | PHP, Laravel 13, Laravel Sanctum |
| Base de datos | MySQL |
| Frontend | HTML5, CSS3, JavaScript (módulos ES), plantillas Blade |
| Entorno | Laragon, Composer, Git |

## Estructura principal

```
app/Http/Controllers/    Controladores (Auth, Product, Cart, Order)
app/Http/Middleware/     EnsureUserIsAdmin
app/Models/              Product, Cart, Order, User
database/migrations/     Tablas de la base de datos
database/seeders/        ProductSeeder (productos de ejemplo)
resources/views/         Páginas Blade (tienda, carrito, checkout, admin...)
public/css, public/js    Estilos y JavaScript del frontend
routes/web.php           Páginas y endpoint público de productos
routes/api.php           API: usuarios, carrito, pedidos y administración
```

## API

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/products` | Público |
| POST, PUT, DELETE | `/api/products`, `/api/products/{id}` | Administrador |
| POST | `/api/register`, `/api/login` | Público |
| POST | `/api/logout` | Usuario con sesión |
| GET, PUT | `/api/cart` | Usuario con sesión |
| POST | `/api/orders` | Público (si hay sesión, se asocia al usuario) |
| GET | `/api/orders` | Usuario con sesión |


📚 Documentación

Toda la documentación técnica de Sigilious está organizada en los siguientes documentos:

Arquitectura del proyecto

Base de datos

Instalación y configuración

Funcionalidades

API

Seguridad y mejoras

Historial de desarrollo

## Instalación

Requisitos: PHP 8.3 o superior, Composer y MySQL (se recomienda [Laragon](https://laragon.org)).

```bash
git clone https://github.com/RubenBG0204/sigilious-laravel.git
cd sigilious-laravel
composer install
cp .env.example .env
php artisan key:generate
```

Crea una base de datos llamada `sigilious` y configura el acceso en `.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigilious
DB_USERNAME=root
DB_PASSWORD=
```

Crea las tablas, carga los productos de ejemplo y arranca el servidor:

```bash
php artisan migrate
php artisan db:seed --class=ProductSeeder
php artisan serve
```

Con Laragon, si la carpeta está dentro de `www`, el sitio queda disponible en `http://sigilious.test`.

### Cuenta de administrador

Regístrate desde la web y, en la tabla `users` de la base de datos, pon el campo `is_admin` a `1` en tu usuario. Después podrás entrar en `/admin`.

## Pendiente

- Recuperación de contraseña por correo.
- Pasarela de pago real (el checkout actual valida los datos, pero no cobra).
- Tests automáticos.

## Autor

Rubén Barrutia Grasa · [GitHub](https://github.com/RubenBG0204)
