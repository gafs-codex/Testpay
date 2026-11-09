
"use client";

import { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Temporary empty data.
// Later, these records will come from Supabase.
const mockPayments = [];

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
            <p className="mb-2 font-mono text-sm text-foreground">
                {label}
            </p>

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

export default function PaymentActivity({ payments = mockPayments }) {
    const [selectedDays, setSelectedDays] = useState(14);

    const paymentActivity = useMemo(() => {
        const dates = generateDateRange(selectedDays);

        // Create a quick lookup for each date.
        const dateMap = new Map(
            dates.map((item) => [item.key, item])
        );

        // Add payment counts to their corresponding dates.
        payments.forEach((payment) => {
            const paymentDate = new Date(payment.created_at);

            if (Number.isNaN(paymentDate.getTime())) return;

            const key = getDateKey(paymentDate);
            const day = dateMap.get(key);

            if (!day) return;

            const status = payment.status?.toLowerCase();

            if (status === "paid") day.paid++;
            if (status === "pending") day.pending++;
            if (status === "canceled" || status === "cancelled") {
                day.canceled++;
            }
        });

        return dates;
    }, [payments, selectedDays]);

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
                            onClick={() => setSelectedDays(filter.days)}
                            className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${selectedDays === filter.days
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

                        <Bar
                            dataKey="paid"
                            name="paid"
                            fill="#80FF65"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={42}
                        />

                        <Bar
                            dataKey="pending"
                            name="pending"
                            fill="#55515F"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={42}
                        />

                        <Bar
                            dataKey="canceled"
                            name="canceled"
                            fill="#991B1B"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={42}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
