"use client";

import { useState } from "react";
import { saveLabelsAction, saveSettingsAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import type { ContentLabel, FooterSection, NavigationItem, SiteSettings } from "@/types/domain";

function NavigationEditor({
  title,
  items,
  setItems,
}: {
  title: string;
  items: NavigationItem[];
  setItems: (items: NavigationItem[]) => void;
}) {
  return (
    <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-white">{title}</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setItems([
              ...items,
              {
                id: `nav-${crypto.randomUUID()}`,
                label: "New link",
                href: "/",
                order: items.length + 1,
                visible: true,
              },
            ])
          }
        >
          Add link
        </Button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <input
            value={item.label}
            onChange={(event) =>
              setItems(items.map((entry) => (entry.id === item.id ? { ...entry, label: event.target.value } : entry)))
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          <input
            value={item.href}
            onChange={(event) =>
              setItems(items.map((entry) => (entry.id === item.id ? { ...entry, href: event.target.value } : entry)))
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={item.visible}
              onChange={(event) =>
                setItems(
                  items.map((entry) => (entry.id === item.id ? { ...entry, visible: event.target.checked } : entry)),
                )
              }
            />
            Visible
          </label>
          <button
            type="button"
            onClick={() => setItems(items.filter((entry) => entry.id !== item.id).map((entry, index) => ({ ...entry, order: index + 1 })))}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function FooterEditor({
  sections,
  setSections,
}: {
  sections: FooterSection[];
  setSections: (sections: FooterSection[]) => void;
}) {
  return (
    <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#111213] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-white">Footer sections</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setSections([
              ...sections,
              { id: `footer-${crypto.randomUUID()}`, title: "New section", order: sections.length + 1, links: [] },
            ])
          }
        >
          Add section
        </Button>
      </div>
      {sections.map((section) => (
        <div key={section.id} className="space-y-3 rounded-2xl border border-white/8 bg-black/15 p-4">
          <input
            value={section.title}
            onChange={(event) =>
              setSections(
                sections.map((entry) => (entry.id === section.id ? { ...entry, title: event.target.value } : entry)),
              )
            }
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          {section.links.map((link) => (
            <div key={link.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={link.label}
                onChange={(event) =>
                  setSections(
                    sections.map((entry) =>
                      entry.id === section.id
                        ? {
                            ...entry,
                            links: entry.links.map((item) =>
                              item.id === link.id ? { ...item, label: event.target.value } : item,
                            ),
                          }
                        : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
              <input
                value={link.href}
                onChange={(event) =>
                  setSections(
                    sections.map((entry) =>
                      entry.id === section.id
                        ? {
                            ...entry,
                            links: entry.links.map((item) =>
                              item.id === link.id ? { ...item, href: event.target.value } : item,
                            ),
                          }
                        : entry,
                    ),
                  )
                }
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setSections(
                    sections.map((entry) =>
                      entry.id === section.id
                        ? { ...entry, links: entry.links.filter((item) => item.id !== link.id) }
                        : entry,
                    ),
                  )
                }
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70"
              >
                Remove
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSections(
                sections.map((entry) =>
                  entry.id === section.id
                    ? {
                        ...entry,
                        links: [
                          ...entry.links,
                          { id: `footer-link-${crypto.randomUUID()}`, label: "New link", href: "/" },
                        ],
                      }
                    : entry,
                ),
              )
            }
          >
            Add footer link
          </Button>
        </div>
      ))}
    </div>
  );
}

export function NavigationManagerForm({
  settings,
  labels,
}: {
  settings: SiteSettings;
  labels: ContentLabel[];
}) {
  const [navigation, setNavigation] = useState(settings.header.navigation);
  const [legalLinks, setLegalLinks] = useState(settings.footer.legalLinks);
  const [footerSections, setFooterSections] = useState(settings.footer.sections);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form action={saveSettingsAction} className="space-y-6">
        <input type="hidden" name="siteTitle" value={settings.siteTitle} />
        <input type="hidden" name="siteDescription" value={settings.siteDescription} />
        <input type="hidden" name="whatsappNumber" value={settings.whatsappNumber} />
        <input type="hidden" name="email" value={settings.email} />
        <input type="hidden" name="address" value={settings.address} />
        <input type="hidden" name="businessHours" value={settings.businessHours} />
        <input type="hidden" name="currency" value={settings.currency} />
        <input type="hidden" name="maintenanceMode" value={settings.maintenanceMode ? "true" : "false"} />
        <input type="hidden" name="checkoutMode" value={settings.checkoutMode} />
        <input type="hidden" name="shippingText" value={settings.shippingText} />
        <input type="hidden" name="returnsText" value={settings.returnsText} />
        <input type="hidden" name="lowStockDefault" value={settings.lowStockDefault} />
        <input type="hidden" name="announcementEnabled" value={settings.announcement.enabled ? "true" : "false"} />
        <input type="hidden" name="announcementText" value={settings.announcement.text} />
        <input type="hidden" name="announcementLinkLabel" value={settings.announcement.linkLabel ?? ""} />
        <input type="hidden" name="announcementLink" value={settings.announcement.link ?? ""} />
        <input type="hidden" name="announcementBackgroundStyle" value={settings.announcement.backgroundStyle ?? "graphite"} />
        <input type="hidden" name="brandName" value={settings.brand.name} />
        <input type="hidden" name="brandTagline" value={settings.brand.tagline} />
        <input type="hidden" name="brandLogo" value={settings.brand.logo} />
        <input type="hidden" name="brandLightLogo" value={settings.brand.lightLogo} />
        <input type="hidden" name="brandFavicon" value={settings.brand.favicon} />
        <input type="hidden" name="brandPrimary" value={settings.brand.colors.primary} />
        <input type="hidden" name="brandSecondary" value={settings.brand.colors.secondary} />
        <input type="hidden" name="brandAccent" value={settings.brand.colors.accent} />
        <input type="hidden" name="brandSurface" value={settings.brand.colors.surface} />
        <input type="hidden" name="headingFont" value={settings.brand.headingFont} />
        <input type="hidden" name="bodyFont" value={settings.brand.bodyFont} />
        <input type="hidden" name="headerStyle" value={settings.header.style} />
        <input type="hidden" name="headerSticky" value={settings.header.sticky ? "true" : "false"} />
        <input type="hidden" name="showSearch" value={settings.header.showSearch ? "true" : "false"} />
        <input type="hidden" name="showWishlist" value={settings.header.showWishlist ? "true" : "false"} />
        <input type="hidden" name="showCart" value={settings.header.showCart ? "true" : "false"} />
        <input type="hidden" name="contactEnabled" value={settings.header.contactButton.enabled ? "true" : "false"} />
        <input type="hidden" name="contactLabel" value={settings.header.contactButton.label} />
        <input type="hidden" name="contactDestination" value={settings.header.contactButton.destination} />
        <input type="hidden" name="footerDescription" value={settings.footer.description} />
        <input type="hidden" name="newsletterHeading" value={settings.footer.newsletterHeading} />
        <input type="hidden" name="newsletterBody" value={settings.footer.newsletterBody} />
        <input type="hidden" name="copyrightText" value={settings.footer.copyright} />
        <input type="hidden" name="instagram" value={settings.social.instagram ?? ""} />
        <input type="hidden" name="facebook" value={settings.social.facebook ?? ""} />
        <input type="hidden" name="tiktok" value={settings.social.tiktok ?? ""} />
        <input type="hidden" name="youtube" value={settings.social.youtube ?? ""} />
        <input type="hidden" name="pinterest" value={settings.social.pinterest ?? ""} />
        <input type="hidden" name="defaultSeoTitle" value={settings.seo.defaultTitle} />
        <input type="hidden" name="defaultSeoDescription" value={settings.seo.defaultDescription} />
        <input type="hidden" name="defaultOgImage" value={settings.seo.defaultOgImage} />
        <input type="hidden" name="labels" value={JSON.stringify(settings.labels)} />
        <input type="hidden" name="navigation" value={JSON.stringify(navigation)} />
        <input type="hidden" name="legalLinks" value={JSON.stringify(legalLinks)} />
        <input type="hidden" name="footerSections" value={JSON.stringify(footerSections)} />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
            <h1 className="text-display mt-3 text-5xl">Navigation manager</h1>
          </div>
          <Button>Save navigation</Button>
        </div>

        <NavigationEditor title="Header navigation" items={navigation} setItems={setNavigation} />
        <NavigationEditor title="Legal links" items={legalLinks} setItems={setLegalLinks} />
        <FooterEditor sections={footerSections} setSections={setFooterSections} />
      </form>

      <form action={saveLabelsAction} className="space-y-6 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <div>
          <h2 className="text-2xl text-white">Global text and labels</h2>
          <p className="mt-2 text-sm leading-7 text-white/58">
            Small storefront labels that appear on sections, empty states and product detail content.
          </p>
        </div>
        {labels.map((entry) => (
          <label key={entry.id} className="grid gap-2 text-sm">
            {entry.key}
            <input
              name={entry.key}
              defaultValue={entry.label}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </label>
        ))}
        <Button>Save labels</Button>
      </form>
    </div>
  );
}
