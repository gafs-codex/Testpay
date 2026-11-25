"use client";

import Link from "next/link";
import { toast } from "sonner";
import PaymentActivity from "@/components/PaymentActivity";
import Field from "@/components/Field";
import { createClient } from "@/lib/supabase/client";
import { formatAmount, amountColor } from "@/lib/format";
import ReceiptButton from "@/components/ReceiptButton";
import { shortId } from "@/lib/format"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FaucetCard from "@/components/FaucetCard";
import ViewButton from "@/components/ViewButton";
import ErrorState from "@/components/ErrorState";
import { PageLoader } from "@/components/Spinner";
import { friendlyError } from "@/lib/error";

const LEDGER_FILTERS = ["All", "Faucet", "Payment", "Transfer"];
// const COOLDOWN_MS = 6 * 60 * 60 * 1000;
const ADDRESS_PATTERN = /^tp_[a-f0-9]{20}$/;
const initialSend = { wallet: "", amount: "", memo: "" };

export default function WalletPage() {
    const supabase = useMemo(() => createClient(), []);

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [sendForm, setSendForm] = useState(initialSend);
    const [copied, setCopied] = useState(false);
    // const [claiming, setClaiming] = useState(false);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [loadError, setLoadError] = useState("");
    const loadedOnce = useRef(false);


    const load = useCallback(async () => {
        try {
            const [walletRes, txRes] = await Promise.all([
                supabase.from("wallets").select("address, balance, last_claim_at").single(),
                supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
            ]);
            if (walletRes.error) throw walletRes.error;
            if (txRes.error) throw txRes.error;

            setWallet(walletRes.data);
            setTransactions(txRes.data);
            loadedOnce.current = true;
            setStatus("ready");
        } catch (error) {
            const message = friendlyError(error, "Couldn't load your wallet.");
            if (loadedOnce.current) toast.error(message); // already showing data: keep it, just warn
            else {
                setLoadError(message);
                setStatus("error");
            }
        }
    }, [supabase]);

    useEffect(() => {
        load();
    }, [load]);

    // const nextClaimAt = wallet?.last_claim_at
    //     ? new Date(wallet.last_claim_at).getTime() + COOLDOWN_MS
    //     : 0;
    // const onCooldown = nextClaimAt > Date.now();

    const payments = transactions.filter((t) => t.type === "payment");
    const statCards = [
        { header: "Total payments", value: payments.length },
        { header: "Successful payments", value: payments.filter((t) => t.status === "success").length },
        { header: "Failed payments", value: payments.filter((t) => t.status === "failed").length },
        { header: "Total test volume", value: `${payments.reduce((sum, t) => sum + Math.abs(t.amount), 0)} TC` },
    ];

    const q = search.trim().toLowerCase();
    const visibleTransactions = transactions.filter((t) => {
        if (filter !== "All" && t.type !== filter.toLowerCase()) return false;
        if (!q) return true;
        return [t.id, t.memo, t.counterparty, t.type, String(Math.abs(t.amount))].some((value) =>
            value?.toLowerCase().includes(q)
        );
    });
    async function handleCopy() {
        if (!wallet) return;
        try {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy. Please copy the address manually.");
        }
    }

    // async function handleClaim() {
    //     setClaiming(true);
    //     try {
    //         const { error } = await supabase.rpc("claim_faucet");
    //         if (error) {
    //             toast.error(error.message);
    //             return;
    //         }
    //         toast.success("1,000 TC added to your wallet.");
    //         await load();
    //     } finally {
    //         setClaiming(false);
    //     }
    // }

    function handleSendChange(event) {
        const { name, value } = event.target;
        setSendForm((prev) => ({ ...prev, [name]: value }));
    }

    // Returns an error message, or null when the form is valid
    function validateSend({ wallet: to, amount }) {
        const address = to.trim().toLowerCase();
        const value = Number(amount);

        if (!address) return "Enter the recipient's wallet address.";
        if (!ADDRESS_PATTERN.test(address)) return "Enter a valid wallet address (tp_ followed by 20 characters).";
        if (address === wallet?.address) return "You can't send TestCoin to your own wallet.";
        if (!amount) return "Enter an amount to send.";
        if (!Number.isInteger(value) || value < 1) return "Amount must be a whole number of at least 1.";
        if (wallet && value > wallet.balance) {
            return `Insufficient balance. You have ${wallet.balance.toLocaleString()} TC.`;
        }
        return null;
    }

    async function handleSend(event) {
        event.preventDefault();

        const problem = validateSend(sendForm);
        if (problem) {
            toast.error(problem);
            return;
        }

        const amount = Number(sendForm.amount);
        setSending(true);
        try {
            const { error } = await supabase.rpc("send_testcoin", {
                to_address: sendForm.wallet.trim().toLowerCase(),
                amount,
                memo: sendForm.memo.trim() || null,
            });
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success(`Sent ${amount.toLocaleString()} TC.`);
            setSendForm(initialSend);
            await load();
        } finally {
            setSending(false);
        }
    }

    if (status === "loading") return <PageLoader label="Loading your wallet..." />;
    if (status === "error") {
        return (
            <ErrorState
                title="Couldn't load your wallet"
                message={loadError}
                onRetry={() => {
                    setStatus("loading");
                    load();
                }}
            />
        );
    }

    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-8 lg:px-8">


            <section className="grid gap-6 lg:grid-cols-3">
                {/* Balance */}
                <div className="bg-grid relative overflow-hidden rounded-xl border border-border bg-card p-6 lg:col-span-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Balance</p>

                    <p className="mt-3 font-mono text-5xl font-bold tabular-nums text-primary md:text-6xl">
                        {wallet ? wallet.balance.toLocaleString() : "—"}
                        <span className="ml-2 text-lg text-muted-foreground">TC</span>
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCopy}
                            title="Click to copy"
                            className="rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs transition-colors hover:bg-accent cursor-pointer"
                        >
                            {copied ? "Copied!" : wallet?.address ?? "Loading..."}
                        </button>

                        <Link
                            href="/payments"
                            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            Request a payment →
                        </Link>
                    </div>
                </div>

                {/* Faucet */}
                <FaucetCard lastClaimAt={wallet?.last_claim_at} walletReady={Boolean(wallet)} onClaimed={load} />
            </section>

            {/* Stats */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.header} className="rounded-xl border bg-card p-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {stat.header}
                        </p>
                        <p className="mt-2 font-mono text-2xl font-bold tabular-nums">{stat.value}</p>
                    </div>
                ))}
            </section>

            <PaymentActivity />

            <section className="grid gap-6 lg:grid-cols-3">
                {/* Send form (controlled) */}
                <form onSubmit={handleSend} noValidate className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold">Send TestCoin</h2>

                    <Field
                        label="To wallet"
                        id="wallet"
                        type="text"
                        placeholder="tp_..."
                        required
                        value={sendForm.wallet}
                        onChange={handleSendChange}
                        className="font-mono"
                    />
                    <Field
                        label="Amount"
                        id="amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter amount"
                        required
                        value={sendForm.amount}
                        onChange={handleSendChange}
                        className="font-mono"
                    />
                    <Field
                        label="Note"
                        id="memo"
                        type="text"
                        maxLength={200}
                        placeholder="What's this transfer for?"
                        value={sendForm.memo}
                        onChange={handleSendChange}
                    />

                    <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </form>

                {/* Ledger */}
                <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
                        <h2 className="mr-auto font-semibold">Ledger</h2>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search ID, amount, note..."
                            className="h-8 w-44 rounded-md border border-input bg-background px-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
                        />

                        {LEDGER_FILTERS.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setFilter(name)}
                                className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors ${filter === name
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <ul className="divide-y divide-border">
                        {visibleTransactions.length === 0 ? (
                            <li className="p-8 text-center text-sm text-muted-foreground">
                                No transactions yet — claim from the faucet to start.
                            </li>
                        ) : (
                            visibleTransactions.map((tx) => (
                                <li key={tx.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-medium capitalize">{tx.type}</p>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {shortId(tx.id)} · {tx.memo || tx.counterparty || "—"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-semibold ${amountColor(tx.amount)}`}>
                                            {formatAmount(tx.amount)} TC
                                        </p>
                                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                                        {tx.type !== "faucet" && (
                                            <ViewButton id={tx.id} note={tx.memo} />
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </section>
        </main>
    );
}