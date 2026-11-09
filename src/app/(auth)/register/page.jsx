"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleGoogleSignUp() {
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
            setError("Unable to sign up with Google. Please try again.");
            console.error("Google sign-up error:", err);
            setIsGoogleLoading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                    data: {
                        display_name: trimmedName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/wallet`,
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            // If email confirmation is disabled, Supabase may create a session immediately.
            if (data.session) {
                router.push("/wallet");
                router.refresh();
                return;
            }

            // If email confirmation is enabled, the user must confirm their email first.
            setSuccess(
                "Your account has been created! Please check your email to confirm your account before signing in."
            );
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    function clearRegistrationForm() {
        setName("");
        setEmail("");
        setPassword("");
        setError("");
        setSuccess("");
    }

    return (
        <main className="bg-grid flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-glow sm:p-8">
                <p className="font-mono text-xs text-primary">
                    $ testpay signup
                </p>

                <h1 className="mt-2 text-2xl font-semibold">
                    Create your test wallet
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Create an account to start testing payment flows.
                </p>

                <button
                    type="button"
                    onClick={handleGoogleSignUp}
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
                        <label htmlFor="name" className="text-sm font-medium">
                            Display name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            maxLength={60}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Your display name"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

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
                            maxLength={254}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={60}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="At least 8 characters"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p role="status" className="text-sm text-primary">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <div className="mt-6 flex flex-wrap gap-1 text-xs text-muted-foreground">
                    Have an account?
                    <Link
                        href="/login"
                        onClick={clearRegistrationForm}
                        className="hover:text-foreground hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </main>
    );
}