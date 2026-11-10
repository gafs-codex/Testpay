"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PaymentActivity from "@/components/PaymentActivity";
import Field from "@/components/Field";
import { createClient } from "@/lib/supabase/client";
import { formatAmount, amountColor } from "@/lib/format";

const LEDGER_FILTERS = ["All", "Faucet", "Payment", "Transfer"];
const COOLDOWN_MS = 6 * 60 * 60 * 1000;
const ADDRESS_PATTERN = /^tp_[a-f0-9]{20}$/;
const initialSend = { wallet: "", amount: "", memo: "" };

export default function WalletPage() {
    const supabase = useMemo(() => createClient(), []);

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [sendForm, setSendForm] = useState(initialSend);
    const [copied, setCopied] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        const [walletRes, txRes] = await Promise.all([
            supabase.from("wallets").select("address, balance, last_claim_at").single(),
            supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
        ]);

        if (walletRes.error || txRes.error) {
            toast.error("Couldn't load your wallet. Please refresh the page.");
            return;
        }
        setWallet(walletRes.data);
        setTransactions(txRes.data);
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
        try {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy. Please copy the address manually.");
        }
    }

    async function handleClaim() {
        setClaiming(true);
        try {
            const { error } = await supabase.rpc("claim_faucet");
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success("1,000 TC added to your wallet.");
            await load();
        } finally {
            setClaiming(false);
        }
    }

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


                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs mt-3 w-full">
                        ↑ Request limit increase
                    </button>

                    <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
                        Current limit: 1,000  TC · Every 6  hours
                    </p>
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
                                        <p className={`font-mono font-semibold ${amountColor(tx.amount)}`}>
                                            {formatAmount(tx.amount)} TC
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