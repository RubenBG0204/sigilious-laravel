# Seguridad y mejoras

> Documentación elaborada solo a partir de `Sigilious_Guia_Tecnica.pdf`. No se ha contrastado con el código fuente: lo que aquí figura como «implementado» es lo que la guía describe como hecho, no algo verificado en el repositorio.

Este documento distingue tres estados:

| Estado | Significado |
|---|---|
| **Implementado** | Medida que la guía describe como presente en el proyecto. |
| **Implementado con limitaciones** | Existe, pero la guía documenta una carencia o un riesgo asociado. |
| **Propuesta** | Mejora sugerida en la guía; **no está implementada**. |

## Seguridad implementada

### Autenticación y autorización

- **Tokens Bearer con Laravel Sanctum.** El login comprueba el hash de la contraseña, crea un token y lo devuelve; el navegador lo envía en `Authorization: Bearer <token>` (ver [funcionalidades.md](funcionalidades.md#registro-inicio-y-cierre-de-sesión)).
- **Rutas protegidas con `auth:sanctum`.** Sin token válido, la respuesta es 401, en JSON.
- **Autorización de administrador.** Las rutas de alta, edición y borrado de productos pasan por `auth:sanctum` y por el middleware `EnsureUserIsAdmin`, que responde 403 si el usuario no tiene `is_admin`.
- **Pedidos privados por usuario.** `GET /orders` devuelve solo los pedidos del usuario del token.
- **Logout acotado.** `logout` invalida solo el token actual (`currentAccessToken()->delete()`).
- **Sin escalada de privilegios desde el registro.** `is_admin` no es rellenable en el registro (`User` solo permite rellenar `name`, `email` y `password`).

### Contraseñas y tokens

- Las contraseñas se guardan con hash (cast `'password' => 'hashed'`, bcrypt por defecto); nunca en claro.
- `password` está marcado con `#[Hidden]` y no sale en el JSON.
- `Hash::check` compara la contraseña escrita con el hash guardado.
- Sanctum solo guarda en la base de datos el hash del token, no el token en claro.
- El login devuelve el mismo mensaje y código (422) tanto si el email no existe como si la contraseña no coincide, según el código que muestra la guía.

> **Limitación asociada:** los tokens no caducan y se guardan en `localStorage` (ver [Problemas de seguridad identificados](#problemas-de-seguridad-identificados)).

### Validación de datos

- Validación en el servidor con reglas de Laravel en cada endpoint, además de la del navegador. Reglas concretas: [funcionalidades.md](funcionalidades.md#validaciones).
- `$fillable` en los modelos protege contra la asignación masiva.
- `Rule::in([...])` restringe la categoría de producto a las 5 permitidas.
- `unique:users,email` impide emails repetidos; `exists:products,id` impide pedir productos inexistentes.

### Protección de operaciones sensibles

- **Precios manipulables.** El servidor recalcula el total con los precios de la base de datos. El navegador solo envía `product_id`, talla y cantidad (ver [funcionalidades.md](funcionalidades.md#pedidos)).
- **Panel de administración.** La página `/admin` es una vista pública, igual que las demás. Lo que está protegido es la API: aunque alguien abra `/admin`, el servidor rechaza con 403 cualquier alta, edición o borrado si no es administrador. La seguridad real siempre debe estar en el servidor.

### Gestión de secretos y variables de entorno

- `.env` está en `.gitignore` y no se sube a GitHub; en el repositorio solo está la plantilla `.env.example`.
- Se verificó con `git ls-files .env`, que no debe imprimir nada.
- Se eliminó `public/js/supabase-config.js` (el proyecto de Supabase ya no existía).
- `APP_DEBUG=true` es solo para desarrollo: en producción debe ser `false` ([instalacion.md](instalacion.md#configuración-del-entorno-env)).

### Otras medidas

- **Inyección SQL:** Eloquent y el query builder usan consultas preparadas.
- **CSRF:** la API usa tokens Bearer en cabecera (no cookies de sesión), por lo que el ataque CSRF clásico no aplica.
- **Errores en JSON:** las rutas `/api/*` responden siempre JSON, también en los errores.

## Limitaciones y mejoras pendientes

En las tablas siguientes, la columna **Detalle** describe lo que existe hoy y la columna **Mejora propuesta** recoge lo que sugiere la guía (no implementado).

### Problemas de seguridad identificados

| Limitación | Detalle | Mejora propuesta |
|---|---|---|
| Token sin caducidad | `expiration` es `null` y el token está en `localStorage`. | Caducidad, y valorar cookies `HttpOnly` (Sanctum SPA). |
| Texto sin escapar | Las listas se pintan con `innerHTML` usando nombres de producto; un nombre malicioso de un admin podría inyectar HTML. | Escapar el texto o usar `textContent`. |
| Clave anónima de Supabase en el historial | El primer commit incluía `supabase-config.js` con la URL y la *anon key* (clave pública por diseño). Se borró en el último commit pero sigue en el historial de Git. | Si el proyecto de Supabase aún existe, borrarlo o regenerar las claves. |

> En esta documentación no se reproduce ninguna clave ni valor de Supabase: la guía solo menciona su existencia.

### Limitaciones funcionales y técnicas

| Limitación | Detalle | Mejora propuesta |
|---|---|---|
| El panel solo edita 4 campos | El formulario y `adminPayload()` envían `name`, `category`, `price` e `image`. No se puede editar la descripción ni las tallas; un producto nuevo se crea sin descripción y con tallas S–XL. Al editar uno existente, la descripción se conserva. | Añadir `description` y `sizes` al formulario y al payload (el backend ya los valida). |
| Falso éxito en el panel | Si la llamada a la API falla (por ejemplo, sin ser admin), `script.js` guarda el cambio solo en local y muestra «Producto guardado» igualmente; el cambio desaparece en la siguiente sincronización. | Mostrar el error del servidor y eliminar el guardado local de respaldo. |
| Pedidos mínimos en pantalla | `/orders` muestra solo id, fecha y total, no las líneas. | Mostrar el detalle (`items` ya se guarda). |
| Seeder que sobrescribe | Volver a ejecutar `ProductSeeder` restaura nombre, precio y descripción de esos 9 productos. | Ejecutarlo solo en instalaciones nuevas. |
| Nombres heredados en el JavaScript | Funciones como `syncProductsFromSupabase` conservan el nombre de la versión anterior, aunque llaman a Laravel. | Renombrarlas (mejora pendiente). |
| Sin desplegar | Solo funciona en local. | Hosting con PHP 8.3 y MySQL ([pasos propuestos](instalacion.md#despliegue-en-producción-propuesto-en-la-guía-no-realizado)). |
| Campos `items` y `sizes` en JSON | Decisión de simplicidad; impide consultas SQL por producto vendido. | Alternativa normalizada: tabla `order_items` y tabla `sizes` ([base-de-datos.md](base-de-datos.md#6-json-en-items-y-sizes)). |

### Pruebas automatizadas

| Limitación | Detalle | Mejora propuesta |
|---|---|---|
| Sin tests | Solo existen los tests de ejemplo de Laravel. | Tests de Feature para login, pedidos y permisos de administrador. |

### Pagos y funcionalidades pendientes

| Limitación | Detalle | Mejora propuesta |
|---|---|---|
| El checkout no cobra | Valida un número de tarjeta pero no hay pasarela de pago. Email, dirección y tarjeta no se envían ni se guardan: solo `name` e `items`. | Integrar Stripe o similar y guardar datos de envío. |
| Recuperación de contraseña | No implementada: el frontend devuelve un mensaje de «no disponible». | Envío de correo con enlace de restablecimiento. |

### Riesgos asociados al almacenamiento o tratamiento de datos

- **Token en `localStorage`:** `sigilious_current_user` guarda el token de acceso en el navegador y no caduca (ver [Problemas de seguridad identificados](#problemas-de-seguridad-identificados)).
- **Datos del checkout:** la tarjeta se valida solo en el navegador; ni la tarjeta, ni el email ni la dirección se envían al servidor ni se guardan.
- **Cambios del panel que no llegan al servidor:** el guardado local de respaldo puede mostrar como guardado un cambio que el servidor rechazó.
- **Historial de Git:** `supabase-config.js` sigue en el historial aunque se haya borrado del código.
- **Seeder:** puede sobrescribir cambios manuales en los 9 productos iniciales.

### Resumen de mejoras futuras propuestas en la guía

1. Caducidad de tokens y valorar cookies `HttpOnly` (Sanctum SPA).
2. Escapar el texto que se pinta con `innerHTML`.
3. Regenerar o borrar las claves del proyecto de Supabase, si aún existe.
4. Añadir `description` y `sizes` al panel y mostrar los errores del servidor.
5. Mostrar el detalle de los pedidos.
6. Tests de Feature (login, pedidos, permisos de administrador).
7. Pagos reales (Stripe o similar) y guardado de datos de envío.
8. Recuperación de contraseña por correo.
9. Renombrar las funciones con nombres heredados de Supabase.
10. Despliegue en un hosting con PHP 8.3 y MySQL.
