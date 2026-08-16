import { notFound } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { Button } from "@/components/shared/ui/button";
import { getManagedPage, getSiteSettings } from "@/lib/data/store";

export default async function ManagedPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getManagedPage(slug), getSiteSettings()]);

  if (!page) {
    notFound();
  }

  const isContactPage =
    page.id === "page-contact" || page.slug === "contact" || page.slugHistory?.includes("contact");

  if (isContactPage) {
    const whatsappHref = settings.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`
      : settings.contactButton.destination;

    return (
      <section className="container-shell py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">Contact</p>
            <h1 className="text-display text-5xl text-white">{page.heroHeading}</h1>
            <p className="text-sm leading-7 text-white/65">
              {page.content.replace(/<[^>]+>/g, "")}
            </p>
          </div>
          <div className="stone-panel rounded-[2rem] p-8">
            <div className="grid gap-4 text-sm text-white/72">
              <div><span className="block text-white/40">Email</span>{settings.email}</div>
              <div><span className="block text-white/40">Address</span>{settings.address}</div>
              <div><span className="block text-white/40">Hours</span>{settings.businessHours}</div>
            </div>
            <Button className="mt-8" asChild>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                WHATSAPP
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell py-16">
      <div className="rounded-[2rem] border border-[#eadfcf] bg-white/88 p-8 shadow-[0_22px_52px_rgba(26,20,12,0.08)]">
        <h1 className="text-display text-5xl text-[#171717]">{page.heroHeading}</h1>
        <RichText html={page.content} className="mt-8 max-w-4xl text-black/68" />
      </div>
    </section>
  );
}
