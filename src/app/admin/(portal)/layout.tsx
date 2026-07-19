import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default async function AdminPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession("dashboard:view");

  return (
    <div className="grid min-h-screen bg-[#141516] text-white lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
