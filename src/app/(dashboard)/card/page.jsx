"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    ShieldCheckIcon, CreditCard, Eye, EyeOff, Snowflake, Copy, Wallet,
    ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatAmount, amountColor } from "@/lib/format";

const actionBtn =
    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const groupDigits = (number) => number.replace(/(.{4})/g, "$1 ").trim();

export default function Card() {
    const supabase = useMemo(() => createClient(), []);

    const [card, setCard] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [revealed, setRevealed] = useState(false);
    const [frozen, setFrozen] = useState(false); // local demo control only

    useEffect(() => {
        async function load() {
            const [cardRes, walletRes, txRes] = await Promise.all([
                supabase.from("cards").select("number, cvc, exp_month, exp_year").single(),
                supabase.from("wallets").select("balance, display_name").single(),
                supabase
                    .from("transactions")
                    .select("id, type, amount, memo, counterparty, created_at")
                    .order("created_at", { ascending: false })
                    .limit(5),
            ]);

            if (cardRes.error || walletRes.error || txRes.error) {
                toast.error("Couldn't load your card. Please refresh the page.");
                return;
            }
            setCard(cardRes.data);
            setWallet(walletRes.data);
            setTransactions(txRes.data);
        }
        load();
    }, [supabase]);

    const expiry = card
        ? `${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year).slice(-2)}`
        : "--/--";
    const maskedNumber = card ? `•••• •••• •••• ${card.number.slice(-4)}` : "•••• •••• •••• ••••";
    const displayNumber = card && revealed ? groupDigits(card.number) : maskedNumber;
    const cardholder = (wallet?.display_name ?? "").toUpperCase();

    async function handleCopy() {
        if (!card) return;
        try {
            await navigator.clipboard.writeText(
                `Number: ${groupDigits(card.number)}\nExpires: ${expiry}\nCVC: ${card.cvc}`
            );
            toast.success("Demo card details copied.");
        } catch {
            toast.error("Couldn't copy. Please copy the details manually.");
        }
    }

    function handleActivity() {
        document.getElementById("recent-activity")?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">$ testpay cards</p>
                    <h1 className="mt-2 text-3xl font-semibold">Virtual card</h1>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                        A demo card view for testing payment experiences. It is not a real bank card.
                    </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <ShieldCheckIcon width={24} height={24} className="text-primary" />
                    Test environment
                </div>
            </header>

            <section
                aria-label="TestPay demo virtual card"
                className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]"
            >
                {/* Card face */}
                <div
                    className={`bg-grid relative isolate flex aspect-[1.68/1] min-h-56 flex-col justify-between overflow-hidden rounded-xl border border-primary/30 bg-card p-5 shadow-glow transition sm:p-8 ${
                        frozen ? "opacity-60 grayscale" : ""
                    }`}
                >
                    <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border border-primary/20 bg-primary/5" />
                    <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full border border-primary/15" />

                    <div className="relative flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-primary sm:text-xs">
                            <CreditCard className="size-4" />
                            {frozen ? "Frozen" : "Virtual card"}
                        </span>

                        <div className="flex flex-col items-end gap-1.5">
                            <span className="font-mono text-sm font-bold uppercase text-foreground sm:text-base">
                                testpay<span className="text-primary">_</span>
                            </span>
                            <span className="rounded border border-destructive/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-destructive">
                                Demo only
                            </span>
                        </div>
                    </div>

                    <div className="relative space-y-3">
                        <p className="font-mono text-lg tracking-wider text-foreground sm:text-2xl">
                            {displayNumber}
                        </p>

                        <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0 max-w-[55%]">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Cardholder</p>
                                <p className="mt-1 truncate text-xs font-medium tracking-wide sm:text-sm">
                                    {cardholder || "—"}
                                </p>
                            </div>

                            <div className="flex shrink-0 gap-6 text-right">
                                <div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Expires</p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm">{expiry}</p>
                                </div>
                                <div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">CVC</p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm">
                                        {card && revealed ? card.cvc : "•••"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance + actions */}
                <div className="flex flex-col justify-between gap-5 border-y py-5 lg:border-y-0 lg:border-l lg:py-2 lg:pl-6">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            Available test balance
                        </p>
                        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-primary">
                            {wallet ? wallet.balance.toLocaleString() : "—"}
                            <span className="ml-2 text-lg text-muted-foreground">TC</span>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Your wallet balance updates as test transactions are recorded.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" className={actionBtn} disabled={!card} onClick={() => setRevealed((v) => !v)}>
                            {revealed ? <EyeOff /> : <Eye />}
                            {revealed ? "Hide" : "Details"}
                        </button>
                        <button type="button" className={actionBtn} onClick={() => setFrozen((v) => !v)}>
                            <Snowflake />
                            {frozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button type="button" className={actionBtn} disabled={!card} onClick={handleCopy}>
                            <Copy />
                            Copy demo
                        </button>
                        <button type="button" className={actionBtn} onClick={handleActivity}>
                            <Wallet />
                            Activity
                        </button>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Freeze is a local demo control only; it does not lock your wallet or stop transactions.
                    </p>
                </div>
            </section>

            {/* Recent activity */}
            <section id="recent-activity" className="scroll-mt-24">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-semibold">Recent activity</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Latest transactions from your TestPay wallet
                        </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {transactions.length} recent
                    </span>
                </div>

                <div className="divide-y rounded-lg border bg-card">
                    {transactions.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
                    ) : (
                        transactions.map((tx) => {
                            const outgoing = tx.amount < 0;
                            return (
                                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                                    <span
                                        className={`grid size-9 shrink-0 place-items-center rounded-full ${
                                            outgoing ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                        }`}
                                    >
                                        {outgoing ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium capitalize">
                                            {tx.memo || tx.type}
                                        </p>
                                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                            {tx.type} · {new Date(tx.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <p className={`shrink-0 font-mono text-sm tabular-nums ${amountColor(tx.amount)}`}>
                                        {formatAmount(tx.amount)}{" "}
                                        <span className="text-xs text-muted-foreground">TC</span>
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </main>
    );
}