import { Button } from "@/components/shared/ui/button";
import { getManagedPage, getSiteSettings } from "@/lib/data/store";

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getManagedPage("contact"), getSiteSettings()]);

  return (
    <section className="container-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Contact</p>
          <h1 className="text-display text-5xl text-white">{page?.heroHeading ?? "Contact STONZA"}</h1>
          <p className="text-sm leading-7 text-white/65">{page?.content.replace(/<[^>]+>/g, "")}</p>
        </div>
        <div className="stone-panel rounded-[2rem] p-8">
          <div className="grid gap-4 text-sm text-white/72">
            <div><span className="block text-white/40">Email</span>{settings.email}</div>
            <div><span className="block text-white/40">Address</span>{settings.address}</div>
            <div><span className="block text-white/40">Hours</span>{settings.businessHours}</div>
          </div>
          <Button className="mt-8">Open WhatsApp concierge</Button>
        </div>
      </div>
    </section>
  );
}
