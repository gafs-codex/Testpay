"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { fetchTransaction, saveReceipt } from "@/lib/receipt";
import { friendlyError } from "@/lib/error";
import { statusClass } from "@/lib/format";

function Row({ label, value, mono = true }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={`break-all sm:text-right ${mono ? "font-mono" : ""}`}>{value}</dd>
        </div>
    );
}

const outlineBtn =
    "inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";

export default function TransactionDialog({ id, note, onClose }) {
    const supabase = useMemo(() => createClient(), []);
    const ref = useRef(null);
    const [state, setState] = useState({ view: "loading" }); // loading | ready | error
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const load = useCallback(async () => {
        setState({ view: "loading" });
        try {
            setState({ view: "ready", row: await fetchTransaction(supabase, id) });
        } catch (error) {
            setState({ view: "error", message: friendlyError(error, "Couldn't load this transaction.") });
        }
    }, [supabase, id]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDownload() {
        setSaving(true);
        try {
            await saveReceipt(state.row, note);
            toast.success("Receipt downloaded.");
        } catch (error) {
            toast.error(friendlyError(error, "Couldn't create the receipt."));
        } finally {
            setSaving(false);
        }
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/explorer?id=${state.row.id}`);
            toast.success("Verify link copied.");
        } catch {
            toast.error("Couldn't copy the link.");
        }
    }

    const row = state.row;

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === ref.current) ref.current.close(); // click on the dark backdrop
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-card p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold">Transaction details</h2>
                    <button
                        type="button"
                        onClick={() => ref.current?.close()}
                        className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Close
                    </button>
                </div>

                {state.view === "loading" && (
                    <div className="grid place-items-center py-16">
                        <Spinner className="size-8" />
                    </div>
                )}

                {state.view === "error" && (
                    <div role="alert" className="space-y-3 py-10 text-center">
                        <p className="text-sm text-destructive">{state.message}</p>
                        <button type="button" onClick={load} className={`${outlineBtn} mx-auto flex-none`}>
                            Try again
                        </button>
                    </div>
                )}

                {state.view === "ready" && (
                    <>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="font-mono text-4xl font-bold tabular-nums text-primary">
                                {Number(row.amount).toLocaleString()}
                                <span className="ml-2 text-lg text-muted-foreground">TC</span>
                            </p>
                            <span className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass(row.status)}`}>
                                {row.status === "success" ? "completed" : row.status}
                            </span>
                        </div>

                        <dl className="mt-5 divide-y divide-border border-t border-border text-sm">
                            <Row label="Type" value={row.kind === "payment" ? "Payment request" : row.type} mono={false} />
                            {(row.description || note) && (
                                <Row label="Note" value={row.description || note} mono={false} />
                            )}
                            <Row label="From" value={row.from_address ?? "—"} />
                            <Row label="To" value={row.to_address ?? "—"} />
                            <Row label="Date" value={new Date(row.created_at).toLocaleString()} />
                            <Row label="Reference" value={row.id} />
                        </dl>

                        <div className="mt-6 flex gap-2">
                            <button type="button" onClick={handleDownload} disabled={saving} className={outlineBtn}>
                                {saving ? <Spinner className="size-4" /> : <Download className="size-4" />}
                                {saving ? "Preparing..." : "Download"}
                            </button>
                            <button type="button" onClick={handleCopyLink} className={outlineBtn}>
                                <Copy className="size-4" />
                                Copy verify link
                            </button>
                        </div>
                    </>
                )}
            </div>
        </dialog>
    );
}