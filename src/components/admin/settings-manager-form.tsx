"use client";

import { useEffect, useState } from "react";
import { saveSettingsAction } from "@/actions/admin";
import type { SiteSettings } from "@/types/domain";
import { Button } from "@/components/shared/ui/button";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General" },
  { id: "branding", label: "Branding" },
  { id: "contact", label: "Store Contact" },
  { id: "storefront", label: "Storefront" },
  { id: "seo", label: "SEO" },
  { id: "social", label: "Social Media" },
] as const;

export function SettingsManagerForm({ settings }: { settings: SiteSettings }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("general");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Settings"
        title="Store settings"
        description="Grouped settings keep brand, contact, storefront behavior, and SEO easy to manage without exposing developer-only clutter."
        actions={dirty ? <AdminBadge tone="warning">You have unsaved changes</AdminBadge> : undefined}
      />

      <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-[#e7dfd1] bg-white p-3 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeTab === tab.id ? "bg-[#171717] text-white" : "text-[#5f564b] hover:bg-[#f6f1e8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Every tab section below stays permanently mounted in the DOM and is
          only ever visually hidden via the "hidden" class -- saveSettingsAction
          (src/actions/admin.ts) validates all tabs' fields together in one
          schema, so when a tab used to be removed from the DOM entirely while
          inactive (`activeTab === "x" ? <div/> : null`), submitting from any
          tab but the one happening to contain every required field sent the
          rest of the schema's fields as missing, and settingsSchema.parse()
          always threw. Keeping every input mounted means FormData always has
          everything, regardless of which tab is visible when Save is clicked. */}
      <form
        action={saveSettingsAction}
        onChangeCapture={() => setDirty(true)}
        onReset={() => setDirty(false)}
        className="space-y-6"
      >
        <input type="hidden" name="navigation" value={JSON.stringify(settings.header.navigation)} />
        <input type="hidden" name="legalLinks" value={JSON.stringify(settings.footer.legalLinks)} />
        <input type="hidden" name="footerSections" value={JSON.stringify(settings.footer.sections)} />
        <input type="hidden" name="labels" value={JSON.stringify(settings.labels)} />

        <div className={cn("grid gap-6 xl:grid-cols-[1fr_1fr]", activeTab === "general" ? "" : "hidden")}>
          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Store identity</h2>
            <input name="siteTitle" defaultValue={settings.siteTitle} placeholder="Store name" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <textarea name="siteDescription" defaultValue={settings.siteDescription} rows={5} placeholder="Store description" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="currency" defaultValue={settings.currency} className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="lowStockDefault" type="number" defaultValue={settings.lowStockDefault} className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>

          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Business rules</h2>
            <select name="checkoutMode" defaultValue={settings.checkoutMode} className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
              <option value="standard">Standard checkout</option>
              <option value="enquiry_only">Enquiry only</option>
              <option value="disabled">Disabled</option>
            </select>
            <textarea name="shippingText" defaultValue={settings.shippingText} rows={4} placeholder="Shipping guidance" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <textarea name="returnsText" defaultValue={settings.returnsText} rows={4} placeholder="Returns guidance" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <label className="flex items-center gap-3 text-sm text-[#5f564b]">
              <input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} /> Maintenance mode
            </label>
          </AdminCard>
        </div>

        <div className={cn("grid gap-6 xl:grid-cols-[1fr_1fr]", activeTab === "branding" ? "" : "hidden")}>
          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Brand assets</h2>
            <input name="brandName" defaultValue={settings.brand.name} placeholder="Brand name" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="brandTagline" defaultValue={settings.brand.tagline} placeholder="Tagline" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="brandLogo" defaultValue={settings.brand.logo} placeholder="Logo path or URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="brandLightLogo" defaultValue={settings.brand.lightLogo} placeholder="Light logo path or URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="brandFavicon" defaultValue={settings.brand.favicon} placeholder="Favicon path or URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>

          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Brand styling</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input name="brandPrimary" defaultValue={settings.brand.colors.primary} placeholder="Primary color" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
              <input name="brandSecondary" defaultValue={settings.brand.colors.secondary} placeholder="Secondary color" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
              <input name="brandAccent" defaultValue={settings.brand.colors.accent} placeholder="Accent color" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
              <input name="brandSurface" defaultValue={settings.brand.colors.surface} placeholder="Surface color" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            </div>
            <input name="headingFont" defaultValue={settings.brand.headingFont} placeholder="Heading font" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="bodyFont" defaultValue={settings.brand.bodyFont} placeholder="Body font" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>
        </div>

        <div className={cn("grid gap-6 xl:grid-cols-[1fr_1fr]", activeTab === "contact" ? "" : "hidden")}>
          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Store contact</h2>
            <input name="whatsappNumber" defaultValue={settings.whatsappNumber} placeholder="WhatsApp number" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="email" defaultValue={settings.email} placeholder="Email" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="address" defaultValue={settings.address} placeholder="Address" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="businessHours" defaultValue={settings.businessHours} placeholder="Business hours" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>

          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Footer contact area</h2>
            <textarea name="footerDescription" defaultValue={settings.footer.description} rows={4} placeholder="Footer description" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="newsletterHeading" defaultValue={settings.footer.newsletterHeading} placeholder="Footer heading" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <textarea name="newsletterBody" defaultValue={settings.footer.newsletterBody} rows={4} placeholder="Footer body" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="copyrightText" defaultValue={settings.footer.copyright} placeholder="Copyright" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>
        </div>

        <div className={cn("grid gap-6 xl:grid-cols-[1fr_1fr]", activeTab === "storefront" ? "" : "hidden")}>
          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Header and utility controls</h2>
            <select name="headerStyle" defaultValue={settings.header.style} className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
              <option value="transparent">Transparent header</option>
              <option value="solid">Solid header</option>
            </select>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="headerSticky" defaultChecked={settings.header.sticky} /> Sticky header</label>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="showSearch" defaultChecked={settings.header.showSearch} /> Show search</label>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="showWishlist" defaultChecked={settings.header.showWishlist} /> Show wishlist</label>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="showCart" defaultChecked={settings.header.showCart} /> Show cart</label>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="contactEnabled" defaultChecked={settings.header.contactButton.enabled} /> Show contact button</label>
            <input name="contactLabel" defaultValue={settings.header.contactButton.label} placeholder="Contact button label" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="contactDestination" defaultValue={settings.header.contactButton.destination} placeholder="Contact button link" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>

          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Announcement bar</h2>
            <label className="flex items-center gap-3 text-sm text-[#5f564b]"><input type="checkbox" name="announcementEnabled" defaultChecked={settings.announcement.enabled} /> Enable announcement bar</label>
            <input name="announcementText" defaultValue={settings.announcement.text} placeholder="Announcement text" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="announcementLinkLabel" defaultValue={settings.announcement.linkLabel} placeholder="Announcement button text" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="announcementLink" defaultValue={settings.announcement.link} placeholder="Announcement link" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <select name="announcementBackgroundStyle" defaultValue={settings.announcement.backgroundStyle} className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3">
              <option value="graphite">Graphite</option>
              <option value="ivory">Ivory</option>
              <option value="accent">Accent</option>
            </select>
          </AdminCard>
        </div>

        <div className={cn("grid gap-6 xl:grid-cols-[1fr_1fr]", activeTab === "seo" ? "" : "hidden")}>
          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Default SEO</h2>
            <input name="defaultSeoTitle" defaultValue={settings.seo.defaultTitle} placeholder="Default title" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <textarea name="defaultSeoDescription" defaultValue={settings.seo.defaultDescription} rows={4} placeholder="Default description" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
            <input name="defaultOgImage" defaultValue={settings.seo.defaultOgImage} placeholder="Default OG image" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          </AdminCard>

          <AdminCard className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#171717]">Notes</h2>
            <p className="text-sm leading-7 text-[#6f6558]">
              Navigation, footer links, and editable storefront text labels are managed in their dedicated content editors so this page stays focused on true store-level settings.
            </p>
          </AdminCard>
        </div>

        <AdminCard className={cn("grid gap-4 xl:grid-cols-2", activeTab === "social" ? "" : "hidden")}>
          <input name="instagram" defaultValue={settings.social.instagram} placeholder="Instagram URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          <input name="facebook" defaultValue={settings.social.facebook} placeholder="Facebook URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          <input name="tiktok" defaultValue={settings.social.tiktok} placeholder="TikTok URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          <input name="youtube" defaultValue={settings.social.youtube} placeholder="YouTube URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3" />
          <input name="pinterest" defaultValue={settings.social.pinterest} placeholder="Pinterest URL" className="rounded-2xl border border-[#e7dfd1] bg-[#fcfaf6] px-4 py-3 xl:col-span-2" />
        </AdminCard>

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#ddd2c3] bg-white p-4 shadow-[0_18px_45px_rgba(19,14,8,0.14)]">
          <p className="text-sm text-[#6f6558]">{dirty ? "You have unsaved changes." : "No unsaved changes."}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="reset" variant="outline">Discard</Button>
            <Button>Save settings</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
