import { permanentRedirect } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { getManagedPage, getSiteSettings } from "@/lib/data/store";

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getManagedPage("contact"), getSiteSettings()]);
  if (page?.slug && page.slug !== "contact" && page.slugHistory?.includes("contact")) {
    permanentRedirect(`/${page.slug}`);
  }
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`
    : settings.contactButton.destination;

  return (
    <section className="container-shell page-section">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Contact</p>
          <h1 className="page-title text-[#171717]">{page?.heroHeading ?? "Contact STONZA"}</h1>
          <p className="max-w-xl text-sm leading-8 text-black/62">
            {page?.content?.replace(/<[^>]+>/g, "") ?? "Speak with STONZA for sourcing requests, certifications, and private appointments."}
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
