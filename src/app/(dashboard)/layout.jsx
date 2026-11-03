import DashboardNavbar from "@/components/DashboardNavbar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
    const user = await getCurrentUser()

    if (!user) {
        redirect(`/login`)
    }

    return (
        <>
            <DashboardNavbar email={user.email} />
            {children}
        </>
    )
}