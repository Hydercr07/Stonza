import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-[#e7ddd0] bg-[#f5eee4] text-[#171717]">
      <div className="container-shell grid gap-12 py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-5">
          <Logo src={settings.brand.lightLogo} alt={`${settings.brand.name} ${settings.brand.tagline}`} className="w-[170px]" />
          <p className="text-sm uppercase tracking-[0.22em] text-black/42">{settings.brand.tagline}</p>
          <p className="max-w-sm text-sm leading-7 text-black/55">{settings.footer.description}</p>
        </div>
        <div>
          <p className="mb-5 text-2xl text-[#171717]">About us</p>
          <div className="grid gap-3 text-sm text-black/58">
            {settings.footer.sections[0]?.links.slice(0, 3).map((link) => (
              <Link key={link.id} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-5 text-2xl text-[#171717]">Shop</p>
          <div className="grid gap-3 text-sm text-black/58">
            {settings.footer.sections[0]?.links.map((link) => (
              <Link key={link.id} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-5 text-2xl text-[#171717]">Address</p>
          <div className="grid gap-3 text-sm leading-7 text-black/58">
            <p>{settings.address}</p>
            <p>{settings.email}</p>
            <p>{settings.businessHours}</p>
          </div>
        </div>
      </div>
      <div className="container-shell border-t border-black/8 py-6 text-sm text-black/40">
        {settings.footer.copyright}
      </div>
    </footer>
  );
}
