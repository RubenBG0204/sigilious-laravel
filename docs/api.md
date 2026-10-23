# API de Sigilious

> Documentación elaborada solo a partir de `Sigilious_Guia_Tecnica.pdf`. No se ha contrastado con el código fuente. La guía no incluye ejemplos completos de peticiones y respuestas JSON de éxito; aquí se documentan los campos y reglas que sí aparecen. Lo que la guía no detalla está marcado como **pendiente de verificación**.

## Convenciones

- Todas las rutas cuelgan de `/api` y intercambian JSON.
- En las rutas protegidas el navegador envía el token en la cabecera:

```http
Authorization: Bearer <token>
```

- Los errores de `/api/*` se devuelven siempre como JSON (ver [errores](#formato-de-errores-y-códigos-http)).
- Cómo funciona cada flujo (frontend, sincronización, etc.): [funcionalidades.md](funcionalidades.md).

## Resumen de endpoints

| Método | URL | Acceso | Controlador | Respuesta |
|---|---|---|---|---|
| `GET` | `/api/products` | Público | `ProductController@index` | 200 + lista de productos |
| `POST` | `/api/products` | Admin | `ProductController@store` | 201 + producto creado |
| `PUT` | `/api/products/{id}` | Admin | `ProductController@update` | 200 + producto |
| `DELETE` | `/api/products/{id}` | Admin | `ProductController@destroy` | 204 sin contenido |
| `POST` | `/api/register` | Público | `AuthController@register` | 201 + usuario y token |
| `POST` | `/api/login` | Público | `AuthController@login` | 200 + usuario y token / 422 |
| `POST` | `/api/logout` | Con sesión | `AuthController@logout` | 200 + mensaje |
| `GET` | `/api/cart` | Con sesión | `CartController@show` | 200 + items |
| `PUT` | `/api/cart` | Con sesión | `CartController@update` | 200 + items |
| `POST` | `/api/orders` | Público* | `OrderController@store` | 201 + pedido |
| `GET` | `/api/orders` | Con sesión | `OrderController@index` | 200 + tus pedidos |

\* Si se envía token, el pedido queda asociado al usuario; si no, queda como pedido de invitado.

**Niveles de acceso:**

| Nivel | Qué exige | Si no se cumple |
|---|---|---|
| Público | Nada. | — |
| Con sesión | Token Bearer válido (middleware `auth:sanctum`). | 401 |
| Admin | Token válido (`auth:sanctum`) **y** `is_admin` (middleware `EnsureUserIsAdmin`). | 401 sin token válido; 403 si no es administrador |

### Dónde están definidas las rutas

`GET /api/products` está definida en `routes/web.php` y no en `routes/api.php`, por ser una ruta pública de solo lectura. El resto de la API está en `routes/api.php`, que Laravel monta también bajo `/api`. Ambas conviven porque usan métodos HTTP distintos sobre la misma URL (`GET` en una; `POST`, `PUT` y `DELETE` en la otra). Además, `web.php` define 14 rutas de página con `Route::view` (ver [funcionalidades.md](funcionalidades.md#páginas-y-rutas-web)).

## Productos

### `GET /api/products`

Devuelve todos los productos ordenados por `id` (`Product::orderBy('id')->get()`), como JSON. Cada producto tiene las columnas de la tabla `products` ([base-de-datos.md](base-de-datos.md#31-products)). El precio llega como texto (por ejemplo `"42.00"`, porque `decimal` se devuelve así).

### `POST /api/products` (admin)

Crea un producto. Campos que envía el panel de administración (`adminPayload()`):

| Campo | Notas |
|---|---|
| `name` | |
| `category` | Solo puede ser una de las 5 permitidas: `tshirts`, `hoodies`, `pants`, `accessories`, `shoes` (`Rule::in`). |
| `price` | |
| `image` | Clase CSS (`img-1` … `img-9`). |

`store` pone por defecto las tallas `S, M, L, XL`. El backend también valida `description` y `sizes`, pero el panel no los envía. Respuesta: 201 + producto.

> **Pendiente de verificación:** la guía indica que `ProductController` usa una única función de validación (`validated`) pero no muestra sus reglas completas (qué campos son obligatorios, límites, etc.).

### `PUT /api/products/{product}` (admin)

Actualiza el producto indicado. `{product}` usa *route model binding*: Laravel carga el producto con ese id (404 si no existe, por ejemplo `/api/products/999`). Se valida con la misma función que `store`. Respuesta: 200 + producto.

### `DELETE /api/products/{product}` (admin)

Borra el producto. Respuesta: 204 sin contenido; 404 si no existe.

## Autenticación

### `POST /api/register`

| Campo | Reglas |
|---|---|
| `name` | Obligatorio, texto, mín. 3, máx. 255. |
| `email` | Obligatorio, email válido, máx. 255, único en `users` (`unique:users,email`). |
| `password` | Obligatorio, texto, mín. 6. |

Respuesta 201: `{ user, token }`. El usuario no puede ser administrador: `is_admin` no es rellenable.

### `POST /api/login`

Cuerpo: `email` y `password`. Se busca el usuario por email y se compara la contraseña con el hash (`Hash::check`). Respuesta 200: `{ user, token }`. Si el email o la contraseña son incorrectos, 422:

```json
{ "message": "Email o contraseña incorrectos." }
```

> **Pendiente de verificación:** la guía abrevia la validación de `login` con `...` y no muestra el contenido del objeto `user` de la respuesta (aparece como `[...]`). En el navegador se guarda `{ id, name, email, accessToken }` ([arquitectura.md](arquitectura.md#64-qué-se-guarda-en-el-navegador-localstorage)).

### `POST /api/logout` (con sesión)

Invalida solo el token con el que se hizo la petición. Respuesta 200:

```json
{ "message": "Sesión cerrada." }
```

## Carrito (con sesión)

### `GET /api/cart`

Devuelve el carrito del usuario del token (200 + `items`).

### `PUT /api/cart`

Crea o actualiza el carrito del usuario (`Cart::updateOrCreate`). Cantidad entre 1 y 20 por línea. Cada elemento de `items` tiene esta forma:

```json
{ "id": "3", "qty": 2, "size": "M" }
```

Respuesta: 200 + `items`.

> **Pendiente de verificación:** la guía solo indica que `update` «valida los datos» con cantidad entre 1 y 20; el resto de reglas no se muestra.

## Pedidos

### `POST /api/orders` (público)

Cuerpo: `name` y la lista `items` con `product_id`, `size` y `qty`.

| Campo | Reglas |
|---|---|
| `name` | Obligatorio, texto, mín. 3, máx. 255. |
| `items` | Obligatorio, array, al menos 1 elemento. |
| `items.*.product_id` | Obligatorio, debe existir en `products` (`exists:products,id`). |
| `items.*.size` | Obligatorio, texto, máx. 10. |
| `items.*.qty` | Obligatorio, entero, mín. 1, máx. 20. |

Estructura del cuerpo (los valores son marcadores, no datos reales):

```json
{
  "name": "NOMBRE_DEL_CLIENTE",
  "items": [
    { "product_id": 1, "size": "TALLA", "qty": 1 }
  ]
}
```

El servidor **no usa precios enviados por el cliente**: busca cada producto en la base de datos, calcula `line_total` y `total`, y guarda en `items` una copia de cada línea con estos campos: `product_id`, `name`, `price`, `size`, `qty`, `line_total`. Si la petición lleva un token válido, el pedido se asocia al usuario (`user_id`); si no, queda con `user_id = null` (invitado). Respuesta: 201 + pedido.

### `GET /api/orders` (con sesión)

Devuelve solo los pedidos del usuario del token (200 + tus pedidos).

> **Pendiente de verificación:** la guía no detalla el formato exacto de la respuesta de `GET /api/orders`.

## Formato de errores y códigos HTTP

| Código | Significado | Cuándo ocurre aquí |
|---|---|---|
| 200 / 201 / 204 | OK / Creado / Sin contenido | Lectura correcta / registro, alta y pedido / borrado de producto |
| 401 | No autenticado | Ruta protegida sin token válido |
| 403 | Prohibido | Usuario con sesión pero sin `is_admin` en rutas de administrador |
| 404 | No encontrado | `/api/products/999` (el binding no encuentra el producto) |
| 422 | Datos no válidos | Falla `validate()` o email/contraseña incorrectos en el login |

Respuesta 403 de `EnsureUserIsAdmin`:

```json
{ "message": "No tienes permiso para hacer esto." }
```

Cuando falla la validación, Laravel responde 422 con este formato, que el frontend lee para mostrar el primer error:

```json
{
  "message": "Ya existe una cuenta con ese email.",
  "errors": { "email": ["Ya existe una cuenta con ese email."] }
}
```

### Errores siempre en JSON

Viene configurado por defecto en el proyecto Laravel (no se escribió a mano): los errores de `/api/*` se devuelven como JSON, de modo que un 401 llega como JSON y no como redirección a una página de login.

```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
    );
})
```

Seguridad asociada a estas rutas: [seguridad-y-mejoras.md](seguridad-y-mejoras.md).
