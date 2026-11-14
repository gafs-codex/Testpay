"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { downloadReceipt } from "@/lib/receipt";

const linkStyle =
    "inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

export default function ReceiptButton({ id, note, label = "Receipt", className }) {
    const [busy, setBusy] = useState(false);

    async function handleClick() {
        setBusy(true);
        try {
            await downloadReceipt(createClient(), id, note);
            toast.success("Receipt downloaded.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <button type="button" onClick={handleClick} disabled={busy} className={className ?? linkStyle}>
            <Download className="size-3.5" />
            {busy ? "Preparing..." : label}
        </button>
    );
}