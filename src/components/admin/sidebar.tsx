import Link from "next/link";
import { ChartNoAxesColumn, FileText, Gem, ImageIcon, Layers3, LayoutDashboard, Settings, ShoppingBag, Users } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
import { logoutAction } from "@/actions/admin";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Gem },
  { href: "/admin/categories", label: "Categories", icon: Layers3 },
  { href: "/admin/collections", label: "Collections", icon: ShoppingBag },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/hero", label: "Hero", icon: FileText },
  { href: "/admin/homepage", label: "Homepage", icon: ChartNoAxesColumn },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  return (
    <aside className="border-r border-white/10 bg-[#0f1011] p-5">
      <div className="mb-8">
        <Logo href="/admin" light />
      </div>
      <nav className="grid gap-2">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/70 hover:bg-white/6 hover:text-white">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="mt-8">
        <Button variant="outline" className="w-full">Logout</Button>
      </form>
    </aside>
  );
}
