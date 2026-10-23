# Historial de desarrollo

> Documentación elaborada solo a partir de `Sigilious_Guia_Tecnica.pdf`. La guía **no incluye fechas** de los commits y no se ha consultado el repositorio, por lo que aquí no figura ninguna fecha.

El trabajo se hizo en orden y, según la guía, con un commit por funcionalidad: cada commit cuenta un paso de la evolución del proyecto («primero…, después…»). Un commit es una foto del proyecto en un momento.

## Los 6 commits

Orden cronológico (del primero al último):

| # | Hash | Mensaje | Qué cambió |
|---|---|---|---|
| 1 | `a024925` | Sigilious con Laravel: frontend migrado, productos en MySQL | Proyecto Laravel, vistas Blade, tabla `products`, seeder, `/api/products` |
| 2 | `327669e` | Autenticación con Laravel Sanctum | Registro, login y logout con tokens |
| 3 | `e30c079` | Pedidos guardados en MySQL con total calculado en el servidor | Tabla `orders` y `OrderController` |
| 4 | `e8892a8` | Carrito guardado en MySQL por usuario | Tabla `carts` y `CartController` |
| 5 | `e89026b` | Panel de administración de productos… protegido | `is_admin`, middleware y CRUD de productos |
| 6 | `b2582cb` | README del proyecto | README y borrado de `supabase-config.js` |

> **Pendiente de verificar con `git log --oneline`:** el mensaje del commit `e89026b` aparece en la guía con puntos suspensivos («Panel de administración de productos… protegido»), así que está incompleto. Se reproduce tal cual figura en la guía.

> **Pendiente de verificación:** la guía afirma que «cada subapartado corresponde a un commit», pero tiene 8 subapartados (4.1–4.8) y 6 commits. La correspondencia de las secciones siguientes se ha deducido de los mensajes y de la columna «Qué cambió». El filtro por categoría (subapartado 4.3) no figura en ningún mensaje de commit.

## Detalle por commit

### Commit 1 — `a024925`: Laravel, frontend migrado y productos en MySQL

**Crear el proyecto y migrar el frontend.** Se creó un proyecto Laravel nuevo con Composer (`composer create-project laravel/laravel sigilious`, o con el instalador de Laravel) dentro de la carpeta `www` de Laragon. Después se movió el frontend a las carpetas donde Laravel espera cada cosa:

| Antes (proyecto estático) | Ahora (Laravel) | Por qué |
|---|---|---|
| `css/`, `js/` | `public/css/`, `public/js/` | `public/` es la única carpeta que el navegador puede pedir directamente. |
| `index.html`, `shop.html`… | `resources/views/index.blade.php`, `shop.blade.php`… | Laravel entrega páginas desde las vistas Blade, no archivos sueltos. |
| Enlaces `shop.html` | Enlaces `shop` | Las URL ya no son archivos; son rutas definidas en `web.php`. |
| `product.html?id=3` | `product?id=3` | Igual: la ruta es `/product` y `?id=` es un parámetro. |
| `href="css/style.css"` | `href="/css/style.css"` | Con `/` al principio la ruta es absoluta y funciona en cualquier página. |

Los enlaces se cambiaron con buscar y reemplazar de VS Code, limitado a `resources/views` y `public/js`.

> **Pendiente de verificación:** la guía menciona dos formas de crear el proyecto (Composer o el instalador de Laravel) sin indicar cuál se usó.

**Base de datos de productos.** Comandos usados, en orden:

| Comando / acción | Qué hace |
|---|---|
| Crear la base `sigilious` en phpMyAdmin | Una base vacía. Laravel no la crea; solo crea las tablas dentro. |
| Editar `.env` (`DB_DATABASE`, `DB_USERNAME`…) | Dice a Laravel a qué base conectarse. |
| `php artisan make:model Product -m` | Crea el modelo `Product` y (`-m`) una migración para su tabla. |
| `php artisan migrate` | Ejecuta las migraciones pendientes: crea las tablas y anota cuáles ya corrieron en la tabla `migrations`. |
| `php artisan make:seeder ProductSeeder` | Crea una clase para insertar datos iniciales. |
| `php artisan db:seed --class=ProductSeeder` | Ejecuta ese seeder y rellena `products` con los 9 productos. |
| `php artisan make:controller ProductController` | Crea el controlador que devolverá los productos. |

El código de la migración, el modelo y el seeder está en [base-de-datos.md](base-de-datos.md); el controlador y la ruta, en [funcionalidades.md](funcionalidades.md#catálogo-y-filtros-de-productos).

### Funcionalidad sin commit asignado en la guía — filtro por categoría (4.3)

Los accesos de la home enlazan a `shop?category=tshirts` y `initShop()` lee ese parámetro. El código está en [funcionalidades.md](funcionalidades.md#filtro-por-categoría-desde-la-página-principal). Ver la nota de verificación sobre la asignación de commits.

### Commit 2 — `327669e`: Autenticación con Laravel Sanctum

| Comando | Qué hace |
|---|---|
| `php artisan install:api` | Instala Sanctum, crea `routes/api.php`, la migración de `personal_access_tokens` y `config/sanctum.php`, y registra `api.php` en `bootstrap/app.php` (la línea `api: ...`). |
| `php artisan migrate` | Crea la tabla `personal_access_tokens`. |
| `php artisan make:controller AuthController` | Controlador de registro, login y logout. |

En el frontend, `users.js` pasó a llamar a `/api/login`, `/api/register` y `/api/logout`. Código y explicación: [funcionalidades.md](funcionalidades.md#registro-inicio-y-cierre-de-sesión).

### Commit 3 — `e30c079`: Pedidos con el total calculado en el servidor

| Comando | Qué hace |
|---|---|
| `php artisan make:model Order -m` | Modelo `Order` y su migración. |
| `php artisan make:controller OrderController` | Controlador de pedidos. |
| `php artisan migrate` | Crea la tabla `orders`. |

Código: [funcionalidades.md](funcionalidades.md#pedidos) y [base-de-datos.md](base-de-datos.md#35-orders).

### Commit 4 — `e8892a8`: Carrito guardado por usuario

| Comando | Qué hace |
|---|---|
| `php artisan make:model Cart -m` | Modelo y migración de `carts`. |
| `php artisan make:controller CartController` | Controlador con `show` y `update`. |
| `php artisan migrate` | Crea la tabla `carts`. |

Código: [funcionalidades.md](funcionalidades.md#carrito-de-compra).

### Commit 5 — `e89026b`: Panel de administración protegido

| Comando | Qué hace |
|---|---|
| `php artisan make:migration add_is_admin_to_users_table --table=users` | Migración que modifica una tabla existente. |
| `php artisan make:middleware EnsureUserIsAdmin` | Crea el middleware. |
| `php artisan migrate` | Añade la columna `is_admin` a `users`. |
| `php artisan route:list` | Lista todas las rutas y sus middleware (para comprobar que las rutas de admin están protegidas). |

Código: [funcionalidades.md](funcionalidades.md#panel-de-administración).

### Commit 6 — `b2582cb`: README y limpieza de Supabase

- Se borró `public/js/supabase-config.js` (el proyecto de Supabase ya no existía).
- Se escribió el `README.md`: descripción, funciones, tecnologías, estructura, tabla de la API, instalación y administrador.
- El repositorio se subió a GitHub: [github.com/RubenBG0204/sigilious-laravel](https://github.com/RubenBG0204/sigilious-laravel).

## Problemas encontrados y soluciones

| Fase | Problema | Solución descrita |
|---|---|---|
| Migración del frontend (commit 1) | En buscar y reemplazar, la primera vista previa incluía `composer.lock`, que no se debe tocar. | Limitar el reemplazo a `resources/views` y `public/js`. |
| Migración del frontend (commit 1) | Algunos enlaces no se cambiaron con el primer reemplazo: los que llevan `#`, los que llevan `?` y `login.html`. | Reemplazos extra específicos para esos casos. |
| Filtro por categoría (4.3) | El filtro parecía no funcionar. | El archivo editado no estaba guardado. Se comprobó buscando `initialCategory` en `/js/script.js` desde el navegador. |
| Autenticación (commit 2) | `use HasApiTokens, HasFactory, Notifiable;` quedó pegado fuera de la clase `User`. | Colocarlo dentro de las llaves de la clase. |
| Panel de administración (commit 5) | Al ejecutar `php artisan route:list` al principio solo salía una ruta `GET`. | La guía usa `route:list` para comprobar que las rutas de administración quedaron protegidas; no detalla la causa ni el arreglo concreto. |

## Comandos de Git relevantes

Flujo de Git, en el orden en que se usa:

| Comando | Qué hace | Cuándo se usó |
|---|---|---|
| `git config --global user.name "Tu nombre"` y `user.email` | Define el nombre y el correo que aparecen en cada commit. | Una sola vez por equipo, antes del primer commit. |
| `git init` | Crea el repositorio Git en la carpeta del proyecto. | Al empezar, para poder guardar versiones. |
| `git add .` | Prepara todos los cambios para el siguiente commit. | Antes de cada commit. |
| `git commit -m "mensaje"` | Guarda una versión del proyecto con un mensaje. | Una vez por funcionalidad: son los 6 commits de la tabla anterior. |
| `git remote add origin URL` | Conecta el repositorio local con el de GitHub. | Una vez, tras crear el repositorio `sigilious-laravel` en GitHub. |
| `git branch -M main` | Llama `main` a la rama principal. | Una vez, antes del primer push. |
| `git push -u origin main` | Sube los commits a GitHub y recuerda la rama. | La primera vez; después basta `git push`. |
| `git status` | Muestra qué archivos han cambiado o están preparados. | Para comprobar el estado antes de hacer commit. |
| `git log --oneline` | Lista el historial de commits en una línea cada uno. | Para ver que los commits se guardaron (de aquí sale la tabla de commits). |
| `git ls-files .env` | Indica si `.env` está dentro del repositorio. | No debe imprimir nada (ver [seguridad-y-mejoras.md](seguridad-y-mejoras.md#gestión-de-secretos-y-variables-de-entorno)). |

`git clone URL` (descargar un repositorio) se usa en la [instalación desde cero](instalacion.md#instalación-desde-cero).

## Referencia de comandos usados durante el desarrollo

Comandos de generación de código y diagnóstico (los de ejecución y puesta en marcha están en [instalacion.md](instalacion.md)):

| Comando | Qué hace | Dónde se usó |
|---|---|---|
| `composer create-project laravel/laravel nombre` | Crea un proyecto Laravel nuevo. | Commit 1 (o el instalador de Laravel, que hace lo mismo). |
| `php artisan make:model Nombre -m` | Crea modelo + migración. | `Product` (commit 1), `Order` (commit 3), `Cart` (commit 4). |
| `php artisan make:controller Nombre` | Crea un controlador. | `ProductController` (1), `AuthController` (2), `OrderController` (3), `CartController` (4). |
| `php artisan make:middleware Nombre` | Crea un middleware. | `EnsureUserIsAdmin` (5). |
| `php artisan make:migration nombre --table=tabla` | Crea una migración que modifica una tabla existente. | `add_is_admin_to_users_table` (5). |
| `php artisan make:seeder Nombre` | Crea un seeder. | `ProductSeeder` (1). |
| `php artisan install:api` | Instala Sanctum y prepara `routes/api.php`. | Inicio de la autenticación (2). |
| `php artisan route:list` | Lista rutas, métodos y middleware. | Commit 5, para comprobar la protección de las rutas de admin. |
