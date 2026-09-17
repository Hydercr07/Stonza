import { SettingsManagerForm } from "@/components/admin/settings-manager-form";
import { getAdminSiteSettings } from "@/lib/data/store";

export default async function SettingsPage() {
  const settings = await getAdminSiteSettings();
  return <SettingsManagerForm settings={settings} />;
}
