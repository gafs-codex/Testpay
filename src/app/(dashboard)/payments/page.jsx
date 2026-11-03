export default function Payments() {
    return (
        <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-10 lg:grid-cols-3 lg:px-8">
            <form className="space-y-4 rounded-xl border bg-card p-6">
                <h1 className="text-lg font-semibold">
                    New payment
                </h1>

                <div className="space-y-1.5">
                    <label
                        htmlFor="amount"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Amount (TestCoin)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        placeholder="250"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="description"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        placeholder="Pro plan — 1 month"
                        maxLength={500}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="success_url"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Success URL (optional)
                    </label>
                    <input
                        type="text"
                        id="success_url"
                        placeholder="https://myapp.dev/thanks"
                        maxLength={2000}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="cancel_url"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Cancel URL (optional)
                    </label>
                    <input
                        type="text"
                        id="cancel_url"
                        placeholder="https://myapp.dev/cart"
                        maxLength={2000}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="webhook_url"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Webhook URL (optional)
                    </label>
                    <input
                        type="text"
                        id="webhook_url"
                        placeholder="https://myapp.dev/api/testpay"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                >
                    Create payment link
                </button>
            </form>

            <section className="rounded-xl border bg-card lg:col-span-2">
                <h2 className="border-b p-4 font-semibold">
                    Recent payments
                </h2>

                <ul className="divide-y">
                    <li className="p-8 text-center text-sm text-muted-foreground">
                        No payments yet.
                    </li>
                </ul>
            </section>
        </main>
    )
}