import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";
import { getCurrentUser } from "./users.js";

const ORDERS_KEY = "sigilious_orders";
const ORDERS_ENDPOINT = `${SUPABASE_URL}/rest/v1/orders`;

function orderHeaders(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function normalizeOrder(order) {
  return {
    id: order.id,
    userId: order.userId || order.user_id || "guest",
    name: order.name || order.customer_name || "",
    items: order.items || [],
    total: Number(order.total) || 0,
    date: order.date || order.created_at || new Date().toISOString()
  };
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
    const response = await fetch(`${ORDERS_ENDPOINT}?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc`, {
      headers: orderHeaders(user.accessToken)
    });

    if (!response.ok) throw new Error(`Supabase orders request failed: ${response.status}`);

    const rows = await response.json();
    const orders = rows.map(normalizeOrder);
    saveOrders(orders);
    return orders;
  } catch (error) {
    console.warn(error);
    return getOrders();
  }
}

export async function createOrder(order) {
  const normalizedOrder = normalizeOrder(order);
  const orders = getOrders();
  saveOrders([normalizedOrder, ...orders.filter((entry) => entry.id !== normalizedOrder.id)]);

  const user = getCurrentUser();
  if (!user?.id || !user?.accessToken) return;

  await fetch(ORDERS_ENDPOINT, {
    method: "POST",
    headers: {
      ...orderHeaders(user.accessToken),
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      id: normalizedOrder.id,
      user_id: user.id,
      customer_name: normalizedOrder.name,
      items: normalizedOrder.items,
      total: normalizedOrder.total,
      created_at: normalizedOrder.date
    })
  }).catch((error) => console.warn(error));
}

export function getUserOrders(userId) {
  return getOrders().filter((order) => order.userId === userId);
}
