"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReceiptButton from "@/components/ReceiptButton";
import { statusClass } from "@/lib/format";
import Spinner from "@/components/Spinner";
import { friendlyError } from "@/lib/error";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PROBLEMS = {
    invalid: "That doesn't look like a valid ID. Paste the full 36-character reference from a receipt or payment link.",
    notfound: "No transaction or payment was found with that ID.",
    error: "Couldn't look that up right now. Please try again.",
};

function Detail({ label, value, mono = true }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={`break-all sm:text-right ${mono ? "font-mono" : ""}`}>{value}</dd>
        </div>
    );
}

export default function ExplorerPage() {
    const supabase = useMemo(() => createClient(), []);
    const [query, setQuery] = useState("");
    const [state, setState] = useState({ view: "idle" }); // idle | loading | found | invalid | notfound | error

    const lookup = useCallback(
        async (raw) => {
            const id = raw.trim();
            if (!UUID.test(id)) {
                setState({ view: "invalid" });
                return;
            }

            setState({ view: "loading" });
            try {
                const { data, error } = await supabase.rpc("lookup_transaction", { p_id: id });
                if (error) throw error;
                setState(data?.[0] ? { view: "found", row: data[0] } : { view: "notfound" });
            } catch (error) {
                setState({ view: "error", message: friendlyError(error, PROBLEMS.error) });
            }
        },
        [supabase]
    );

    // Open /explorer?id=... links straight to the result
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get("id");
        if (id) {
            setQuery(id);
            lookup(id);
        }
    }, [lookup]);

    function handleSubmit(event) {
        event.preventDefault();
        const id = query.trim();
        if (!id) return;
        window.history.replaceState(null, "", `?id=${encodeURIComponent(id)}`); // keeps the URL shareable
        lookup(id);
    }

    const row = state.row;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="bg-grid border-b border-border">
                <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
                    <p className="font-mono text-xs text-primary">$ testpay explore</p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Transaction explorer
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                        Look up a TestPay transaction to inspect its status, amount, checkout details,
                        and payment activity.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            type="text"
                            placeholder="Paste a full transaction or payment ID..."
                            className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-card px-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        />

                        <button
                            type="submit"
                            disabled={state.view === "loading"}
                            className="h-12 cursor-pointer rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {state.view === "loading" && (
                                <Spinner className="size-4 border-primary-foreground/30 border-t-primary-foreground" />
                            )}
                            {state.view === "loading" ? "Looking up..." : "Look up transaction"}
                        </button>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Transaction details</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Payment information will appear here after a lookup.
                        </p>
                    </div>

                    <span className="w-fit rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        TEST MODE
                    </span>
                </div>

                <div className="mt-6 rounded-xl border border-border bg-card p-8 md:p-12">
                    {state.view === "found" ? (
                        <div>
                            <p className="font-mono text-xs text-primary">
                                $ testpay {row.kind} --inspect
                            </p>

                            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                                <p className="font-mono text-4xl font-bold tabular-nums text-primary">
                                    {row.amount.toLocaleString()}
                                    <span className="ml-2 text-lg text-muted-foreground">TC</span>
                                </p>
                                <span
                                    className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass(row.status)}`}
                                >
                                    {row.status === "success" ? "completed" : row.status}
                                </span>
                            </div>

                            <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
                                <Detail
                                    label="Type"
                                    value={row.kind === "payment" ? "Payment request" : row.type}
                                    mono={false}
                                />
                                {row.description && (
                                    <Detail label="Description" value={row.description} mono={false} />
                                )}
                                <Detail label="From" value={row.from_address ?? "—"} />
                                <Detail label="To" value={row.to_address ?? "—"} />
                                <Detail label="Date" value={new Date(row.created_at).toLocaleString()} />
                                <Detail label="Reference" value={row.id} />
                            </dl>

                            <div className="mt-6">
                                <ReceiptButton
                                    id={row.id}
                                    label="Download receipt"
                                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>
                    ) : PROBLEMS[state.view] ? (
                        <p role="alert" className="py-6 text-center text-sm text-destructive">
                            {state.message ?? PROBLEMS[state.view]}
                        </p>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="font-mono text-sm text-primary">{"{ }"}</p>
                            <h3 className="mt-4 text-lg font-medium">
                                {state.view === "loading" ? "Looking up..." : "No transaction selected"}
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                Enter a transaction or payment ID above to see its status, amount, and
                                wallet addresses.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}