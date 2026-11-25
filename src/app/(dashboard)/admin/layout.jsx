import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }) {
    if (!(await isAdmin())) {
        redirect("/wallet");
    }
    return children;
}