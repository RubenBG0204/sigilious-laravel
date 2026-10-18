const CURRENT_KEY = "sigilious_current_user";
const API = "/api";

async function request(path, { body, token } = {}) {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    throw new Error(firstError || data?.message || "Error de autenticación.");
  }

  return data;
}

function saveSession({ user, token }) {
  const current = {
    id: String(user.id),
    name: user.name,
    email: user.email,
    accessToken: token
  };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
  return current;
}

export async function registerUser({ name, email, password }) {
  try {
    const data = await request("/register", { body: { name, email, password } });
    return { success: true, user: saveSession(data) };
  } catch (error) {
    return { success: false, message: error.message || "No se pudo crear la cuenta." };
  }
}

export async function login(email, password) {
  try {
    const data = await request("/login", { body: { email, password } });
    return { success: true, user: saveSession(data) };
  } catch (error) {
    return { success: false, message: error.message || "Credenciales inválidas." };
  }
}

export async function requestPasswordReset() {
  return {
    success: false,
    message: "La recuperación de contraseña aún no está disponible."
  };
}

export async function logout() {
  const user = getCurrentUser();
  if (user?.accessToken) {
    await request("/logout", { token: user.accessToken }).catch(() => {});
  }
  localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser() {
  const stored = localStorage.getItem(CURRENT_KEY);
  return stored ? JSON.parse(stored) : null;
}