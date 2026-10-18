import { cartCount } from "./cart.js";

const TOAST_DURATION = 3000;

function ensureToastStack() {
  let stack = document.getElementById("toastStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

export function showToast(message, type = "info", duration = TOAST_DURATION) {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const removeToast = () => {
    if (!toast.parentElement) return;
    toast.classList.remove("show");
    toast.classList.add("hide");
    window.setTimeout(() => toast.remove(), 280);
  };

  toast.querySelector(".toast-close").addEventListener("click", removeToast);
  stack.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  window.setTimeout(removeToast, duration);
  return toast;
}

export function setButtonLoading(button, isLoading, loadingText = "Cargando...") {
  if (!button) return () => {};

  if (!button.dataset.originalHtml) {
    button.dataset.originalHtml = button.innerHTML;
  }

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent.trim();
  }

  if (isLoading) {
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = `
      <span class="btn-content">
        <span class="btn-spinner" aria-hidden="true"></span>
        <span>${loadingText}</span>
      </span>
    `;
    return () => setButtonLoading(button, false);
  }

  button.disabled = false;
  button.classList.remove("is-loading");
  button.innerHTML = button.dataset.originalHtml;
  return () => {};
}

export function isValidCreditCard(value) {
  const digits = String(value || "").replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateField(input, options = {}) {
  if (!input) return false;

  const rules = typeof options === "string" ? { errorId: options } : options;
  const {
    errorId,
    required = false,
    isEmail = false,
    isCreditCard = false,
    minLength = 0
  } = rules;

  const value = input.value.trim();
  const error = errorId ? document.getElementById(errorId) : null;
  let message = "";

  if (required && !value) {
    message = "Obligatorio.";
  } else if (isEmail) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      message = "Email inválido.";
    }
  } else if (minLength && value.length < minLength) {
    message = `Minimum ${minLength} characters.`;
  } else if (isCreditCard && !isValidCreditCard(value)) {
    message = "Número de tarjeta inválido.";
  }

  if (error) error.textContent = message;
  input.classList.toggle("input-invalid", Boolean(message));
  input.classList.toggle("input-valid", !message && Boolean(value));
  return !message;
}

export function formatPrice(value, currency = "EUR", locale = "es-ES") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = String(cartCount());
}

export function smoothScrollTo(target, options = {}) {
  if (!target) return;
  const behavior = options.behavior || "smooth";
  const top = typeof target === "number"
    ? target
    : target.getBoundingClientRect().top + window.scrollY - (options.offset || 0);

  window.scrollTo({ top, behavior });
}
