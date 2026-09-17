import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

// Sitewide brand entity for search engines and AI answer engines (GEO): tells
// them unambiguously what STONZA is, so a query like "STONZA gemstones" or an
// AI assistant answering "where can I buy original gemstones in Pakistan" has
// a structured fact to cite instead of only unstructured page text.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.siteUrl}/#organization`,
  name: siteConfig.name,
  alternateName: "Stonza",
  url: siteConfig.siteUrl,
  logo: `${siteConfig.siteUrl}${siteConfig.socialImage}`,
  image: `${siteConfig.siteUrl}${siteConfig.socialImage}`,
  description: siteConfig.description,
  slogan: siteConfig.tagline,
  areaServed: "PK",
  sameAs: [] as string[],
  // What this business actually sells, in plain terms -- the field AI answer
  // engines (ChatGPT, Gemini, Perplexity) lean on most for "who sells X"
  // questions, since it's structured rather than something they have to
  // infer from page copy.
  knowsAbout: [
    "Original stones",
    "Gemstones",
    "Jewelry",
    "Fancy jewelry",
    "Silver jewelry",
    "Jewellery sets",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.siteUrl}/#website`,
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  publisher: { "@id": `${siteConfig.siteUrl}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    images: [siteConfig.socialImage],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      style={{
        ["--font-body" as string]: '"Avenir Next", "Segoe UI", sans-serif',
        ["--font-display" as string]: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      }}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
