import { NavigationManagerForm } from "@/components/admin/navigation-manager-form";
import { getContentLabels, getSiteSettings } from "@/lib/data/store";

export default async function AdminNavigationPage() {
  const [settings, labels] = await Promise.all([getSiteSettings(), getContentLabels()]);
  return <NavigationManagerForm settings={settings} labels={labels} />;
}
