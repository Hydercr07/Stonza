import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-white/10 bg-[#0b0c0d]">
      <div className="container-shell py-10">
        <div className="stone-mesh rounded-[2rem] border border-white/10 px-6 py-8 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Private release notes</p>
              <h2 className="text-display text-3xl text-white md:text-4xl">{settings.footer.newsletterHeading}</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/62">{settings.footer.newsletterBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm text-white/40">
                Collector email previews coming via admin integration
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#d5c7a9]/30 bg-[#d5c7a9]/12 px-6 py-3 text-sm text-white hover:bg-[#d5c7a9]/18"
              >
                Join the list
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
        <div className="space-y-4">
          <Logo light src={settings.brand.lightLogo} alt={`${settings.brand.name} ${settings.brand.tagline}`} />
          <p className="max-w-md text-sm leading-7 text-white/62">
            {settings.footer.description}
          </p>
          <div className="grid gap-2 pt-2 text-sm text-white/55">
            <p>{settings.address}</p>
            <p>{settings.email}</p>
            <p>{settings.businessHours}</p>
          </div>
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
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">Why STONZA</p>
          <div className="grid gap-3 text-sm text-white/74">
            <p>One-of-one inventory presentation with clear provenance.</p>
            <p>Private sourcing support for interiors, collectors and gifting.</p>
            <p>Protected global dispatch with concierge handling.</p>
          </div>
        </div>
      </div>
      <div className="container-shell border-t border-white/10 py-6 text-sm text-white/45">
        {settings.footer.copyright}
      </div>
    </footer>
  );
}
