
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getCurrentUser } from "@/lib/auth";

// This component checks the user's session.
async function MarketingNavbar() {
  const user = await getCurrentUser();

  if (user) {
    return <DashboardNavbar email={user.email} />;
  }

  return <Navbar />;
}

export default function MarketingLayout({ children }) {
  return (
    <>
      <Suspense fallback={<Navbar />}>
        <MarketingNavbar />
      </Suspense>

      {children}
    </>
  );
}
