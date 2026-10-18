import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";
import { getCurrentUser } from "./users.js";

const CART_KEY = "sigilious_cart";
const CART_ENDPOINT = `${SUPABASE_URL}/rest/v1/carts`;

function normalizeSize(size) {
  return typeof size === "string" ? size.trim().toUpperCase() : "";
}

function normalizeCart(cart) {
  return (Array.isArray(cart) ? cart : [])
    .map((item) => ({
      id: item.id,
      qty: Number(item.qty) || 0,
      size: normalizeSize(item.size)
    }))
    .filter((item) => item.id && item.qty > 0);
}

function cartHeaders(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

async function persistUserCart(cart) {
  const user = getCurrentUser();
  if (!user?.id || !user?.accessToken) return;

  await fetch(CART_ENDPOINT, {
    method: "POST",
    headers: {
      ...cartHeaders(user.accessToken),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({
      user_id: user.id,
      items: normalizeCart(cart),
      updated_at: new Date().toISOString()
    })
  }).catch((error) => console.warn(error));
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
    const response = await fetch(`${CART_ENDPOINT}?user_id=eq.${encodeURIComponent(user.id)}&select=items&limit=1`, {
      headers: cartHeaders(user.accessToken)
    });

    if (!response.ok) throw new Error(`Supabase cart request failed: ${response.status}`);

    const rows = await response.json();
    const remoteCart = normalizeCart(rows?.[0]?.items || []);
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
  const normalizedSize = normalizeSize(size);
  const amount = Number(qty) || 1;
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id && entry.size === normalizedSize);

  if (item) item.qty += amount;
  else cart.push({ id, qty: amount, size: normalizedSize });

  saveCart(cart);
}

export function updateQty(id, size, qty) {
  const normalizedSize = normalizeSize(size);
  const cart = getCart().map((item) => (
    item.id === id && item.size === normalizedSize
      ? { ...item, qty: Number(qty) || 0 }
      : item
  ));

  saveCart(cart.filter((item) => item.qty > 0));
}

export function removeItem(id, size) {
  const normalizedSize = normalizeSize(size);
  saveCart(getCart().filter((item) => !(item.id === id && item.size === normalizedSize)));
}

export function clearCart() {
  saveCart([]);
}

export function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
