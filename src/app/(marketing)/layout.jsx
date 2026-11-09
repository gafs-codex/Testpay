import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({ children }) {
    const user = await getCurrentUser();

    return (
        <>
            {user ? (
                <DashboardNavbar email={user.email} />
            ) : (
                <Navbar />
            )}

            {children}
        </>
    );
}