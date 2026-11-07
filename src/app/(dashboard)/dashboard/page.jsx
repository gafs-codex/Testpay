"use client";
import Link from "next/link";
import PaymentActivity from "@/components/PaymentActivity";

const ledgerFilters = ["All", "Faucet", "Payment", "Transfer"];

const statCards = [
    { header: "Total payments", value: 0 },
    { header: "Successful payments", value: 0 },
    { header: "Failed payments", value: 0 },
    { header: "Total test volume", value: `${0} TC` }
]

const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";


export default function Dashboard() {
    return (
        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-8 lg:px-8">

            {/* Balance and Faucet */}
            <section className="grid gap-6 lg:grid-cols-3">

                {/* Wallet Balance */}
                <div className="bg-grid relative overflow-hidden rounded-xl border border-border bg-card p-6 lg:col-span-2">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        Balance
                    </p>

                    <p className="mt-3 font-mono text-5xl font-bold tabular-nums text-primary md:text-6xl">
                        0
                        <span className="ml-2 text-lg text-muted-foreground">
                            TC
                        </span>
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <code className="rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs">
                            tp_e52964cbb9e89c74d10a
                        </code>

                        <Link
                            href="/payments/new"
                            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            Request a payment →
                        </Link>
                    </div>
                </div>

                {/* Faucet */}
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            Faucet
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Claim 1,000 free TestCoin every 6 hours.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
                    >
                        Claim 1,000 TestCoin
                    </button>
                </div>
            </section>

            {/* Send TestCoin and Ledger */}

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    return <div
                        key={stat}
                        className="rounded-xl border bg-card p-4"
                    >
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {stat.header}
                        </p>
                        <p className="mt-2 font-mono text-2xl font-bold tabular">
                            {stat.value}
                        </p>
                    </div>
                })}
            </section>


            <PaymentActivity />

            <section className="grid gap-6 lg:grid-cols-3">

                {/* Send TestCoin Form */}
                <form className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold">
                        Send TestCoin
                    </h2>

                    <div className="space-y-1.5">
                        <label htmlFor="wallet" className="text-sm font-medium">
                            To wallet
                        </label>

                        <input
                            id="wallet"
                            name="wallet"
                            type="text"
                            placeholder="tp_..."
                            required
                            className={`${inputClass} font-mono`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="amount" className="text-sm font-medium">
                            Amount
                        </label>

                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter amount"
                            required
                            className={`${inputClass} font-mono`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="memo" className="text-sm font-medium">
                            Note
                        </label>

                        <input
                            id="memo"
                            name="memo"
                            type="text"
                            maxLength={200}
                            placeholder="What's this transfer for?"
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                        Send
                    </button>
                </form>

                {/* Transaction Ledger */}
                <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">

                    {/* Ledger Header */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
                        <h2 className="mr-auto font-semibold">
                            Ledger
                        </h2>

                        <div className="flex flex-wrap items-center gap-2">
                            {ledgerFilters.map((filter, index) => (
                                <button
                                    key={filter}
                                    type="button"
                                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors ${index === 0
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary"
                            >
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Transactions */}
                    <ul className="divide-y divide-border">
                        <li className="p-8 text-center text-sm text-muted-foreground">
                            No transactions yet — claim from the faucet to start.
                        </li>
                    </ul>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-border p-3 text-xs text-muted-foreground">
                        <span>Page 1 / 1</span>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled
                                className="rounded-md px-3 py-2 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Prev
                            </button>

                            <button
                                type="button"
                                disabled
                                className="rounded-md px-3 py-2 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}