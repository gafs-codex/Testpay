export default function DocsPage() {
    return (
        <main className="mx-auto max-w-3xl space-y-10 px-4 py-16">
            <header className="mb-10">
                <p className="font-mono text-xs text-primary">
                    $ testpay docs
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                    Integrate TestPay
                </h1>

                <p className="mt-3 text-muted-foreground">
                    Accept TestCoin in any app with the classic flow:
                    <b>create payment → redirect to checkout → receive webhook</b>.
                </p>
            </header>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">
                    1. Get an API key
                </h2>

                <p className="text-sm text-muted-foreground">
                    Create one on the Developers page. Keep it on your server. Base URL:
                </p>

                <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed">
                    https://id-preview--04b68f83-e3f5-476d-acf7-5084dc07d790.lovable.app/api/public/v1
                </pre>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">
                    Endpoints
                </h2>

                <div className="divide-y rounded-lg border">
                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">POST</span>
                        <code className="font-mono text-sm">/payments</code>
                        <span className="text-sm text-muted-foreground">Create a payment → returns checkout_url</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">GET</span>
                        <code className="font-mono text-sm">/payments</code>
                        <span className="text-sm text-muted-foreground">List your latest 50 payments</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">GET</span>
                        <code className="font-mono text-sm">/payments/:id</code>
                        <span className="text-sm text-muted-foreground">Get payment status</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">POST</span>
                        <code className="font-mono text-sm">/payments/:id/pay</code>
                        <span className="text-sm text-muted-foreground">Pay a payment from the key owner's wallet</span>
                    </div>


                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">GET</span>
                        <code className="font-mono text-sm">/wallet</code>
                        <span className="text-sm text-muted-foreground">Balance, address + 10 recent transactions</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">POST</span>
                        <code className="font-mono text-sm">/transfers</code>
                        <span className="text-sm text-muted-foreground">Send TestCoin to an address {`to, amount, description?`}</span>
                    </div>``

                    <div className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                        <span className="w-12 font-mono text-xs font-bold text-primary">GET</span>
                        <code className="font-mono text-sm">/transactions?page=&limit=</code>
                        <span className="text-sm text-muted-foreground">Paginated ledger</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    All requests:
                    <code className="font-mono">Authorization: Bearer tp_sk_…</code>
                    . Errors return
                    <code></code>
                </p>
            </section>
        </main>
    )
}