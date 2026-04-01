/**
 * Input sanitization utilities to prevent XSS attacks.
 * Replaces the 50+ unsanitized innerHTML usages in the original codebase.
 */

/**
 * Escape HTML entities to prevent XSS when inserting user content into the DOM.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize a phone number - only allow digits, +, spaces, dashes, parens.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-() ]/g, "").trim();
}

/**
 * Sanitize an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate and sanitize a string for use as a name.
 */
export function sanitizeName(name: string): string {
  return name.replace(/[<>'"&]/g, "").trim().slice(0, 200);
}

/**
 * Validate that a string looks like a valid Anthropic API key format.
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^sk-ant-[a-zA-Z0-9_-]{20,}$/.test(key);
}

/**
 * Sanitize notes/free-text input - allow most chars but escape HTML.
 */
export function sanitizeText(text: string): string {
  return escapeHtml(text.trim()).slice(0, 5000);
}
