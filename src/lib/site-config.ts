import { env } from "@/lib/env";

export const siteConfig = {
  name: "STONZA",
  tagline: "ORIGINAL STONES",
  description:
    "STONZA is Pakistan's original stones and gemstone jewelry destination — natural gemstones set in sterling silver jewelry and fancy jewellery sets, each piece with verified authenticity and provenance.",
  keywords: [
    "original stones",
    "gemstones",
    "jewelry",
    "fancy jewelry",
    "silver jewelry",
    "jewellery sets",
    "natural gemstones",
    "sterling silver rings",
  ],
  siteUrl: env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  adminUrl: env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000/admin",
  socialImage: "/brand/stonza-logo.png",
};
