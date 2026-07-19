import { saveSettingsAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { getSiteSettings } from "@/lib/data/store";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <form action={saveSettingsAction} className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <input type="hidden" name="navigation" value={JSON.stringify(settings.header.navigation)} />
      <input type="hidden" name="legalLinks" value={JSON.stringify(settings.footer.legalLinks)} />
      <input type="hidden" name="footerSections" value={JSON.stringify(settings.footer.sections)} />
      <input type="hidden" name="labels" value={JSON.stringify(settings.labels)} />

      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h1 className="text-display text-4xl">Brand & business</h1>
        <input name="siteTitle" defaultValue={settings.siteTitle} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="siteDescription" defaultValue={settings.siteDescription} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="brandName" defaultValue={settings.brand.name} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="brandTagline" defaultValue={settings.brand.tagline} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="brandLogo" defaultValue={settings.brand.logo} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="brandLightLogo" defaultValue={settings.brand.lightLogo} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="brandFavicon" defaultValue={settings.brand.favicon} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="brandPrimary" defaultValue={settings.brand.colors.primary} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="brandSecondary" defaultValue={settings.brand.colors.secondary} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="brandAccent" defaultValue={settings.brand.colors.accent} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="brandSurface" defaultValue={settings.brand.colors.surface} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="headingFont" defaultValue={settings.brand.headingFont} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
          <input name="bodyFont" defaultValue={settings.brand.bodyFont} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        </div>
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="email" defaultValue={settings.email} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="address" defaultValue={settings.address} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="businessHours" defaultValue={settings.businessHours} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="currency" defaultValue={settings.currency} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="lowStockDefault" type="number" defaultValue={settings.lowStockDefault} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
      </div>
      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h2 className="text-2xl">Storefront behavior</h2>
        <select name="checkoutMode" defaultValue={settings.checkoutMode} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="standard">Standard checkout</option>
          <option value="enquiry_only">Enquiry only</option>
          <option value="disabled">Disabled</option>
        </select>
        <select name="headerStyle" defaultValue={settings.header.style} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="transparent">Transparent header</option>
          <option value="solid">Solid header</option>
        </select>
        <textarea name="shippingText" defaultValue={settings.shippingText} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="returnsText" defaultValue={settings.returnsText} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="footerDescription" defaultValue={settings.footer.description} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="newsletterHeading" defaultValue={settings.footer.newsletterHeading} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="newsletterBody" defaultValue={settings.footer.newsletterBody} rows={3} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="copyrightText" defaultValue={settings.footer.copyright} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} /> Maintenance mode</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="headerSticky" defaultChecked={settings.header.sticky} /> Sticky header</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="showSearch" defaultChecked={settings.header.showSearch} /> Show search</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="showWishlist" defaultChecked={settings.header.showWishlist} /> Show wishlist</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="showCart" defaultChecked={settings.header.showCart} /> Show cart</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="announcementEnabled" defaultChecked={settings.announcement.enabled} /> Announcement enabled</label>
        <input name="announcementText" defaultValue={settings.announcement.text} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="announcementLinkLabel" defaultValue={settings.announcement.linkLabel} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="announcementLink" defaultValue={settings.announcement.link} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <select name="announcementBackgroundStyle" defaultValue={settings.announcement.backgroundStyle} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="graphite">Graphite</option>
          <option value="ivory">Ivory</option>
          <option value="accent">Accent</option>
        </select>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="contactEnabled" defaultChecked={settings.header.contactButton.enabled} /> Contact button enabled</label>
        <input name="contactLabel" defaultValue={settings.header.contactButton.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="contactDestination" defaultValue={settings.header.contactButton.destination} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="instagram" defaultValue={settings.social.instagram} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="facebook" defaultValue={settings.social.facebook} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="tiktok" defaultValue={settings.social.tiktok} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="youtube" defaultValue={settings.social.youtube} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="pinterest" defaultValue={settings.social.pinterest} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="defaultSeoTitle" defaultValue={settings.seo.defaultTitle} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="defaultSeoDescription" defaultValue={settings.seo.defaultDescription} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="defaultOgImage" defaultValue={settings.seo.defaultOgImage} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <Button>Save settings</Button>
      </div>
    </form>
  );
}
