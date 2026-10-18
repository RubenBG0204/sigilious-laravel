import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

const CURRENT_KEY = "sigilious_current_user";
const AUTH_KEY = "sigilious_auth_session";
const AUTH_ENDPOINT = `${SUPABASE_URL}/auth/v1`;
const REST_ENDPOINT = `${SUPABASE_URL}/rest/v1`;

function authHeaders(token = SUPABASE_ANON_KEY) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

async function readResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.msg || data?.error_description || data?.message || "Error de autenticacion.");
  }

  return data;
}

function saveSession(session) {
  if (!session?.access_token || !session?.user) return null;

  const user = {
    id: session.user.id,
    name: session.user.user_metadata?.name || session.user.email,
    email: session.user.email,
    accessToken: session.access_token,
    refreshToken: session.refresh_token
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  return user;
}

async function upsertProfile(user, name = "") {
  if (!user?.accessToken) return;

  await fetch(`${REST_ENDPOINT}/profiles`, {
    method: "POST",
    headers: {
      ...authHeaders(user.accessToken),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({
      id: user.id,
      name: name || user.name || "",
      email: user.email
    })
  });
}

export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(`${AUTH_ENDPOINT}/signup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: { name }
      })
    });

    const session = await readResponse(response);
    const user = saveSession(session);

    if (!user) {
      return {
        success: false,
        message: "Registro creado. Revisa tu correo para confirmar la cuenta antes de iniciar sesion."
      };
    }

    await upsertProfile(user, name);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message || "No se pudo crear la cuenta." };
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(`${AUTH_ENDPOINT}/token?grant_type=password`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password })
    });

    const session = await readResponse(response);
    const user = saveSession(session);
    await upsertProfile(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message || "Credenciales invalidas." };
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${AUTH_ENDPOINT}/recover`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email })
    });

    await readResponse(response);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message || "No se pudo enviar el correo de recuperacion."
    };
  }
}

export async function logout() {
  const user = getCurrentUser();
  if (user?.accessToken) {
    await fetch(`${AUTH_ENDPOINT}/logout`, {
      method: "POST",
      headers: authHeaders(user.accessToken)
    }).catch(() => {});
  }

  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(CURRENT_KEY);
}

export function getCurrentUser() {
  const stored = localStorage.getItem(CURRENT_KEY);
  return stored ? JSON.parse(stored) : null;
}
