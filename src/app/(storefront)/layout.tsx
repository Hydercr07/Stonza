import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { getSiteSettings } from "@/lib/data/store";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {settings.announcement.enabled ? (
        <AnnouncementBar text={settings.announcement.text} href={settings.announcement.link} />
      ) : null}
      <Header contactLabel={settings.contactButton.label} contactHref={settings.contactButton.destination} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
