# Instalación y puesta en marcha

> Documentación elaborada solo a partir de `Sigilious_Guia_Tecnica.pdf`. No se ha contrastado con el código fuente ni se han ejecutado los comandos.

## Requisitos previos

- **PHP 8.3 o superior** y **Laravel 13** (el proyecto se instala con Composer).
- **Composer** (gestor de dependencias de PHP).
- **MySQL** y **phpMyAdmin** para crear la base de datos.
- **Git**, para clonar el repositorio.
- El entorno usado en el desarrollo es **Laragon** (Windows), que incluye servidor web, PHP y MySQL en un solo programa.

## Herramientas necesarias

| Herramienta | Qué es | Cómo se usó |
|---|---|---|
| Laragon | Entorno de desarrollo local para Windows: Apache/Nginx, PHP y MySQL en un solo programa. | Se instaló con Scoop. El proyecto se coloca en `www` y crea el dominio `sigilious.test` automáticamente. |
| Scoop | Gestor de paquetes para Windows por línea de comandos. | Para instalar Laragon. |
| Composer | Gestor de dependencias de PHP (como npm en JavaScript). | Instala Laravel y paquetes como Sanctum; genera `vendor/` y `composer.lock`. |
| Artisan | La herramienta de línea de comandos de Laravel (`php artisan ...`). | Crea modelos, controladores y migraciones; ejecuta migraciones y seeders; lista rutas. |
| MySQL + phpMyAdmin | Base de datos relacional y su interfaz web. | Crear la base `sigilious`, mirar tablas y editar filas a mano (por ejemplo `is_admin`). |
| Git y GitHub | Control de versiones y repositorio remoto. | 6 commits y repositorio `sigilious-laravel`. |
| VS Code | Editor de código. | Edición y buscar/reemplazar entre archivos. |
| Chrome DevTools | Herramientas del navegador (F12). | Pestaña Network (ver peticiones y respuestas) y Application → Local storage. |

## Instalación desde cero

```bash
git clone https://github.com/RubenBG0204/sigilious-laravel.git
cd sigilious-laravel
composer install
cp .env.example .env # y configurar la base de datos
php artisan key:generate
# crear la base de datos "sigilious" en phpMyAdmin
php artisan migrate
php artisan db:seed --class=ProductSeeder
php artisan serve # o abrir http://sigilious.test con Laragon
```

| Comando | Qué hace |
|---|---|
| `git clone URL` | Descarga el repositorio. |
| `composer install` | Instala las dependencias de `composer.lock`. |
| `cp .env.example .env` | Crea tu `.env` local a partir de la plantilla; después hay que configurar la base de datos. |
| `php artisan key:generate` | Crea la `APP_KEY` en `.env`. Hay que repetirlo tras clonar el proyecto. |
| `php artisan migrate` | Ejecuta las migraciones pendientes: crea las tablas y anota cuáles ya corrieron en la tabla `migrations`. |
| `php artisan db:seed --class=ProductSeeder` | Ejecuta el seeder y rellena `products` con los 9 productos. |
| `php artisan serve` | Arranca un servidor local en `localhost:8000`. |

## Configuración del entorno (`.env`)

Laravel guarda la configuración que cambia entre equipos (base de datos, claves) en `.env`. En local es:

```ini
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigilious
DB_USERNAME=root
DB_PASSWORD= # vacío en Laragon por defecto
```

| Variable | Valor en local | Notas |
|---|---|---|
| `APP_ENV` | `local` | |
| `APP_DEBUG` | `true` | Solo para desarrollo: en producción debe ser `false`. |
| `DB_CONNECTION` | `mysql` | |
| `DB_HOST` | `127.0.0.1` | |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `sigilious` | Debe existir antes de migrar. |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | (vacío) | Vacío en Laragon por defecto. |
| `APP_KEY` | generada | La crea `php artisan key:generate`. |
| `SESSION_DRIVER` | `database` | Mencionada en la guía al describir las tablas propias de Laravel. |
| `CACHE_STORE` | `database` | Ídem. |

`.env` está en `.gitignore`, así que **no se sube a GitHub**. En el repositorio solo está `.env.example`, que sirve de plantilla. La guía no contiene credenciales ni claves reales, por lo que no ha sido necesario sustituir ningún valor.

## Configuración de MySQL

1. Crear una base de datos vacía llamada `sigilious` en phpMyAdmin. Laravel no la crea; solo crea las tablas dentro.
2. Editar `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`…) para indicar a Laravel a qué base conectarse.
3. En Laragon, el usuario por defecto es `root` y la contraseña está vacía.

Estructura de las tablas y relaciones: [base-de-datos.md](base-de-datos.md).

## Migraciones y seeders

```bash
php artisan migrate
php artisan db:seed --class=ProductSeeder
```

- `migrate` crea todas las tablas (`products`, `personal_access_tokens`, `orders`, `carts`, la columna `is_admin`, etc.).
- `db:seed --class=ProductSeeder` carga los 9 productos de ejemplo. Se puede ejecutar varias veces sin duplicar productos, pero **sobrescribe** nombre, precio y descripción de esos 9 productos: conviene ejecutarlo solo en instalaciones nuevas.

Comando auxiliar de desarrollo (no forma parte del proceso de instalación):

```bash
php artisan migrate:fresh
```

Borra todas las tablas y las recrea: **pierdes todos los datos**. Sirve para reiniciar la base en desarrollo.

## Ejecutar la aplicación

| Opción | Cómo |
|---|---|
| Laragon (usada en el desarrollo) | Con el proyecto en la carpeta `www`, Laragon crea el dominio y el sitio se abre en `http://sigilious.test`. |
| Alternativa | `php artisan serve` y abrir `http://localhost:8000`. |

## Crear un administrador

El registro no puede crear administradores (`is_admin` no es rellenable). Para hacerte administrador:

1. Regístrate en la web.
2. En phpMyAdmin, pon `is_admin` a `1` en tu fila de `users` (solo ese campo; no toques `id`):

```sql
UPDATE users SET is_admin = 1 WHERE email = 'tu@correo.com';
```

`tu@correo.com` es un marcador: usa el email con el que te registraste. Funcionamiento del panel: [funcionalidades.md](funcionalidades.md#panel-de-administración).

## Comprobaciones

| Qué comprobar | Cómo |
|---|---|
| Rutas y middleware | `php artisan route:list` lista rutas, métodos y middleware (sirve para comprobar que las rutas de administración están protegidas). |
| Peticiones y respuestas | Chrome DevTools → pestaña **Network**. |
| Datos del navegador | DevTools → **Application → Local storage** (`sigilious_products`, `sigilious_cart`, `sigilious_orders`, `sigilious_current_user`). |
| Datos en la base | phpMyAdmin (consultas de [base-de-datos.md](base-de-datos.md#7-consultas-útiles-en-phpmyadmin-pestaña-sql)). |
| `.env` fuera de Git | `git ls-files .env` no debe imprimir nada. |
| Código JavaScript cargado | Abrir el JS servido desde el navegador (por ejemplo `/js/script.js`) y buscar el cambio. |

## Solución de problemas

Los problemas que aparecen en la guía y cómo se resolvieron (contexto completo en [historial-desarrollo.md](historial-desarrollo.md#problemas-encontrados-y-soluciones)):

| Síntoma | Causa y solución descritas |
|---|---|
| Trait de Sanctum mal colocado en el modelo `User`. | La línea `use HasApiTokens, HasFactory, Notifiable;` había quedado pegada **fuera** de la clase `User`. Debe ir dentro de las llaves de la clase. |
| `php artisan route:list` solo muestra una ruta `GET` y faltan las de administración. | Se usó `route:list` para comprobar las rutas y sus middleware. La guía no detalla la causa ni el arreglo (ver historial). |
| Un cambio de JavaScript parece no aplicarse. | El archivo editado no estaba guardado. Se comprobó buscando el cambio en `/js/script.js` desde el navegador. |

## Despliegue en producción (propuesto en la guía, no realizado)

La guía indica que el proyecto **solo funciona en local** y que no se ha desplegado. Como propuesta de despliegue, en un hosting con PHP 8.3 y MySQL o un VPS, los pasos que enumera son:

```bash
# 1. Subir el código al servidor
# 2. Instalar dependencias sin las de desarrollo
composer install --no-dev
# 3. Crear el .env de producción con APP_DEBUG=false (editar el archivo)
# 4. Generar la clave de la aplicación
php artisan key:generate
# 5. Ejecutar las migraciones
php artisan migrate --force
# 6. Cachear configuración y rutas
php artisan config:cache
php artisan route:cache
# 7. Apuntar el dominio a la carpeta public/
```

> **Nota:** la guía nombra los dos últimos comandos como `config:cache` y `route:cache`; aquí se escriben con el prefijo `php artisan`, igual que el resto de comandos de Artisan.
