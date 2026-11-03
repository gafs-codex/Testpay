import Link from "next/link"

export default function Developer() {
    return (
        <main className="mx-auto w-[80%] max-w-[1440px] space-y-6 px-6 py-8 lg:px-8">
            <div className="flex items-end justify-between">
                <h1 className="text-2xl font-semibold">Developers</h1>

                <Link
                    href={`/docs`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary underline-offset-4 hover:underline h-9 px-4 py-2"
                >
                    Read the docs →
                </Link>
            </div>

            <section className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold">API keys</h2>
                <p className="mt-1 text-sm text-muted-foreground">Use these from your server as </p>
                <code className="font-mono text-primary">
                    Authorization: Bearer tp_sk_…
                </code>

                <form className="mt-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Key name, e.g. portfolio-shop"
                        maxLength={60}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />

                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        Create key
                    </button>
                </form>

                <ul className="mt-4 divide-y rounded-lg border">
                    <li className="p-4 text-sm text-muted-foreground">
                        No keys yet.
                    </li>
                </ul>
            </section>

            <section className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold">Webhook signing secret</h2>
                <p className="mt-1 text-sm text-muted-foreground"></p>
                <div className="mt-3 flex gap-2">
                    <code className="flex-1 truncate rounded bg-background px-3 py-2 font-mono text-xs">
                        whsec_••••••••••••••••••••
                    </code>

                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs">
                        Reveal
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                        Copy
                    </button>
                </div>
            </section>

            <form className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
                <h2 className="font-semibold sm:col-span-2">
                    Profile
                </h2>

                <div className="space-y-1.5">
                    <label htmlFor="dn" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Display name
                    </label>
                    <input
                        type="text"
                        id="dn"
                        value="gaf_muiz"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="mn" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Merchant name (shown at checkout)
                    </label>
                    <input
                        type="text"
                        id="mn"
                        value="gaf_muiz"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        Save profile
                    </button>
                </div>
            </form>
        </main>
    )
}