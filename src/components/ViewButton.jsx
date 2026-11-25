"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import TransactionDialog from "@/components/TransactionDialogue";

const defaultStyle =
    "inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline";

export default function ViewButton({ id, note, label = "View", className }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className ?? defaultStyle}>
                <Eye className="size-3.5" />
                {label}
            </button>
            {open && <TransactionDialog id={id} note={note} onClose={() => setOpen(false)} />}
        </>
    );
}