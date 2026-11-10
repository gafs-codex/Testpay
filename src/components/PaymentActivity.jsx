"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

const axisStyle = {
    fill: "#8A9B94",
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
};

const filters = [
    { label: "7 days", days: 7 },
    { label: "14 days", days: 14 },
    { label: "30 days", days: 30 },
];

const MAX_DAYS = 30;

// Convert a date to YYYY-MM-DD using local time.
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Generate the selected number of days, including today.
function generateDateRange(days) {
    const dates = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - i
        );

        dates.push({
            key: getDateKey(date),
            date: date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
            }),
            paid: 0,
            pending: 0,
            canceled: 0,
        });
    }

    return dates;
}

function PaymentTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const payment = payload[0].payload;

    return (
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
            <p className="mb-2 font-mono text-sm text-foreground">{label}</p>

            <p className="mb-2 font-mono text-sm text-[#80FF65]">
                paid : {payment.paid}
            </p>

            <p className="mb-2 font-mono text-sm text-muted-foreground">
                pending : {payment.pending}
            </p>

            <p className="font-mono text-sm text-red-600">
                canceled : {payment.canceled}
            </p>
        </div>
    );
}

export default function PaymentActivity() {
    const supabase = useMemo(() => createClient(), []);
    const [selectedDays, setSelectedDays] = useState(14);
    const [events, setEvents] = useState(null); // null = loading
    const [failed, setFailed] = useState(false);

    // Load the last 30 days once; the 7/14/30 filter just slices this.
    useEffect(() => {
        async function load() {
            const now = new Date();
            const since = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - (MAX_DAYS - 1)
            ).toISOString();

            const [requestsRes, madeRes] = await Promise.all([
                // Payment requests you created (created or paid recently)
                supabase
                    .from("payments")
                    .select("status, created_at, paid_at")
                    .or(`created_at.gte.${since},paid_at.gte.${since}`)
                    .limit(1000),
                // Payments you made to other people
                supabase
                    .from("transactions")
                    .select("created_at")
                    .eq("type", "payment")
                    .lt("amount", 0)
                    .gte("created_at", since)
                    .limit(1000),
            ]);

            if (requestsRes.error || madeRes.error) {
                toast.error("Couldn't load payment activity.");
                setFailed(true);
                return;
            }

            setEvents([
                ...requestsRes.data.map((r) => ({
                    // A paid request counts on the day it was paid
                    at: r.status === "paid" ? r.paid_at ?? r.created_at : r.created_at,
                    status: r.status,
                })),
                ...madeRes.data.map((t) => ({ at: t.created_at, status: "paid" })),
            ]);
        }
        load();
    }, [supabase]);

    const paymentActivity = useMemo(() => {
        const dates = generateDateRange(selectedDays);

        // Create a quick lookup for each date.
        const dateMap = new Map(dates.map((item) => [item.key, item]));

        // Add counts to their corresponding dates.
        (events ?? []).forEach((event) => {
            const eventDate = new Date(event.at);

            if (Number.isNaN(eventDate.getTime())) return;

            const day = dateMap.get(getDateKey(eventDate));

            if (!day) return;

            const status = event.status?.toLowerCase();

            if (status === "paid") day.paid++;
            if (status === "pending") day.pending++;
            if (status === "canceled" || status === "cancelled") {
                day.canceled++;
            }
        });

        return dates;
    }, [events, selectedDays]);

    return (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-semibold text-foreground">
                    Payment activity
                </h2>

                <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                    {filters.map((filter) => (
                        <button
                            key={filter.days}
                            type="button"
                            onClick={() => setSelectedDays(filter.days)}
                            className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${selectedDays === filter.days
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5 h-[320px] w-full">
                {failed ? (
                    <p className="grid h-full place-items-center text-sm text-muted-foreground">
                        Couldn't load payment activity.
                    </p>
                ) : !events ? (
                    <p className="grid h-full place-items-center text-sm text-muted-foreground">
                        Loading...
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={paymentActivity}
                            margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                            barGap={2}
                        >
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={axisStyle}
                                dy={8}
                                interval={selectedDays === 30 ? 3 : 0}
                            />

                            <YAxis
                                domain={[0, "dataMax + 1"]}
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={axisStyle}
                                width={28}
                            />

                            <Tooltip
                                content={<PaymentTooltip />}
                                cursor={{ fill: "rgba(198, 203, 197, 0.08)" }}
                            />

                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="square"
                                iconSize={10}
                                wrapperStyle={{
                                    fontSize: "12px",
                                    fontFamily: "JetBrains Mono, monospace",
                                    paddingTop: "18px",
                                }}
                            />

                            <Bar dataKey="paid" name="paid" fill="#80FF65" radius={[3, 3, 0, 0]} maxBarSize={42} />
                            <Bar dataKey="pending" name="pending" fill="#55515F" radius={[3, 3, 0, 0]} maxBarSize={42} />
                            <Bar dataKey="canceled" name="canceled" fill="#991B1B" radius={[3, 3, 0, 0]} maxBarSize={42} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
}