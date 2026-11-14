const W = 720;
const SCALE = 2; // draw at 2x so the image stays sharp when shared
const PAD = 40;
const HEADER_H = 84;
const AMOUNT_H = 150;
const ROW_H = 46;
const FOOTER_H = 130;
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const STATUS_COLORS = {
    success: "#15803d",
    paid: "#15803d",
    pending: "#6b7280",
    canceled: "#b91c1c",
    failed: "#b91c1c",
};

// Shorten text with "…" so it never runs past the card
function fit(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
        cut = cut.slice(0, -1);
    }
    return `${cut}…`;
}

function drawReceipt(row, note) {
    const details = [["Type", row.kind === "payment" ? "payment request" : row.type]];
    const text = row.description || note;
    if (text) details.push(["Note", text]);
    details.push(
        ["From", row.from_address ?? "—"],
        ["To", row.to_address ?? "—"],
        ["Date", new Date(row.created_at).toLocaleString()],
        ["Reference", row.id]
    );

    const H = HEADER_H + AMOUNT_H + details.length * ROW_H + FOOTER_H;
    const canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);
    ctx.textBaseline = "middle";

    // Background + header
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#0b1410";
    ctx.fillRect(0, 0, W, HEADER_H);

    ctx.fillStyle = "#80ff65";
    ctx.font = `bold 26px ${MONO}`;
    ctx.fillText("testpay_", PAD, HEADER_H / 2);

    ctx.fillStyle = "#9db3a8";
    ctx.font = `12px ${MONO}`;
    ctx.textAlign = "right";
    ctx.fillText("PROOF OF PAYMENT · TEST MODE", W - PAD, HEADER_H / 2);
    ctx.textAlign = "left";

    // Amount
    const amountY = HEADER_H + 84;
    ctx.fillStyle = "#6b7280";
    ctx.font = `12px ${MONO}`;
    ctx.fillText("AMOUNT", PAD, HEADER_H + 34);

    const amountText = Number(row.amount).toLocaleString();
    ctx.fillStyle = "#111827";
    ctx.font = `bold 52px ${MONO}`;
    ctx.fillText(amountText, PAD, amountY);
    const amountWidth = ctx.measureText(amountText).width;
    ctx.fillStyle = "#6b7280";
    ctx.font = `bold 20px ${MONO}`;
    ctx.fillText("TC", PAD + amountWidth + 10, amountY);

    // Status pill
    const label = (row.status === "success" ? "completed" : row.status).toUpperCase();
    ctx.font = `bold 12px ${MONO}`;
    const pillW = ctx.measureText(label).width + 28;
    const pillX = W - PAD - pillW;
    ctx.fillStyle = STATUS_COLORS[row.status] ?? "#6b7280";
    ctx.beginPath();
    ctx.roundRect(pillX, amountY - 14, pillW, 28, 14);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(label, pillX + pillW / 2, amountY);
    ctx.textAlign = "left";

    // Detail rows
    let y = HEADER_H + AMOUNT_H;
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    details.forEach(([name, value]) => {
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(W - PAD, y);
        ctx.stroke();

        ctx.fillStyle = "#6b7280";
        ctx.font = `13px ${SANS}`;
        ctx.fillText(name, PAD, y + ROW_H / 2);

        ctx.fillStyle = "#111827";
        ctx.font = `14px ${MONO}`;
        ctx.fillText(fit(ctx, String(value), W - PAD * 2 - 130), PAD + 130, y + ROW_H / 2);
        y += ROW_H;
    });

    // Footer
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - PAD, y);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = `12px ${SANS}`;
    ctx.fillText("Verify this transaction at:", PAD, y + 34);
    ctx.fillStyle = "#111827";
    ctx.font = `12px ${MONO}`;
    ctx.fillText(
        fit(ctx, `${window.location.origin}/explorer?id=${row.id}`, W - PAD * 2),
        PAD,
        y + 58
    );
    ctx.fillStyle = "#9ca3af";
    ctx.font = `11px ${SANS}`;
    ctx.fillText("TestPay uses test money only. Nothing real was charged.", PAD, y + 92);

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the receipt image."))),
            "image/png"
        )
    );
}

// `id` is a transaction id or a payment id. `note` is your own memo, if you have one.
export async function downloadReceipt(supabase, id, note) {
    const { data, error } = await supabase.rpc("lookup_transaction", { p_id: id });
    const row = data?.[0];
    if (error || !row) throw new Error("Couldn't load this transaction.");

    const blob = await drawReceipt(row, note);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `testpay-receipt-${row.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}