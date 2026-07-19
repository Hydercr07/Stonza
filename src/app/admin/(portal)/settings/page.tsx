import { saveSettingsAction } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";
import { getSiteSettings } from "@/lib/data/store";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <form action={saveSettingsAction} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h1 className="text-display text-4xl">Brand & business</h1>
        <input name="siteTitle" defaultValue={settings.siteTitle} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="siteDescription" defaultValue={settings.siteDescription} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="email" defaultValue={settings.email} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="address" defaultValue={settings.address} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="businessHours" defaultValue={settings.businessHours} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="currency" defaultValue={settings.currency} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="lowStockDefault" type="number" defaultValue={settings.lowStockDefault} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
      </div>
      <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h2 className="text-2xl">Commerce & messaging</h2>
        <select name="checkoutMode" defaultValue={settings.checkoutMode} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <option value="standard">Standard checkout</option>
          <option value="enquiry_only">Enquiry only</option>
          <option value="disabled">Disabled</option>
        </select>
        <textarea name="shippingText" defaultValue={settings.shippingText} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <textarea name="returnsText" defaultValue={settings.returnsText} rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="maintenanceMode" defaultChecked={settings.maintenanceMode} /> Maintenance mode</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="announcementEnabled" defaultChecked={settings.announcement.enabled} /> Announcement enabled</label>
        <input name="announcementText" defaultValue={settings.announcement.text} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="announcementLink" defaultValue={settings.announcement.link} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="contactEnabled" defaultChecked={settings.contactButton.enabled} /> Contact button enabled</label>
        <input name="contactLabel" defaultValue={settings.contactButton.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <input name="contactDestination" defaultValue={settings.contactButton.destination} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3" />
        <Button>Save settings</Button>
      </div>
    </form>
  );
}
