"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { createClient } from "@/lib/supabase/client";
import { shortId, statusClass } from "@/lib/format";

const FILTERS = ["all", "pending", "paid", "canceled"];
const initialForm = { amount: "", description: "", success_url: "", cancel_url: "", webhook_url: "" };

function isValidUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export default function Payments() {
    const supabase = useMemo(() => createClient(), []);

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        const { data, error } = await supabase
            .from("payments")
            .select("id, amount, description, status, created_at")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) toast.error("Couldn't load your payments. Please refresh the page.");
        else setPayments(data);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        load();
    }, [load]);

    const visible = filter === "all" ? payments : payments.filter((p) => p.status === filter);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    function validate() {
        const next = {};
        const amount = Number(form.amount);
        if (!Number.isInteger(amount) || amount < 1) next.amount = "Enter a whole amount of at least 1.";
        ["success_url", "cancel_url", "webhook_url"].forEach((field) => {
            const value = form[field].trim();
            if (value && !isValidUrl(value)) next[field] = "Enter a valid http(s) URL.";
        });
        return next;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const found = validate();
        if (Object.keys(found).length > 0) {
            setErrors(found);
            return;
        }

        setCreating(true);
        try {
            const { error } = await supabase.rpc("create_payment", {
                p_amount: Number(form.amount),
                p_description: form.description.trim() || null,
                p_success_url: form.success_url.trim() || null,
                p_cancel_url: form.cancel_url.trim() || null,
                p_webhook_url: form.webhook_url.trim() || null,
            });
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success("Payment link created. Open it from Recent payments.");
            setForm(initialForm);
            await load();
        } finally {
            setCreating(false);
        }
    }

    async function handleCancel(id) {
        const { error } = await supabase.rpc("cancel_payment", { p_id: id });
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success("Payment canceled.");
        await load();
    }

    const error = (name) =>
        errors[name] && <p role="alert" className="text-xs text-destructive">{errors[name]}</p>;

    return (
        <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-10 lg:grid-cols-3 lg:px-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4 self-start rounded-xl border bg-card p-6">
                <h1 className="text-lg font-semibold">New payment</h1>

                <div>
                    <Field label="Amount (TestCoin)" id="amount" type="number" min="1" step="1"
                        placeholder="250" value={form.amount} onChange={handleChange} className="font-mono" />
                    {error("amount")}
                </div>
                <div>
                    <Field label="Description" id="description" type="text" maxLength={500}
                        placeholder="Pro plan — 1 month" value={form.description} onChange={handleChange} />
                </div>
                <div>
                    <Field label="Success URL (optional)" id="success_url" type="url" maxLength={2000}
                        placeholder="https://myapp.dev/thanks" value={form.success_url} onChange={handleChange} />
                    {error("success_url")}
                </div>
                <div>
                    <Field label="Cancel URL (optional)" id="cancel_url" type="url" maxLength={2000}
                        placeholder="https://myapp.dev/cart" value={form.cancel_url} onChange={handleChange} />
                    {error("cancel_url")}
                </div>
                <div>
                    <Field label="Webhook URL (optional)" id="webhook_url" type="url" maxLength={2000}
                        placeholder="https://myapp.dev/api/testpay" value={form.webhook_url} onChange={handleChange} />
                    {error("webhook_url")}
                </div>

                <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {creating ? "Creating..." : "Create payment link"}
                </button>
            </form>

            <section className="rounded-xl border bg-card lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2 border-b p-4">
                    <h2 className="mr-auto font-semibold">Recent payments</h2>
                    {FILTERS.map((name) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => setFilter(name)}
                            className={`inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-3 text-xs font-medium transition-colors ${filter === name
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <ul className="divide-y">
                    {loading ? (
                        <li className="p-8 text-center text-sm text-muted-foreground">Loading...</li>
                    ) : visible.length === 0 ? (
                        <li className="p-8 text-center text-sm text-muted-foreground">No payments yet.</li>
                    ) : (
                        visible.map((p) => (
                            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                                <span className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass(p.status)}`}>
                                    {p.status}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{p.description || "Untitled payment"}</p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {shortId(p.id)} · {new Date(p.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <p className="font-mono text-sm font-semibold tabular-nums">
                                    {p.amount.toLocaleString()} <span className="text-xs text-muted-foreground">TC</span>
                                </p>

                                {p.status === "pending" && (
                                    <button
                                        type="button"
                                        onClick={() => handleCancel(p.id)}
                                        className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-destructive"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <Link href={`/pay/${p.id}`} className="text-xs font-medium text-primary hover:underline">
                                    Open
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </section>
        </main>
    );
}