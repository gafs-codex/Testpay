// app/(dashboard)/layout.jsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getCurrentUser } from "@/lib/auth";

async function AuthedShell({ children }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <DashboardNavbar email={user.email} />
            {children}
        </>
    );
}

export default function DashboardLayout({ children }) {
    return (
        <Suspense fallback={<div className="min-h-dvh" />}>
            <AuthedShell>{children}</AuthedShell>
        </Suspense>
    );
}