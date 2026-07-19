import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { RichText } from "@/components/shared/rich-text";
import { getProductBySlug, listProducts } from "@/lib/data/store";
import { formatMoney } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await listProducts()).filter((item) => product.relatedProductSlugs.includes(item.slug));
  const unavailable = ["sold", "out_of_stock", "archived", "trash"].includes(product.status) || product.inventoryQuantity <= 0;

  return (
    <section className="container-shell py-14">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#141515]">
            <Image src={product.featuredImage} alt={product.altText} fill className="object-cover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.galleryImages.map((image) => (
              <div key={image} className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#141515]">
                <Image src={image} alt={product.altText} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">{product.stoneType}</p>
          <h1 className="text-display text-5xl text-white">{product.name}</h1>
          <div className="flex items-center gap-4 text-lg">
            <span className="text-white">{formatMoney(product.salePrice ?? product.price, product.currency)}</span>
            {product.salePrice ? <span className="text-white/35 line-through">{formatMoney(product.price, product.currency)}</span> : null}
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/45">{unavailable ? "Unavailable" : "Available now"}</p>
          <p className="text-base leading-8 text-white/65">{product.shortDescription}</p>
          <div className="grid grid-cols-2 gap-4 rounded-[1.5rem] border border-white/10 p-6 text-sm text-white/70">
            <div><span className="block text-white/40">Origin</span>{product.origin}</div>
            <div><span className="block text-white/40">Cut</span>{product.cut}</div>
            <div><span className="block text-white/40">Dimensions</span>{product.dimensions}</div>
            <div><span className="block text-white/40">Treatment</span>{product.treatmentDetails}</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={unavailable || !product.allowCartPurchase}>Add to cart</Button>
            <Button variant="outline">WhatsApp enquiry</Button>
          </div>
          <RichText html={product.description} className="prose prose-invert max-w-none text-white/70" />
        </div>
      </div>
      {related.length ? (
        <div className="mt-16">
          <h2 className="text-display mb-6 text-4xl text-white">Related stones</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <a key={item.id} href={`/stones/${item.slug}`} className="rounded-[1.5rem] border border-white/10 p-5">
                <p className="text-display text-2xl text-white">{item.name}</p>
                <p className="mt-2 text-sm text-white/60">{item.shortDescription}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
