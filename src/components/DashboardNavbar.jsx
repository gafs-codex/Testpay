import Link from "next/link";

const links = [
    { href: "/wallet", label: "Wallet" },
    { href: "/payments", label: "Payments" },
    { href: "/developers", label: "Developers" },
    { href: "/docs", label: "Docs" },
    { href: "/explore", label: "Explorer" },
];

export default function DashboardNavbar({ email }) {
    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6 lg:px-8">
                <Link href="/dashboard" className="font-mono text-lg font-bold">
                    testpay<span className="text-primary animate-blink">_</span>
                </Link>

                <div className="flex flex-wrap items-center gap-5">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <span className="hidden text-sm text-muted-foreground lg:block">
                        {email}
                    </span>

                    <Link
                        href="/logout"
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                        Sign out
                    </Link>
                </div>
            </nav>
        </header>
    );
}