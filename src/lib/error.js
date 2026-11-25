const NETWORK_HINTS = ["failed to fetch", "networkerror", "network request failed", "load failed", "fetch failed"];

export function isNetworkError(error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
    const message = String(error?.message ?? error ?? "").toLowerCase();
    return NETWORK_HINTS.some((hint) => message.includes(hint));
}

// Turn any error into something readable and safe to show a user
export function friendlyError(error, fallback = "Something went wrong. Please try again.") {
    if (isNetworkError(error)) return "Can't reach TestPay. Check your internet connection and try again.";

    const message = String(error?.message ?? "");
    if (/jwt|refresh token/i.test(message)) return "Your session expired. Please sign in again.";

    // Our SQL functions raise short, readable messages. Hide anything technical.
    const technical = /[{}]|violates|relation|permission denied|syntax|column|constraint|coerce/i.test(message);
    if (message && message.length < 120 && !technical) return message;

    return fallback;
}