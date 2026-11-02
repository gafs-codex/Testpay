
"use client";

import { useState } from "react";

export default function ExplorerPage() {
    const [transactionId, setTransactionId] = useState("");
    const [searched, setSearched] = useState(false);

    function handleLookup(event) {
        event.preventDefault();

        if (!transactionId.trim()) return;

        setSearched(true);
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="bg-grid border-b border-border">
                <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
                    <p className="font-mono text-xs text-primary">
                        $ testpay explore
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Transaction explorer
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                        Look up a TestPay transaction to inspect its status,
                        amount, checkout details, and payment activity.
                    </p>

                    <form
                        onSubmit={handleLookup}
                        className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row"
                    >
                        <input
                            value={transactionId}
                            onChange={(event) => {
                                setTransactionId(event.target.value);
                                setSearched(false);
                            }}
                            type="text"
                            placeholder="Enter a transaction ID..."
                            className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-card px-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                        />

                        <button
                            type="submit"
                            className="h-12 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:brightness-110 cursor-pointer"
                        >
                            Look up transaction
                        </button>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Transaction details
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Payment information will appear here after a lookup.
                        </p>
                    </div>

                    <span className="w-fit rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        TEST MODE
                    </span>
                </div>

                <div className="mt-6 rounded-xl border border-border bg-card p-8 md:p-12">
                    {searched ? (
                        <div>
                            <p className="font-mono text-xs text-primary">
                                $ testpay transaction --inspect
                            </p>

                            <h3 className="mt-4 text-lg font-semibold">
                                Lookup submitted
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Transaction ID:
                            </p>

                            <p className="mt-1 break-all font-mono text-sm">
                                {transactionId}
                            </p>

                            <p className="mt-4 text-sm text-warning">
                                Connect your TestPay API to retrieve the real transaction details.
                            </p>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="font-mono text-sm text-primary">
                                {"{ }"}
                            </p>

                            <h3 className="mt-4 text-lg font-medium">
                                No transaction selected
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                Enter a transaction ID above to get started.
                                Transaction status, amount, and other details
                                will be displayed here when the API is connected.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
