"use client";

import { useState } from "react";
import Field from "@/components/Field";

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
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    function validate() {
        const next = {};
        const amount = Number(form.amount);
        if (!Number.isInteger(amount) || amount < 1) next.amount = "Enter a whole amount of at least 1.";
        if (!form.description.trim()) next.description = "Description is required.";
        ["success_url", "cancel_url", "webhook_url"].forEach((field) => {
            if (form[field] && !isValidUrl(form[field])) next[field] = "Enter a valid http(s) URL.";
        });
        return next;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const found = validate();
        if (Object.keys(found).length > 0) {
            setErrors(found);
            return;
        }
        // TODO: insert into a `payments` table (not created yet), then reset the form
        console.log("Create payment link", form);
    }

    const error = (name) =>
        errors[name] && <p role="alert" className="text-xs text-destructive">{errors[name]}</p>;

    return (
        <main className="mx-auto grid w-full max-w-[1440px] gap-6 px-6 py-10 lg:grid-cols-3 lg:px-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border bg-card p-6">
                <h1 className="text-lg font-semibold">New payment</h1>

                <div>
                    <Field label="Amount (TestCoin)" id="amount" type="number" min="1" step="1"
                        placeholder="250" value={form.amount} onChange={handleChange} className="font-mono" />
                    {error("amount")}
                </div>
                <div>
                    <Field label="Description" id="description" type="text" maxLength={500}
                        placeholder="Pro plan — 1 month" value={form.description} onChange={handleChange} />
                    {error("description")}
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
                    className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Create payment link
                </button>
            </form>

            <section className="rounded-xl border bg-card lg:col-span-2">
                <h2 className="border-b p-4 font-semibold">Recent payments</h2>
                <ul className="divide-y">
                    <li className="p-8 text-center text-sm text-muted-foreground">No payments yet.</li>
                </ul>
            </section>
        </main>
    );
}