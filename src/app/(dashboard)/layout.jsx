import DashboardNavbar from "@/components/DashboardNavbar";
import OfflineBanner from "@/components/OfflineBanner";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const admin = await isAdmin();

    return (
        <>
            <OfflineBanner />
            <DashboardNavbar email={user.email} isAdmin={admin} />
            {children}
        </>
    );
}