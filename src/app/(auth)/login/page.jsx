
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: loginError } =
                await supabase.auth.signInWithPassword({
                    email: trimmedEmail,
                    password,
                });

            if (loginError) {
                setError(loginError.message);
                return;
            }

            router.push("/wallet");
            router.refresh();
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Login error:", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGoogleSignIn() {
        setError("");
        setIsGoogleLoading(true);

        try {
            const { error: googleError } =
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback?next=/wallet`,
                    },
                });

            if (googleError) {
                setError(googleError.message);
                setIsGoogleLoading(false);
            }
        } catch (err) {
            setError("Unable to sign in with Google. Please try again.");
            console.error("Google sign-in error:", err);
            setIsGoogleLoading(false);
        }
    }

    return (
        <main className="bg-grid flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-glow sm:p-8">
                <p className="font-mono text-xs text-primary">
                    $ testpay signin
                </p>

                <h1 className="mt-2 text-2xl font-semibold">
                    Welcome back
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to manage your TestPay wallet and payments.
                </p>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isSubmitting}
                    className="mt-6 inline-flex h-10 w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FcGoogle size={20} />
                    {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
                </button>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or continue with email
                    <span className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isGoogleLoading}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="mt-6 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
                    <Link
                        href="/register"
                        className="hover:text-foreground"
                    >
                        Create account
                    </Link>

                    <Link
                        href="/forgot-password"
                        className="hover:text-foreground"
                    >
                        Forgot password?
                    </Link>
                </div>
            </div>
        </main>
    );
}
