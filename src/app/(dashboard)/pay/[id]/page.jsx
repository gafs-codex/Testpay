"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { shortId } from "@/lib/format";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGES = {
    loading: "Loading payment...",
    missing: "This payment link doesn't exist.",
    error: "Couldn't load this payment. Please refresh the page.",
};

function Shell({ children }) {
    return (
        <main className="bg-grid flex min-h-[calc(100dvh-4rem)] items-start justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-xl border border-primary/30 bg-card p-6 shadow-glow sm:p-8">
                {children}
            </div>
        </main>
    );
}

function Row({ label, value, className = "" }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={`truncate ${className}`}>{value}</dd>
        </div>
    );
}

export default function PayPage() {
    const { id } = useParams();
    const supabase = useMemo(() => createClient(), []);

    const [payment, setPayment] = useState(null);
    const [balance, setBalance] = useState(null);
    const [view, setView] = useState("loading"); // loading | ready | missing | error
    const [paying, setPaying] = useState(false);

    const load = useCallback(async () => {
        if (!UUID.test(id)) {
            setView("missing");
            return;
        }
        const [payRes, walletRes] = await Promise.all([
            supabase.rpc("get_payment", { p_id: id }),
            supabase.from("wallets").select("balance").single(),
        ]);
        if (payRes.error || walletRes.error) {
            setView("error");
            return;
        }
        const found = payRes.data?.[0];
        if (!found) {
            setView("missing");
            return;
        }
        setPayment(found);
        setBalance(walletRes.data.balance);
        setView("ready");
    }, [supabase, id]);

    useEffect(() => {
        load();
    }, [load]);

    async function handlePay() {
        setPaying(true);
        try {
            const { error } = await supabase.rpc("pay_payment", { p_id: id });
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success(`Paid ${payment.amount.toLocaleString()} TC.`);
            await load();
            if (payment.success_url) {
                setTimeout(() => {
                    window.location.href = payment.success_url;
                }, 1500);
            }
        } finally {
            setPaying(false);
        }
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Payment link copied.");
        } catch {
            toast.error("Couldn't copy. Please copy the link from the address bar.");
        }
    }

    if (view !== "ready") {
        return (
            <Shell>
                <p className="text-center text-sm text-muted-foreground">{MESSAGES[view]}</p>
            </Shell>
        );
    }

    const pending = payment.status === "pending";
    const canceled = payment.status === "canceled";
    const tone = TONES[payment.status] ?? TONES.pending;
    const insufficient = balance < payment.amount;

    return (
        <Shell cardClass={tone.card}>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Pay {payment.merchant_name}
            </p>

            <p className={`mt-3 font-mono text-6xl font-bold tabular-nums ${tone.amount}`}>
                {payment.amount.toLocaleString()}
                <span className="ml-2 text-lg text-muted-foreground">TC</span>
            </p>

            {payment.description && (
                <p className="mt-2 text-sm text-muted-foreground">{payment.description}</p>
            )}

            <dl className="mt-6 space-y-2 border-t border-border pt-6 font-mono text-sm">
                <Row label="To" value={payment.seller_address} />
                <Row label="Payment" value={shortId(payment.id)} />
                <Row label="Status" value={payment.status} className={`capitalize ${tone.status}`} />
                <Row label="Your balance" value={`${balance.toLocaleString()} TC`} />
            </dl>

            <div className="mt-6 space-y-3">
                {/* Seller, still pending: can share the link */}
                {pending && payment.is_owner && (
                    <>
                        <p className="text-sm text-muted-foreground">
                            You created this request, so you can't pay it yourself. Share this link with
                            someone using a different TestPay account.
                        </p>
                        <button type="button" onClick={handleCopyLink} className={blockButton}>
                            Copy payment link
                        </button>
                    </>
                )}

                {/* Anyone else, still pending: can pay */}
                {pending && !payment.is_owner && (
                    <>
                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={paying || insufficient}
                            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {paying ? "Paying..." : `Pay ${payment.amount.toLocaleString()} TestCoin`}
                        </button>
                        {insufficient && (
                            <p role="alert" className="text-center text-xs text-destructive">
                                Insufficient balance. Claim from the faucet on your wallet page.
                            </p>
                        )}
                        {payment.cancel_url && (
                            <a
                                href={payment.cancel_url}
                                className="block text-center text-xs text-muted-foreground hover:text-foreground"
                            >
                                Cancel and go back
                            </a>
                        )}
                    </>
                )}

                {/* Paid or canceled: no copy link, no pay button */}
                {!pending && (
                    <p
                        role="status"
                        className={`text-center text-sm ${canceled ? "text-destructive" : "text-primary"}`}
                    >
                        {canceled
                            ? "This payment was canceled and can no longer be paid."
                            : "This payment has been paid."}
                    </p>
                )}

                {payment.status === "paid" && (
                    <ReceiptButton id={payment.id} label="Download receipt" className={blockButton} />
                )}

                <p className="text-center text-xs text-muted-foreground">
                    TestPay uses test money only. Nothing real is charged.
                </p>
            </div>
        </Shell>
    );
}