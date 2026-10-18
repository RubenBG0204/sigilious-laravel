// Product data and helpers
import { getCurrentUser } from "./users.js";

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Camiseta Costura Contour", price: 42, category: "tshirts", image: "img-2", description: "Algodon transpirable con ajuste entallado.", sizes: ["S", "M", "L", "XL"] },
  { id: "p2", name: "Sudadera Airline Tech", price: 98, category: "hoodies", image: "img-1", description: "Felpa suave con capucha estructurada.", sizes: ["S", "M", "L", "XL"] },
  { id: "p3", name: "Pantalon Studio Taper", price: 76, category: "pants", image: "img-3", description: "Pierna entallada con elasticidad premium.", sizes: ["S", "M", "L", "XL"] },
  { id: "p4", name: "Gorra Aero", price: 28, category: "accessories", image: "img-8", description: "Bordado minimalista, tejido ligero.", sizes: ["M", "L"] },
  { id: "p5", name: "Zapatilla Momentum", price: 120, category: "shoes", image: "img-9", description: "Suela amortiguada, lista para la ciudad.", sizes: ["39", "40", "41", "42", "43", "44"] },
  { id: "p6", name: "Camiseta Soft Rib", price: 35, category: "tshirts", image: "img-5", description: "Textura acanalada sutil, fit slim.", sizes: ["S", "M", "L"] },
  { id: "p7", name: "Sudadera Cloud", price: 86, category: "hoodies", image: "img-6", description: "Ajuste relajado con interior perchado.", sizes: ["S", "M", "L", "XL"] },
  { id: "p8", name: "Pantalon Flow", price: 72, category: "pants", image: "img-7", description: "Caida fluida con acabado sastre.", sizes: ["S", "M", "L", "XL"] },
  { id: "p9", name: "Cinturon Signature", price: 26, category: "accessories", image: "img-4", description: "Hebilla mate, diseno minimalista.", sizes: ["S", "M", "L"] }
];

const PRODUCT_KEY = "sigilious_products";

function normalizeProduct(product) {
  return {
    id: String(product.id),
    name: product.name,
    price: Number(product.price),
    category: product.category,
    image: product.image || "img-1",
    description: product.description || "",
    sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["S", "M", "L", "XL"]
  };
}

async function adminRequest(path, method, body) {
  const user = getCurrentUser();
  if (!user?.accessToken) throw new Error("Inicia sesión como administrador.");

  const response = await fetch(`/api/products${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${user.accessToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    throw new Error(firstError || data?.message || "No se pudo guardar el producto.");
  }

  return data;
}

export function getProducts() {
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (stored) return JSON.parse(stored).map(normalizeProduct);
  saveProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

export function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products.map(normalizeProduct)));
}

export function getProductById(id) {
  return getProducts().find((product) => product.id === id);
}

export function addProduct(product) {
  saveProducts([...getProducts(), normalizeProduct(product)]);
}

export function updateProduct(product) {
  const normalizedProduct = normalizeProduct(product);
  const products = getProducts().map((entry) => (entry.id === normalizedProduct.id ? normalizedProduct : entry));
  saveProducts(products);
}

export function deleteProduct(id) {
  saveProducts(getProducts().filter((product) => product.id !== id));
}

export function filterProducts({ search = "", category = "all", price = "all", sort = "featured" }) {
  let items = [...getProducts()];

  if (search) {
    items = items.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  }

  if (category !== "all") {
    items = items.filter((product) => product.category === category);
  }

  if (price !== "all") {
    const [min, max] = price.split("-").map(Number);
    items = items.filter((product) => (max ? product.price >= min && product.price <= max : product.price < min));
  }

  if (sort === "low") items.sort((a, b) => a.price - b.price);
  if (sort === "high") items.sort((a, b) => b.price - a.price);
  if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));

  return items;
}

export async function syncProductsFromSupabase() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error(`Products request failed: ${response.status}`);

    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) return getProducts();

    const products = rows.map(normalizeProduct);
    saveProducts(products);
    return products;
  } catch (error) {
    console.warn(error);
    return getProducts();
  }
}

function adminPayload(product) {
  return {
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image
  };
}

export async function addProductToSupabase(product) {
  await adminRequest("", "POST", adminPayload(product));
  await syncProductsFromSupabase();
}

export async function updateProductInSupabase(product) {
  await adminRequest(`/${encodeURIComponent(product.id)}`, "PUT", adminPayload(product));
  await syncProductsFromSupabase();
}

export async function deleteProductFromSupabase(id) {
  await adminRequest(`/${encodeURIComponent(id)}`, "DELETE");
  await syncProductsFromSupabase();
}