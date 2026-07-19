import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-white/10 bg-[#0d0e0e] py-12">
      <div className="container-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo light src={settings.brand.lightLogo} alt={`${settings.brand.name} ${settings.brand.tagline}`} />
          <p className="max-w-md text-sm leading-7 text-white/62">
            {settings.footer.description}
          </p>
        </div>
        {settings.footer.sections.slice(0, 2).map((section) => (
          <div key={section.id}>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">{section.title}</p>
            <div className="grid gap-3 text-sm text-white/74">
              {section.links.map((link) => (
                <Link key={link.id} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="container-shell mt-10 border-t border-white/10 pt-6 text-sm text-white/45">
        {settings.footer.copyright}
      </div>
    </footer>
  );
}
