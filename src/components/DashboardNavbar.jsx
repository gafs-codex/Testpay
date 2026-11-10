"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const links = [
    { href: "/wallet", label: "Wallet" },
    { href: "/card", label: "Card" },
    { href: "/payments", label: "Payments" },
    { href: "/developers", label: "Developers" },
    { href: "/docs", label: "Docs" },
    { href: "/explorer", label: "Explorer" }, // ✅ Fixed — was /explore
];

export default function DashboardNavbar({ email }) {

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        setIsLoggingOut(true);

        const { error } = await supabase.auth.signOut();

        if (error) {
            toast.error("Unable to sign out. Please try again.");
            setIsLoggingOut(false);
            return;
        }

        router.replace("/");
        router.refresh();
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
                <nav className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setShowLogoutDialog(true)}
                        className="font-mono text-xl font-bold text-foreground"
                    >
                        testpay<span className="text-primary animate-blink">_</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-5">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        isActive
                                            ? "text-sm font-medium text-foreground"
                                            : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    }
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-muted-foreground lg:block">
                            {email}
                        </span>

                        {/* ✅ Fixed — real signout instead of broken /logout link */}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent cursor-pointer"
                        >
                            Sign out
                        </button>
                    </div>
                </nav>
            </header>

            {
                showLogoutDialog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="logout-title"
                            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
                        >
                            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
                            // leave testpay
                            </p>

                            <h2
                                id="logout-title"
                                className="text-lg font-semibold text-foreground"
                            >
                                Are you sure you want to leave?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                You will be signed out of your TestPay account and redirected
                                to the landing page.
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    disabled={isLoggingOut}
                                    onClick={() => setShowLogoutDialog(false)}
                                    className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground transition hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={isLoggingOut}
                                    onClick={handleLogout}
                                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isLoggingOut ? "Signing out..." : "Yes, sign out"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}