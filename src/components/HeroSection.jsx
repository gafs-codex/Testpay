import Link from "next/link";

export default function HeroSection() {
    const spanThree = `-d '{"amount": 250, "description": "Pro plan"}'`;
    const spanWord = [
        "$ curl -X POST /api/public/v1/payments \\",
        '  -H "Authorization: Bearer tp_sk_…" \\',
        `  ${spanThree}`,
    ];


    const steps = [
        { id: "01", header: "Sign up", text: "You get a wallet with its own address, instantly." },
        { id: "02", header: "Claim TestCoin", text: "Tap the faucet for 1,000 TC every 6 hours." },
        { id: "03", header: "Create a payment", text: "From the dashboard or one API call from your server." },
        { id: "04", header: "Get the webhook", text: "A signed payment.succeeded event hits your app." }
    ]


    return (
        <>
            <section className="bg-grid border-b border-border">
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2">
                    {/* Left column */}
                    <div>
                        <p className="font-mono text-xs text-primary">
            // stripe test mode, but it's yours
                        </p>

                        <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                            Fake money.
                            <br />
                            Real payment flows.
                        </h1>

                        <p className="mt-6 max-w-md text-lg text-muted-foreground">
                            Give your portfolio apps a working checkout. Wallets, a faucet,
                            payment links, webhooks and a clean REST API — all in TestCoin.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/signup"
                                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 font-sans"
                            >
                                Claim 1,000 TestCoin
                            </Link>

                            <Link
                                href="/docs"
                                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground"
                            >
                                Read the docs
                            </Link>
                        </div>
                    </div>

                    {/* Right column: API terminal */}
                    <div className="rounded-xl border border-border bg-card p-6 font-mono text-xs leading-relaxed shadow-glow md:p-8">
                        <div className="space-y-1 text-muted-foreground">
                            {spanWord.map((word, index) => (
                                <div key={index} className="break-words">
                                    {word}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-foreground">
                            {"{"}
                            <div className="pl-4">
                                <p>
                                    "id": <span className="text-primary">"3f9c…"</span>,
                                </p>
                                <p>
                                    "status": <span className="text-warning">"pending"</span>,
                                </p>
                                <p>
                                    "amount": <span className="text-primary">250</span>,
                                </p>
                                <p>
                                    "checkout_url": (
                                    <span className="text-primary">"https://…/pay/3f9c…"</span>
                                    )
                                </p>
                            </div>
                            {"}"}
                        </div>

                        <p className="mt-6 text-primary">
                            → webhook&nbsp; payment.succeeded&nbsp; 200 OK
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 py-20 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step) => {
                    return <div
                        key={step.id}
                        className="border-l p-6"
                    >
                        <p className="font-mono text-xs text-primary">{step.id}</p>
                        <h3 className="mt-3 font-semibold">{step.header}</h3>
                        <p className="mt-2 text-sm text-muted-foreground font-sans">{step.text}</p>
                    </div>
                })}
            </section>

            <footer className="border-t py-8 text-center font-mono text-xs text-muted-foreground">
                TestPay · test money only · no real funds are ever moved
            </footer>
        </>
    );
}
