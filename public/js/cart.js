import { getCurrentUser } from "./users.js";

const CART_KEY = "sigilious_cart";

function normalizeSize(size) {
  return typeof size === "string" ? size.trim().toUpperCase() : "";
}

function normalizeCart(cart) {
  return (Array.isArray(cart) ? cart : [])
    .map((item) => ({
      id: String(item.id),
      qty: Number(item.qty) || 0,
      size: normalizeSize(item.size)
    }))
    .filter((item) => item.id && item.qty > 0);
}

async function cartRequest(method, body) {
  const user = getCurrentUser();

  const response = await fetch("/api/cart", {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${user.accessToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) throw new Error(`Cart request failed: ${response.status}`);

  return response.json();
}

async function persistUserCart(cart) {
  const user = getCurrentUser();
  if (!user?.id || !user?.accessToken) return;

  try {
    await cartRequest("PUT", { items: normalizeCart(cart) });
  } catch (error) {
    console.warn(error);
  }
}

export function getCart() {
  return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
}

export function saveCart(cart) {
  const normalizedCart = normalizeCart(cart);
  localStorage.setItem(CART_KEY, JSON.stringify(normalizedCart));
  persistUserCart(normalizedCart);
}

export async function syncCartFromSupabase() {
  const user = getCurrentUser();
  if (!user?.id || !user?.accessToken) return getCart();

  try {
    const data = await cartRequest("GET");
    const remoteCart = normalizeCart(data?.items || []);
    const localCart = getCart();
    const nextCart = remoteCart.length ? remoteCart : localCart;

    localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
    if (!remoteCart.length && localCart.length) await persistUserCart(localCart);

    return nextCart;
  } catch (error) {
    console.warn(error);
    return getCart();
  }
}

export function addToCart(id, qty = 1, size = "") {
  const productId = String(id);
  const normalizedSize = normalizeSize(size);
  const amount = Number(qty) || 1;
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId && entry.size === normalizedSize);

  if (item) item.qty += amount;
  else cart.push({ id: productId, qty: amount, size: normalizedSize });

  saveCart(cart);
}

export function updateQty(id, size, qty) {
  const productId = String(id);
  const normalizedSize = normalizeSize(size);
  const cart = getCart().map((item) => (
    item.id === productId && item.size === normalizedSize
      ? { ...item, qty: Number(qty) || 0 }
      : item
  ));

  saveCart(cart.filter((item) => item.qty > 0));
}

export function removeItem(id, size) {
  const productId = String(id);
  const normalizedSize = normalizeSize(size);
  saveCart(getCart().filter((item) => !(item.id === productId && item.size === normalizedSize)));
}

export function clearCart() {
  saveCart([]);
}

export function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}