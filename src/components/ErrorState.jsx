export default function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
    retryLabel = "Try again",
    className = "min-h-[50vh]",
}) {
    return (
        <div role="alert" className={`flex flex-col items-center justify-center gap-3 px-6 text-center ${className}`}>
            <p className="font-mono text-sm text-destructive">{"{ error }"}</p>
            <h2 className="text-lg font-semibold">{title}</h2>
            {message && <p className="max-w-md text-sm text-muted-foreground">{message}</p>}
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );
}