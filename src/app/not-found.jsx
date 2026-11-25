import Link from "next/link";

export default function NotFound() {
    return (
        <main className="bg-grid grid min-h-dvh place-items-center px-6 text-center">
            <div>
                <p className="font-mono text-xs text-primary">$ testpay 404</p>
                <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
                <p className="mt-3 text-sm text-muted-foreground">That page doesn't exist or has moved.</p>
                <Link
                    href="/"
                    className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
                >
                    Back to home
                </Link>
            </div>
        </main>
    );
}