"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PaymentActivity from "@/components/PaymentActivity";
import Field from "@/components/Field";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const LEDGER_FILTERS = ["All", "Faucet", "Payment", "Transfer"];
const COOLDOWN_MS = 6 * 60 * 60 * 1000;
const initialSend = { wallet: "", amount: "", memo: "" };

export default function WalletPage() {
    const supabase = useMemo(() => createClient(), []);

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [sendForm, setSendForm] = useState(initialSend);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [copied, setCopied] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        const [walletRes, txRes] = await Promise.all([
            supabase.from("wallets").select("address, balance, last_claim_at").single(),
            supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
        ]);
        if (walletRes.data) setWallet(walletRes.data);
        if (txRes.data) setTransactions(txRes.data);
    }, [supabase]);

    useEffect(() => {
        load();
    }, [load]);

    const nextClaimAt = wallet?.last_claim_at
        ? new Date(wallet.last_claim_at).getTime() + COOLDOWN_MS
        : 0;
    const onCooldown = nextClaimAt > Date.now();

    const payments = transactions.filter((t) => t.type === "payment");
    const statCards = [
        { header: "Total payments", value: payments.length },
        { header: "Successful payments", value: payments.filter((t) => t.status === "success").length },
        { header: "Failed payments", value: payments.filter((t) => t.status === "failed").length },
        { header: "Total test volume", value: `${payments.reduce((sum, t) => sum + Math.abs(t.amount), 0)} TC` },
    ];

    const visibleTransactions =
        filter === "All"
            ? transactions
            : transactions.filter((t) => t.type === filter.toLowerCase());

    async function handleCopy() {
        if (!wallet) return;
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleClaim() {
        setMessage({ type: "", text: "" });
        setClaiming(true);
        const { error } = await supabase.rpc("claim_faucet");
        setClaiming(false);

        if (error) {
            setMessage({ type: "error", text: error.message });
            return;
        }
        // setMessage({ type: "success", text: "1,000 TC added to your wallet." });
        toast.success("1,000 TC added to your wallet.");
        await load();
    }

    function handleSendChange(event) {
        const { name, value } = event.target;
        setSendForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSend(event) {
        event.preventDefault();
        setMessage({ type: "", text: "" });

        const to = sendForm.wallet.trim();
        const amount = Number(sendForm.amount);

        if (!to.startsWith("tp_")) {
            setMessage({ type: "error", text: "Wallet addresses start with tp_." });
            return;
        }
        if (!Number.isInteger(amount) || amount < 1) {
            setMessage({ type: "error", text: "Enter a whole amount of at least 1." });
            return;
        }

        setSending(true);
        const { error } = await supabase.rpc("send_testcoin", {
            to_address: to,
            amount,
            memo: sendForm.memo.trim() || null,
        });
        setSending(false);

        if (error) {
            setMessage({ type: "error", text: error.message });
            return;
        }
        setSendForm(initialSend);
        setMessage({ type: "success", text: `Sent ${amount} TC.` });
        await load();
    }

    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-8 lg:px-8">
            {message.text && (
                <p
                    role={message.type === "error" ? "alert" : "status"}
                    className={`rounded-md border px-4 py-3 text-sm ${message.type === "error"
                        ? "border-destructive/40 text-destructive"
                        : "border-primary/40 text-primary"
                        }`}
                >
                    {message.text}
                </p>
            )}

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
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Faucet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Claim 1,000 free TestCoin every 6 hours.
                        </p>
                        {onCooldown && (
                            <p className="mt-2 font-mono text-xs text-muted-foreground">
                                Next claim: {new Date(nextClaimAt).toLocaleTimeString()}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleClaim}
                        disabled={claiming || !wallet || onCooldown}
                        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        {claiming ? "Claiming..." : "Claim 1,000 TestCoin"}
                    </button>
                </div>
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

            <PaymentActivity payments={payments} />

            <section className="grid gap-6 lg:grid-cols-3">
                {/* Send form (controlled) */}
                <form onSubmit={handleSend} className="space-y-4 rounded-xl border border-border bg-card p-6">
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
                                            {tx.memo || tx.counterparty || "—"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-semibold ${tx.amount > 0 ? "text-primary" : ""}`}>
                                            {tx.amount > 0 ? "+" : ""}{tx.amount} TC
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </p>
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