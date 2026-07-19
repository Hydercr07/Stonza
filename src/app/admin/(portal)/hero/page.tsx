import { HeroManagerForm } from "@/components/admin/hero-manager-form";
import { getHeroSettings } from "@/lib/data/store";

export default async function HeroPage() {
  const hero = await getHeroSettings();
  return <HeroManagerForm hero={hero} />;
}
