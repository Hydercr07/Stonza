import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RichText } from "@/components/shared/rich-text";
import { getManagedPage } from "@/lib/data/store";
import { buildManagedPageMetadata, faqJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getManagedPage("faq");
  return buildManagedPageMetadata(page, "/faq", "FAQs | STONZA");
}

// Mirrors the FAQ page's CMS content (src/app/(storefront)/faq/page.tsx --
// update this if that content changes from the admin portal).
const faqItems = [
  {
    question: "How much does shipping cost, and how long does it take?",
    answer:
      "Shipping is a flat Rs. 200 anywhere in Pakistan, with delivery in 3-5 business days from when your order is confirmed.",
  },
  {
    question: "What's your return policy?",
    answer:
      "Items can be returned within 7 days of delivery, provided they're unworn and undamaged with all original packaging. Contact us on WhatsApp with your order number to start a return.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery (COD) and card payment at checkout.",
  },
  {
    question: "How do you verify a stone is original?",
    answer:
      "Every stone is verified through GGI Verification Center, Pakistan before listing. Certificate details are available on each product page, or on request via WhatsApp.",
  },
  {
    question: "Can I get help choosing a ring size?",
    answer:
      "Yes -- message us on WhatsApp with your ring size (or a measurement of an existing ring's inside diameter) and we'll confirm fit before you order.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You'll receive your order number and courier tracking details once your order ships. You can also check order status directly using your order confirmation link.",
  },
  {
    question: "Do you ship outside Pakistan?",
    answer: "Currently we ship within Pakistan only. Message us on WhatsApp if you're outside Pakistan and want to check availability.",
  },
  {
    question: "How do I contact STONZA directly?",
    answer:
      "WhatsApp is the fastest way to reach us for sizing, gemstone details, or order questions. You can also reach us by email -- see our Contact page for details.",
  },
];

export default async function FaqPage() {
  const page = await getManagedPage("faq");
  if (page?.slug && page.slug !== "faq" && page.slugHistory?.includes("faq")) {
    permanentRedirect(`/${page.slug}`);
  }

  return (
    <section className="container-shell page-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqItems)) }}
      />
      <div className="page-panel">
        <p className="text-xs uppercase tracking-[0.28em] text-black/42">Support</p>
        <h1 className="page-title mt-3 text-[#171717]">{page?.heroHeading ?? "FAQ"}</h1>
        <RichText
          html={page?.content ?? "<p>FAQ content will appear here once it has been published from the admin portal.</p>"}
          className="mt-8 max-w-4xl text-black/68 [&_h3]:text-display [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:text-[#171717] [&_p]:mb-4 [&_a]:text-[#a2845d] [&_a]:underline"
        />
      </div>
    </section>
  );
}
