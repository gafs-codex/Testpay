"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const paymentActivity = [
    { date: "24 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "25 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "26 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "27 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "28 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "29 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "30 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "31 Oct", paid: 0, pending: 0, canceled: 0 },
    { date: "1 Nov", paid: 0, pending: 0, canceled: 0 },
    { date: "2 Nov", paid: 0, pending: 0, canceled: 0 },
    { date: "3 Nov", paid: 0, pending: 0, canceled: 0 },
    { date: "4 Nov", paid: 0, pending: 0, canceled: 0 },
    { date: "5 Nov", paid: 0, pending: 0, canceled: 0 },
    { date: "6 Nov", paid: 0, pending: 0, canceled: 0 },
];


const axisStyle = {
    fill: "#8A9B94",
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
};

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
    return (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                    Payment activity
                </h2>

                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                    last 14 days
                </span>
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
                        />

                        <YAxis
                            domain={[0, 4]}
                            ticks={[0, 1, 2, 3, 4]}
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