"use client";

import { useEffect, useMemo, useState } from "react";
import Field from "@/components/Field";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm() {
    const supabase = useMemo(() => createClient(), []);
    const [form, setForm] = useState({ display_name: "", merchant_name: "" });
    const [status, setStatus] = useState({ type: "", text: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        supabase
            .from("wallets")
            .select("display_name, merchant_name")
            .single()
            .then(({ data }) => {
                if (data) {
                    setForm({
                        display_name: data.display_name ?? "",
                        merchant_name: data.merchant_name ?? "",
                    });
                }
            });
    }, [supabase]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus({ type: "", text: "" });

        if (!form.display_name.trim() || !form.merchant_name.trim()) {
            setStatus({ type: "error", text: "Both names are required." });
            return;
        }

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from("wallets")
            .update({
                display_name: form.display_name.trim(),
                merchant_name: form.merchant_name.trim(),
            })
            .eq("user_id", user.id);
        setSaving(false);

        setStatus(
            error
                ? { type: "error", text: error.message }
                : { type: "success", text: "Profile saved." }
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Profile</h2>

            <Field label="Display name" id="display_name" type="text" maxLength={60}
                value={form.display_name} onChange={handleChange} />
            <Field label="Merchant name (shown at checkout)" id="merchant_name" type="text" maxLength={60}
                value={form.merchant_name} onChange={handleChange} />

            <div className="flex items-center gap-4 sm:col-span-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save profile"}
                </button>
                {status.text && (
                    <p role={status.type === "error" ? "alert" : "status"}
                        className={`text-sm ${status.type === "error" ? "text-destructive" : "text-primary"}`}>
                        {status.text}
                    </p>
                )}
            </div>
        </form>
    );
}