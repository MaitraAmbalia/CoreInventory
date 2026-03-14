import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
      <main className="page-container">{children}</main>
    </div>
  );
}
