# Funcionalidades

> Documentación elaborada solo a partir de `Sigilious_Guia_Tecnica.pdf`. No se ha contrastado con el código fuente. Los fragmentos de código son los que muestra la guía (donde aparece `...` o `[...]`, la guía los abrevia).

Este documento explica **cómo funciona** cada característica. Los endpoints con sus códigos de respuesta están en [api.md](api.md), las tablas en [base-de-datos.md](base-de-datos.md) y la visión de conjunto en [arquitectura.md](arquitectura.md).

## Páginas y rutas web

Las páginas se entregan desde las vistas Blade (`resources/views`), no desde archivos sueltos. Cada ruta de página es una línea en `routes/web.php`:

```php
// routes/web.php
use Illuminate\Support\Facades\Route;

Route::view('/', 'index');
Route::view('/shop', 'shop');
Route::view('/cart', 'cart');
Route::view('/login', 'login');
Route::view('/admin', 'admin');
// ... (14 rutas de página en total)

Route::get('/api/products', [ProductController::class, 'index']);
```

`Route::view('/shop', 'shop')` significa: cuando alguien pida `/shop`, devuelve la vista `resources/views/shop.blade.php`. Las URL ya no son archivos (`shop.html`), sino rutas: por ejemplo `shop` y `product?id=3`, donde `/product` es la ruta y `?id=` un parámetro. Los CSS y JS se enlazan con ruta absoluta (`/css/style.css`) para que funcionen desde cualquier página.

Cada página declara qué es con un atributo en el `<body>` (por ejemplo `data-page="shop"`); `script.js` lo lee y arranca solo el código de esa página (`initShop`, `initCart`…).

> **Pendiente de verificación:** la lista completa de las 14 rutas de página no aparece en la guía (ver [arquitectura.md](arquitectura.md#5-estructura-de-un-proyecto-laravel)).

## Catálogo y filtros de productos

### Catálogo

El catálogo vive en la tabla `products` y se sirve en `GET /api/products`:

```php
// ProductController
public function index()
{
    return Product::orderBy('id')->get(); // Laravel lo convierte a JSON
}
```

En `products.js`, la función `syncProductsFromSupabase()` hace `fetch('/api/products')`, normaliza los datos y los guarda en `localStorage` (`sigilious_products`). El precio llega como texto (`"42.00"`, porque `decimal` se devuelve así) y `normalizeProduct` lo pasa a número con `Number(...)`. `products.js` también gestiona los filtros del catálogo.

> **Nota sobre nombres heredados:** varias funciones del JavaScript conservan nombres de la versión anterior basada en Supabase (por ejemplo `syncProductsFromSupabase`, `syncCartFromSupabase`, `syncOrdersFromSupabase`, `addProductToSupabase`, `updateProductInSupabase`). Actualmente llaman a Laravel, no a Supabase. Renombrarlas es una mejora pendiente (ver [seguridad-y-mejoras.md](seguridad-y-mejoras.md#limitaciones-y-mejoras-pendientes)).

### Filtro por categoría desde la página principal

Los accesos de la home enlazan a `shop?category=tshirts`. En `initShop()` (`script.js`) se lee ese parámetro y se selecciona la categoría antes de aplicar los filtros:

```js
const initialCategory = new URLSearchParams(window.location.search).get("category");
if (initialCategory && [...category.options].some((o) => o.value === initialCategory)) {
    category.value = initialCategory;
}
applyFilters();
```

Las categorías de producto son `tshirts`, `hoodies`, `pants`, `accessories` y `shoes`.

## Registro, inicio y cierre de sesión

### Cómo funciona un token Bearer

El usuario envía email y contraseña; si son correctos, el servidor crea un token aleatorio y se lo devuelve. A partir de ahí, el navegador manda ese token en cada petición protegida, en la cabecera `Authorization: Bearer <token>`. Sanctum solo guarda en la base de datos el **hash** del token, no el token en claro.

### Modelo `User`

```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // HasApiTokens permite createToken()

    protected function casts(): array
    {
        return ['password' => 'hashed', 'is_admin' => 'boolean', ...];
    }
}
```

El cast `'password' => 'hashed'` cifra la contraseña automáticamente al guardarla (bcrypt por defecto). Nunca se guarda la contraseña real. `use HasApiTokens, HasFactory, Notifiable;` debe ir **dentro** de las llaves de la clase (ver [historial-desarrollo.md](historial-desarrollo.md#problemas-encontrados-y-soluciones)).

### `AuthController`

```php
public function register(Request $request)
{
    $data = $request->validate([
        'name' => ['required', 'string', 'min:3', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'min:6'],
    ]);
    $user = User::create($data);
    return response()->json($this->payload($user), 201); // 201 = creado
}

public function login(Request $request)
{
    ...
    $user = User::where('email', $data['email'])->first();
    if (! $user || ! Hash::check($data['password'], $user->password)) {
        return response()->json(['message' => 'Email o contraseña incorrectos.'], 422);
    }
    return response()->json($this->payload($user));
}

public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete(); // invalida solo este token
    return response()->json(['message' => 'Sesión cerrada.']);
}

private function payload(User $user): array
{
    return ['user' => [...], 'token' => $user->createToken('sigilious')->plainTextToken];
}
```

- `validate()` comprueba los datos; si fallan, Laravel responde solo con 422 y un JSON con los errores. `unique:users,email` impide emails repetidos.
- `Hash::check` compara la contraseña escrita con el hash guardado.
- El registro no puede crear administradores: `User` solo permite rellenar `name`, `email` y `password`, y `is_admin` no está entre ellos.

### Rutas

```php
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
```

`auth:sanctum` es un middleware: antes de ejecutar `logout`, Sanctum comprueba el token. Si no es válido, responde 401. El esqueleto de Laravel 13 ya trae en `bootstrap/app.php` que las rutas `api/*` respondan siempre JSON, así que un 401 llega como JSON y no como una redirección a una página de login.

### Frontend (`users.js`)

- `login()` y `registerUser()` llaman a `/api/login` o `/api/register` y guardan la sesión en `localStorage` bajo `sigilious_current_user` con `{ id, name, email, accessToken }`.
- `logout()` llama a `/api/logout` y borra esa clave.
- La recuperación de contraseña **no está implementada**: devuelve un mensaje de «no disponible».

## Carrito de compra

Cada usuario con sesión tiene un carrito guardado en MySQL (tabla `carts`, un carrito por usuario). Estructura de `items`: `[{ "id": "3", "qty": 2, "size": "M" }, ...]`.

- `CartController@update` valida los datos (cantidad entre 1 y 20) y usa `Cart::updateOrCreate(['user_id' => ...], ['items' => ...])`: crea el carrito si no existe o lo actualiza.
- Las rutas están dentro de un grupo `auth:sanctum`: `GET /api/cart` y `PUT /api/cart`.

Lógica del frontend (`cart.js`):

1. Al añadir algo, `saveCart()` guarda primero en `localStorage` (la interfaz responde al instante) y después envía el carrito al servidor si hay sesión.
2. Al iniciar sesión, `syncCartFromSupabase()` pide el carrito del servidor: si tiene artículos, manda el del servidor; si está vacío, sube el carrito local. Así el carrito de invitado no se pierde al hacer login.

## Pedidos

### Tabla y reglas

La tabla `orders` y el significado de `user_id` nulo (pedido de invitado) están en [base-de-datos.md](base-de-datos.md#35-orders).

### `OrderController@store`

```php
public function store(Request $request)
{
    $data = $request->validate([
        'name' => ['required', 'string', 'min:3', 'max:255'],
        'items' => ['required', 'array', 'min:1'],
        'items.*.product_id' => ['required', 'exists:products,id'],
        'items.*.size' => ['required', 'string', 'max:10'],
        'items.*.qty' => ['required', 'integer', 'min:1', 'max:20'],
    ]);

    $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
        ->get()->keyBy('id');

    $total = 0; $items = [];
    foreach ($data['items'] as $line) {
        $product = $products[$line['product_id']]; // precio de la BASE DE DATOS
        $lineTotal = $product->price * $line['qty'];
        $total += $lineTotal;
        $items[] = ['product_id' => $product->id, 'name' => $product->name,
                    'price' => (float) $product->price, 'size' => $line['size'],
                    'qty' => $line['qty'], 'line_total' => $lineTotal];
    }

    $order = Order::create([
        'user_id' => $request->user('sanctum')?->id, // null si es invitado
        'customer_name' => $data['name'], 'items' => $items, 'total' => $total,
    ]);

    return response()->json($order, 201);
}
```

**Total calculado en el servidor:** el navegador solo envía `product_id`, talla y cantidad (lo hace `createOrder()` en `orders.js`). El precio y el total salen de la base de datos; si alguien manipulara el JavaScript para enviar un precio falso, no serviría de nada.

**Pedidos de invitado y con sesión:** `POST /orders` es pública (permite invitados) y por eso no lleva `auth:sanctum`. Para saber igualmente quién es, el controlador usa `$request->user('sanctum')`, que devuelve el usuario si llegó un token válido o `null` si no. `GET /orders` sí es privada y devuelve solo los pedidos del usuario del token.

### Visualización

La pantalla `/orders` muestra solo id, fecha y total, no las líneas (el detalle ya se guarda en `items`).

## Panel de administración

El panel (`/admin`) permite dar de alta, editar y borrar productos. La protección está en la API:

```php
// migración
$table->boolean('is_admin')->default(false)->after('password');
```

```php
// app/Http/Middleware/EnsureUserIsAdmin.php
public function handle(Request $request, Closure $next): Response
{
    if (! $request->user()?->is_admin) {
        return response()->json(['message' => 'No tienes permiso para hacer esto.'], 403);
    }
    return $next($request);
}
```

```php
// routes/api.php
Route::middleware(['auth:sanctum', EnsureUserIsAdmin::class])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});
```

- Un middleware se ejecuta antes del controlador. Aquí hay dos seguidos: `auth:sanctum` (¿hay token válido? si no, 401) y `EnsureUserIsAdmin` (¿es admin? si no, 403).
- `{product}` en la ruta usa *route model binding*: Laravel busca el producto con ese id y lo entrega al método ya cargado (404 si no existe).
- `ProductController` valida todo con `Rule::in([...])` para que la categoría solo pueda ser una de las 5 permitidas. `store` pone por defecto las tallas S, M, L, XL.
- Para hacerte administrador, ver [instalacion.md](instalacion.md#crear-un-administrador).
- Por qué la seguridad está en el servidor y no en la página `/admin`: ver [seguridad-y-mejoras.md](seguridad-y-mejoras.md#protección-de-operaciones-sensibles).

**Alcance actual del formulario:** el formulario y `adminPayload()` envían solo `name`, `category`, `price` e `image`. No se puede editar la descripción ni las tallas desde el panel; un producto nuevo se crea sin descripción y con tallas S–XL. Al editar uno existente, la descripción se conserva (ver [limitaciones](seguridad-y-mejoras.md#limitaciones-funcionales-y-técnicas)).

## Validaciones

### En el servidor

En Laravel se declara con reglas (`required`, `string`, `min`, `max`, `email`, `unique`, `exists`, `integer`, `Rule::in`…). Si algo falla, Laravel corta la petición y responde 422 con un JSON de errores (formato en [api.md](api.md#formato-de-errores-y-códigos-http)), que el frontend lee para mostrar el primer error.

| Endpoint | Reglas documentadas en la guía |
|---|---|
| `POST /api/register` | `name`: obligatorio, texto, 3–255 · `email`: obligatorio, email válido, máx. 255, único en `users` · `password`: obligatorio, texto, mín. 6 |
| `POST /api/orders` | `name`: obligatorio, texto, 3–255 · `items`: obligatorio, array con al menos 1 · `items.*.product_id`: obligatorio, debe existir en `products` · `items.*.size`: obligatorio, texto, máx. 10 · `items.*.qty`: obligatorio, entero, 1–20 |
| `PUT /api/cart` | Cantidad entre 1 y 20 (el resto de reglas no se detalla) |
| `POST` / `PUT /api/products` | Una única función `validated` reutilizada; la categoría solo admite las 5 permitidas (`Rule::in`) |

Además, `$fillable` en los modelos limita la asignación masiva.

### En el navegador

- Registro e inicio de sesión: `script.js` valida los campos antes de llamar a la API.
- Checkout: se validan nombre, email, dirección y tarjeta **solo en el navegador**; email, dirección y tarjeta no se envían ni se guardan.
- `ui.js` / `ui-helpers.js` aportan la validación de formularios y los avisos (toasts).

## Comunicación entre frontend y backend

- El JavaScript usa `fetch` con JSON y, en las rutas protegidas, el token Bearer de `sigilious_current_user`.
- Al cargar cualquier página, `script.js` sincroniza productos, carrito y pedidos con el servidor; si el servidor no responde, cada función usa el dato de `localStorage` ([arquitectura.md](arquitectura.md#63-sincronización-al-cargar-y-respaldo-local)).
- Tras el login se llama a `syncCartFromSupabase()` y `syncOrdersFromSupabase()` para traer el carrito y los pedidos del usuario.
- Los archivos JavaScript y su responsabilidad están en [arquitectura.md](arquitectura.md#61-archivos-javascript-y-su-responsabilidad).

## Flujos completos

### Registro e inicio de sesión

1. El usuario rellena el formulario de `register` o `login`; `script.js` valida los campos en el navegador.
2. `users.js` hace `POST /api/register` o `/api/login` con el JSON.
3. `AuthController` valida, crea el usuario (contraseña con hash) o comprueba el hash, y crea un token.
4. Respuesta: `{ user, token }`. `saveSession()` lo guarda en `sigilious_current_user`.
5. Tras el login se llama a `syncCartFromSupabase()` y `syncOrdersFromSupabase()` para traer su carrito y sus pedidos.

### Comprar

1. En la ficha de producto se elige talla y cantidad; `addToCart()` guarda en `localStorage` y, si hay sesión, hace `PUT /api/cart`.
2. En el checkout se validan nombre, email, dirección y tarjeta solo en el navegador.
3. `createOrder()` envía `POST /api/orders` con `name` y la lista de `{ product_id, size, qty }`.
4. `OrderController` valida, busca los precios en MySQL, calcula el total y guarda el pedido.
5. El navegador guarda la respuesta, vacía el carrito (también en el servidor) y muestra «Pedido realizado correctamente».

> El checkout no cobra: no hay pasarela de pago (ver [seguridad-y-mejoras.md](seguridad-y-mejoras.md#pagos-y-funcionalidades-pendientes)).

### El administrador edita un producto

1. Inicia sesión con una cuenta con `is_admin = 1` y abre `/admin`.
2. Pulsa Editar: el formulario se rellena con nombre, categoría, precio y clase de imagen.
3. Al guardar, `updateProductInSupabase()` envía `PUT /api/products/{id}` con el token Bearer.
4. `auth:sanctum` valida el token, `EnsureUserIsAdmin` comprueba `is_admin`, `ProductController@update` valida y actualiza la fila.
5. El frontend vuelve a descargar el catálogo y lo muestra actualizado.
