import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  const contactHref = settings.contactButton.enabled ? settings.contactButton.destination : "/contact";
  const visibleFooterSections = settings.footer.sections
    .filter((section) => section.links.length)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="mt-24 border-t border-[#15314d] bg-[linear-gradient(180deg,#10233a_0%,#0b1623_100%)] text-[#f7ecda]">
      <div className="container-shell py-16">
        <div className="mb-10 grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 px-6 py-6 backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#f7ecda]/52">{settings.footer.newsletterHeading}</p>
            <h2 className="text-display text-3xl text-white sm:text-4xl">
              {settings.footer.description || "Rare drops, field notes and first access."}
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[#f7ecda]/68">{settings.footer.newsletterBody}</p>
          </div>
          <div className="grid gap-3 self-end sm:grid-cols-[1fr_auto]">
            <div className="rounded-full border border-white/12 bg-white/10 px-5 py-4 text-sm text-[#f7ecda]/56">
              {settings.email}
            </div>
            <Link href={contactHref} className="inline-flex items-center justify-center rounded-full bg-[#edb230] px-6 py-4 text-sm font-medium uppercase tracking-[0.16em] text-[#10233a]">
              {settings.contactButton.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-5">
            <Logo light src={settings.brand.lightLogo} alt={`${settings.brand.name} ${settings.brand.tagline}`} className="w-[170px]" />
            <p className="text-sm uppercase tracking-[0.22em] text-[#f7ecda]/42">{settings.brand.tagline}</p>
            <p className="max-w-sm text-sm leading-7 text-[#f7ecda]/62">{settings.footer.description}</p>
          </div>
          <div>
            <p className="text-display mb-5 text-2xl text-white">
              {visibleFooterSections[0]?.title ?? "Explore"}
            </p>
            <div className="grid gap-3 text-sm text-[#f7ecda]/62">
              {visibleFooterSections[0]?.links.map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-display mb-5 text-2xl text-white">Legal</p>
            <div className="grid gap-3 text-sm text-[#f7ecda]/62">
              {settings.footer.legalLinks.filter((link) => link.visible).map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              ))}
              {visibleFooterSections[1]?.links.map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-display mb-5 text-2xl text-white">Atelier</p>
            <div className="grid gap-3 text-sm leading-7 text-[#f7ecda]/62">
              <p>{settings.address}</p>
              <p>{settings.email}</p>
              <p>{settings.businessHours}</p>
              {settings.whatsappNumber ? <p>{settings.whatsappNumber}</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="container-shell border-t border-white/10 py-6 text-sm text-[#f7ecda]/40">
        {settings.footer.copyright}
      </div>
    </footer>
  );
}
