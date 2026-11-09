export default function Field({ label, id, className = "", ...props }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium">{label}</label>
            <input
                id={id}
                name={id}
                className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                {...props}
            />
        </div>
    );
}