import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  const contactHref = settings.contactButton.enabled ? settings.contactButton.destination : "/contact";
  const visibleFooterSections = settings.footer.sections
    .filter((section) => section.links.length)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="mt-16 border-t border-white/8 bg-[#0d1420] text-white">
      <div className="container-shell py-12 lg:py-16">
        <div className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/46">{settings.footer.newsletterHeading}</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {settings.footer.description || "Big-brand presentation, tightly curated for daily discovery."}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-white/62">{settings.footer.newsletterBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm text-white/60">
              {settings.email}
            </div>
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-full bg-[#f4b234] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111]"
            >
              {settings.contactButton.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 xl:grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr]">
          <div className="space-y-4">
            <Logo light src={settings.brand.lightLogo} alt={`${settings.brand.name} ${settings.brand.tagline}`} className="w-[128px]" />
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">{settings.brand.tagline}</p>
            <p className="max-w-sm text-sm leading-7 text-white/58">{settings.siteDescription}</p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/42">
              {visibleFooterSections[0]?.title ?? "Explore"}
            </p>
            <div className="grid gap-3 text-sm text-white/66">
              {visibleFooterSections[0]?.links.map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-[#ffd15e]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/42">Legal</p>
            <div className="grid gap-3 text-sm text-white/66">
              {settings.footer.legalLinks.filter((link) => link.visible).map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-[#ffd15e]">
                  {link.label}
                </Link>
              ))}
              {visibleFooterSections[1]?.links.map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-[#ffd15e]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/42">Storefront</p>
            <div className="grid gap-3 text-sm leading-7 text-white/66">
              <p>{settings.address}</p>
              <p>{settings.email}</p>
              <p>{settings.businessHours}</p>
              {settings.whatsappNumber ? <p>{settings.whatsappNumber}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="container-shell border-t border-white/8 py-5 text-xs uppercase tracking-[0.18em] text-white/36">
        {settings.footer.copyright}
      </div>
    </footer>
  );
}
