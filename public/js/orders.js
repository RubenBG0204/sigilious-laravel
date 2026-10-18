import { getCurrentUser } from "./users.js";

const ORDERS_KEY = "sigilious_orders";

function normalizeOrder(order) {
  return {
    id: String(order.id),
    userId: String(order.userId ?? order.user_id ?? "guest"),
    name: order.name || order.customer_name || "",
    items: order.items || [],
    total: Number(order.total) || 0,
    date: order.date || order.created_at || new Date().toISOString()
  };
}

async function request(method, body) {
  const user = getCurrentUser();

  const response = await fetch("/api/orders", {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    throw new Error(firstError || data?.message || "No se pudo completar el pedido.");
  }

  return data;
}

export function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]").map(normalizeOrder);
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.map(normalizeOrder)));
}

export async function syncOrdersFromSupabase() {
  const user = getCurrentUser();
  if (!user?.id || !user?.accessToken) return getOrders();

  try {
    const rows = await request("GET");
    const orders = rows.map(normalizeOrder);
    saveOrders(orders);
    return orders;
  } catch (error) {
    console.warn(error);
    return getOrders();
  }
}

export async function createOrder(order) {
  const data = await request("POST", {
    name: order.name,
    items: order.items.map((item) => ({
      product_id: item.product.id,
      size: item.size || "M",
      qty: item.qty
    }))
  });

  const saved = normalizeOrder(data);
  saveOrders([saved, ...getOrders().filter((entry) => entry.id !== saved.id)]);
  return saved;
}

export function getUserOrders(userId) {
  return getOrders().filter((order) => order.userId === String(userId));
}