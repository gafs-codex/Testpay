"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/error";
import { statusClass } from "@/lib/format";

const MAX_REQUEST = 10000;
const initialForm = { amount: "", reason: "" };

export default function FaucetCard({ lastClaimAt, walletReady, onClaimed }) {
    const supabase = useMemo(() => createClient(), []);

    const [info, setInfo] = useState(null); // { amount, cooldown_hours }
    const [request, setRequest] = useState(null); // latest request, if any
    const [failed, setFailed] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [claiming, setClaiming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [, tick] = useState(0);

    const load = useCallback(async () => {
        try {
            const [infoRes, reqRes] = await Promise.all([
                supabase.rpc("get_faucet_info"),
                supabase
                    .from("faucet_requests")
                    .select("id, requested_amount, approved_amount, status")
                    .order("created_at", { ascending: false })
                    .limit(1),
            ]);
            if (infoRes.error) throw infoRes.error;
            if (reqRes.error) throw reqRes.error;
            setInfo(infoRes.data[0]);
            setRequest(reqRes.data[0] ?? null);
            setFailed(false);
        } catch (error) {
            setFailed(true);
            toast.error(friendlyError(error, "Couldn't load faucet settings."));
        }
    }, [supabase]);

    useEffect(() => {
        load();
    }, [load]);

    const nextClaimAt =
        info && lastClaimAt ? new Date(lastClaimAt).getTime() + info.cooldown_hours * 3600 * 1000 : 0;
    const onCooldown = nextClaimAt > Date.now();

    // Re-enable the button the moment the cooldown ends
    useEffect(() => {
        if (!onCooldown) return;
        const timer = setTimeout(() => tick((n) => n + 1), nextClaimAt - Date.now() + 500);
        return () => clearTimeout(timer);
    }, [onCooldown, nextClaimAt]);

    async function handleClaim() {
        setClaiming(true);
        try {
            const { error } = await supabase.rpc("claim_faucet");
            if (error) throw error;
            toast.success(`${info.amount.toLocaleString()} TC added to your wallet.`);
            await onClaimed();
        } catch (error) {
            toast.error(friendlyError(error));
        } finally {
            setClaiming(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleRequest(event) {
        event.preventDefault();
        const amount = Number(form.amount);

        if (!Number.isInteger(amount) || amount <= info.amount) {
            toast.error(`Request a whole number above your current ${info.amount.toLocaleString()} TC.`);
            return;
        }
        if (amount > MAX_REQUEST) {
            toast.error(`You can request up to ${MAX_REQUEST.toLocaleString()} TC.`);
            return;
        }
        if (form.reason.trim().length < 10) {
            toast.error("Please explain why you need more (at least 10 characters).");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.rpc("request_faucet_limit", {
                p_amount: amount,
                p_reason: form.reason.trim(),
            });
            if (error) throw error;
            toast.success("Request sent. The admin will review it.");
            setForm(initialForm);
            setShowForm(false);
            await load();
        } catch (error) {
            toast.error(friendlyError(error));
        } finally {
            setSubmitting(false);
        }
    }

    const hours = info?.cooldown_hours;
    const pending = request?.status === "pending";

    return (
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
            <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Faucet</p>

                {info ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Claim {info.amount.toLocaleString()} free TestCoin every {hours} hour{hours === 1 ? "" : "s"}.
                    </p>
                ) : failed ? (
                    <button
                        type="button"
                        onClick={load}
                        className="mt-2 cursor-pointer text-sm text-destructive underline"
                    >
                        Couldn't load faucet settings. Retry
                    </button>
                ) : (
                    <Spinner className="mt-3 size-5" />
                )}

                {onCooldown && (
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                        Next claim: {new Date(nextClaimAt).toLocaleString()}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={handleClaim}
                disabled={claiming || !walletReady || !info || onCooldown}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {claiming && <Spinner className="size-4 border-primary-foreground/30 border-t-primary-foreground" />}
                {claiming ? "Claiming..." : info ? `Claim ${info.amount.toLocaleString()} TestCoin` : "Claim TestCoin"}
            </button>

            {request && (
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    Your last request ({request.requested_amount.toLocaleString()} TC):
                    <span className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase ${statusClass(request.status)}`}>
                        {request.status}
                    </span>
                </p>
            )}

            {info && !pending && !showForm && (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="h-9 cursor-pointer rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent"
                >
                    Request a higher limit
                </button>
            )}

            {info && showForm && (
                <form onSubmit={handleRequest} noValidate className="space-y-3 border-t border-border pt-4">
                    <h3 className="font-semibold">Request a faucet upgrade</h3>
                    <p className="text-xs text-muted-foreground">
                        The TestPay admin reviews every request and may approve a different amount.
                    </p>

                    <Field
                        label="Requested amount (TC)"
                        id="amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder={String(info.amount * 2)}
                        value={form.amount}
                        onChange={handleChange}
                        className="font-mono"
                    />

                    <div className="space-y-1.5">
                        <label htmlFor="reason" className="text-sm font-medium">Reason</label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            maxLength={500}
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Tell us what you need the extra test funds for."
                            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting && <Spinner className="size-4 border-primary-foreground/30 border-t-primary-foreground" />}
                            {submitting ? "Sending..." : "Submit request"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="h-9 cursor-pointer rounded-md border border-input px-4 text-sm hover:bg-accent"
                        >
                            Close
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}