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
            <h1 className="text-display text-5xl text-[#171717]">{page.heroHeading}</h1>
            <p className="max-w-xl text-sm leading-8 text-black/62">
              {page.content.replace(/<[^>]+>/g, "")}
            </p>
          </div>
          <div className="stone-panel rounded-[2rem] p-8">
            <div className="grid gap-4 text-sm text-black/72">
              <div><span className="mb-1 block text-black/42">Email</span>{settings.email}</div>
              <div><span className="mb-1 block text-black/42">Address</span>{settings.address}</div>
              <div><span className="mb-1 block text-black/42">Hours</span>{settings.businessHours}</div>
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
      <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_18px_42px_rgba(17,24,39,0.06)]">
        <h1 className="text-display text-5xl text-[#171717]">{page.heroHeading}</h1>
        <RichText html={page.content} className="mt-8 max-w-4xl text-black/68" />
      </div>
    </section>
  );
}
