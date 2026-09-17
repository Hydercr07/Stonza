import { NavigationManagerForm } from "@/components/admin/navigation-manager-form";
import { getAdminSiteSettings, getContentLabels } from "@/lib/data/store";

export default async function AdminNavigationPage() {
  const [settings, labels] = await Promise.all([getAdminSiteSettings(), getContentLabels()]);
  return <NavigationManagerForm settings={settings} labels={labels} />;
}
