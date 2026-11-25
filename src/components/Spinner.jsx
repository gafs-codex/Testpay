export default function Spinner({ className = "size-6" }) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={`inline-block animate-spin rounded-full border-2 border-primary/25 border-t-primary ${className}`}
        />
    );
}

export function PageLoader({ label = "Loading...", className = "min-h-[50vh]" }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Spinner className="size-8" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
    );
}