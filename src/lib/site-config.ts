import { env } from "@/lib/env";

export const siteConfig = {
  name: "STONZA",
  tagline: "ORIGINAL STONES",
  description:
    "STONZA curates original natural stones with an editorial luxury experience, geological storytelling, and authenticity-led commerce.",
  siteUrl: env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  adminUrl: env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000/admin",
  socialImage: "/brand/stonza-logo.png",
};
