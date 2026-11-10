export function formatAmount(amount) {
    const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
    return `${sign}${Math.abs(amount).toLocaleString()}`;
}

// Outgoing = red, incoming = green
export function amountColor(amount) {
    return amount < 0 ? "text-destructive" : "text-primary";
}

export const shortId = (id) => id.slice(0, 8);

export function statusClass(status) {
    if (status === "paid") return "bg-primary/10 text-primary";
    if (status === "canceled") return "bg-destructive/10 text-destructive";
    return "bg-secondary text-muted-foreground"; // pending
}