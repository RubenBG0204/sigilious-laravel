// Product data and helpers
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

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
const PRODUCTS_ENDPOINT = `${SUPABASE_URL}/rest/v1/products`;

const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

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

async function requestProducts(path = "", options = {}) {
  const response = await fetch(`${PRODUCTS_ENDPOINT}${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase products request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
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

export async function addProductToSupabase(product) {
  const normalizedProduct = normalizeProduct(product);
  await requestProducts("", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(normalizedProduct)
  });
  addProduct(normalizedProduct);
}

export async function updateProductInSupabase(product) {
  const normalizedProduct = normalizeProduct(product);
  await requestProducts(`?id=eq.${encodeURIComponent(normalizedProduct.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(normalizedProduct)
  });
  updateProduct(normalizedProduct);
}

export async function deleteProductFromSupabase(id) {
  await requestProducts(`?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  deleteProduct(id);
}
