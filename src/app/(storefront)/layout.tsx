import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { CartProvider } from "@/components/storefront/cart-store";
import { WishlistProvider } from "@/components/storefront/wishlist-store";
import { getSiteSettings, listCategories, listProducts } from "@/lib/data/store";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    listCategories(),
    listProducts(),
  ]);

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          {settings.announcement.enabled ? (
            <AnnouncementBar
              text={settings.announcement.text}
              href={settings.announcement.link}
              linkLabel={settings.announcement.linkLabel}
            />
          ) : null}
          <Header settings={settings} categories={categories} products={products} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
