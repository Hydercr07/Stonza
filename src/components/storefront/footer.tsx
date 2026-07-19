import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0e0e] py-12">
      <div className="container-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-md text-sm leading-7 text-white/62">
            Natural stones selected for provenance, atmosphere and enduring presence. STONZA pairs editorial curation with transparent authenticity.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">Explore</p>
          <div className="grid gap-3 text-sm text-white/74">
            <Link href="/shop">Shop</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">Policies</p>
          <div className="grid gap-3 text-sm text-white/74">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
            <Link href="/shipping-and-returns">Shipping & Returns</Link>
            <Link href="/admin/login">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
