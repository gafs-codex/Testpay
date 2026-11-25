"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import Spinner, { PageLoader } from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { statusClass } from "@/lib/format";

const MAX_AMOUNT = 1000000;
const fmt = (n) => Number(n).toLocaleString();

export default function AdminPage() {
    const supabase = useMemo(() => createClient(), []);
    const loadedOnce = useRef(false);

    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState(false);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [loadError, setLoadError] = useState("");
    const [listBusy, setListBusy] = useState(false);

    const [defaults, setDefaults] = useState({ amount: "", cooldown: "" });
    const [savingDefaults, setSavingDefaults] = useState(false);

    const [amounts, setAmounts] = useState({}); // approve amount typed for each request
    const [busyId, setBusyId] = useState(null);
    const [toReject, setToReject] = useState(null);

    const load = useCallback(async () => {
        try {
            const [statsRes, listRes] = await Promise.all([
                supabase.rpc("admin_stats"),
                supabase.rpc("admin_list_requests", { p_history: history }),
            ]);
            if (statsRes.error) throw statsRes.error;
            if (listRes.error) throw listRes.error;

            setStats(statsRes.data[0]);
            setRequests(listRes.data);
            loadedOnce.current = true;
            setStatus("ready");
        } catch (error) {
            const message = friendlyError(error, "Couldn't load the admin dashboard.");
            if (loadedOnce.current) toast.error(message);
            else {
                setLoadError(message);
                setStatus("error");
            }
        }
    }, [supabase, history]);

    useEffect(() => {
        let active = true;
        setListBusy(true);
        load().finally(() => active && setListBusy(false));
        return () => {
            active = false;
        };
    }, [load]);

    // Fill the defaults form once the numbers arrive
    const defaultAmount = stats?.default_amount;
    const defaultCooldown = stats?.default_cooldown_hours;
    useEffect(() => {
        if (defaultAmount === undefined) return;
        setDefaults({ amount: String(defaultAmount), cooldown: String(defaultCooldown) });
    }, [defaultAmount, defaultCooldown]);

    async function review(req, approve) {
        setBusyId(req.id);
        try {
            const amount = Number(amounts[req.id] ?? req.requested_amount);
            if (approve && (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT)) {
                toast.error("Enter a whole amount between 1 and 1,000,000.");
                return;
            }
            const { error } = await supabase.rpc("review_faucet_request", {
                p_id: req.id,
                p_approve: approve,
                p_amount: approve ? amount : null,
            });
            if (error) throw error;

            toast.success(
                approve
                    ? `Approved: ${req.display_name || "user"} can now claim ${fmt(amount)} TC.`
                    : "Request rejected."
            );
            await load();
        } catch (error) {
            toast.error(friendlyError(error));
        } finally {
            setBusyId(null);
            setToReject(null);
        }
    }

    async function saveDefaults(event) {
        event.preventDefault();
        const amount = Number(defaults.amount);
        const cooldown = Number(defaults.cooldown);

        if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) {
            toast.error("Amount must be a whole number between 1 and 1,000,000.");
            return;
        }
        if (!Number.isInteger(cooldown) || cooldown < 1 || cooldown > 168) {
            toast.error("Cooldown must be a whole number between 1 and 168 hours.");
            return;
        }

        setSavingDefaults(true);
        try {
            const { error } = await supabase.rpc("update_faucet_defaults", { p_amount: amount, p_cooldown: cooldown });
            if (error) throw error;
            toast.success("Faucet defaults saved.");
            await load();
        } catch (error) {
            toast.error(friendlyError(error));
        } finally {
            setSavingDefaults(false);
        }
    }

    if (status === "loading") return <PageLoader label="Loading admin dashboard..." />;
    if (status === "error") {
        return (
            <ErrorState
                title="Couldn't load the admin dashboard"
                message={loadError}
                onRetry={() => {
                    setStatus("loading");
                    load();
                }}
            />
        );
    }

    const statCards = [
        { label: "Total users", value: fmt(stats.total_users) },
        { label: "Pending faucet requests", value: fmt(stats.pending_requests) },
        { label: "Individual faucet limits", value: fmt(stats.individual_limits) },
        { label: "Total payments", value: fmt(stats.total_payments) },
        { label: "Successful payments", value: fmt(stats.successful_payments) },
        { label: "Test payment volume", value: `${fmt(stats.payment_volume)} TC` },
    ];

    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-8 px-6 py-8 lg:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">TestPay / Administration</p>
                    <h1 className="mt-2 text-3xl font-semibold">Admin dashboard</h1>
                </div>
                <span className="rounded border border-primary/40 px-3 py-1 font-mono text-xs text-primary">
                    Super Admin
                </span>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <div key={card.label} className="rounded-xl border bg-card p-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</p>
                        <p className="mt-2 font-mono text-3xl font-bold tabular-nums">{card.value}</p>
                    </div>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                {/* Requests */}
                <div className="rounded-xl border border-border bg-card">
                    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-4">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                Faucet approvals
                            </p>
                            <h2 className="mt-1 text-lg font-semibold">
                                {history ? "Reviewed requests" : "Limit increase requests"}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setHistory((value) => !value)}
                            className="h-8 cursor-pointer rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent"
                        >
                            {history ? "Show pending" : "View history"}
                        </button>
                    </div>

                    <ul className="divide-y divide-border">
                        {listBusy ? (
                            <li className="grid place-items-center p-12">
                                <Spinner />
                            </li>
                        ) : requests.length === 0 ? (
                            <li className="p-12 text-center text-sm text-muted-foreground">
                                {history ? "No reviewed requests yet." : "No pending requests."}
                            </li>
                        ) : (
                            requests.map((r) => (
                                <li key={r.id} className="space-y-3 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium">{r.display_name || "Unnamed user"}</p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">{r.address}</p>
                                        </div>
                                        <span className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass(r.status)}`}>
                                            {r.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground">"{r.reason}"</p>

                                    <p className="font-mono text-xs text-muted-foreground">
                                        Limit {fmt(r.current_limit)} TC → requested {fmt(r.requested_amount)} TC
                                        {r.approved_amount ? ` · approved ${fmt(r.approved_amount)} TC` : ""}
                                        {r.reviewed_at ? ` · ${new Date(r.reviewed_at).toLocaleDateString()}` : ""}
                                    </p>

                                    {r.status === "pending" && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                aria-label="Approved amount in TC"
                                                value={amounts[r.id] ?? String(r.requested_amount)}
                                                onChange={(event) =>
                                                    setAmounts((prev) => ({ ...prev, [r.id]: event.target.value }))
                                                }
                                                className="h-9 w-32 rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => review(r, true)}
                                                disabled={busyId === r.id}
                                                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busyId === r.id && (
                                                    <Spinner className="size-4 border-primary-foreground/30 border-t-primary-foreground" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setToReject(r)}
                                                disabled={busyId === r.id}
                                                className="h-9 cursor-pointer rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Global defaults */}
                <form onSubmit={saveDefaults} noValidate className="space-y-4 self-start rounded-xl border border-border bg-card p-6">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Global faucet</p>
                        <h2 className="mt-1 text-lg font-semibold">Default allowance</h2>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Individually approved limits stay separate from this default. The cooldown applies to everyone.
                        </p>
                    </div>

                    <Field
                        label="TestCoin per claim"
                        id="default_amount"
                        type="number"
                        min="1"
                        step="1"
                        value={defaults.amount}
                        onChange={(event) => setDefaults((prev) => ({ ...prev, amount: event.target.value }))}
                        className="font-mono"
                    />
                    <Field
                        label="Cooldown (hours)"
                        id="default_cooldown"
                        type="number"
                        min="1"
                        max="168"
                        step="1"
                        value={defaults.cooldown}
                        onChange={(event) => setDefaults((prev) => ({ ...prev, cooldown: event.target.value }))}
                        className="font-mono"
                    />

                    <button
                        type="submit"
                        disabled={savingDefaults}
                        className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {savingDefaults && <Spinner className="size-4 border-primary-foreground/30 border-t-primary-foreground" />}
                        {savingDefaults ? "Saving..." : "Save defaults"}
                    </button>
                </form>
            </section>

            <ConfirmDialog
                open={Boolean(toReject)}
                title="Reject this request?"
                description={
                    toReject
                        ? `${toReject.display_name || "This user"} asked for ${fmt(toReject.requested_amount)} TC per claim. They'll see the request as rejected.`
                        : ""
                }
                confirmLabel="Reject request"
                cancelLabel="Keep pending"
                destructive
                loading={Boolean(toReject) && busyId === toReject.id}
                onConfirm={() => review(toReject, false)}
                onCancel={() => setToReject(null)}
            />
        </main>
    );
}