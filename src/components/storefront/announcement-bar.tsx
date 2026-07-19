import Link from "next/link";

export function AnnouncementBar({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  return (
    <div className="border-b border-white/10 bg-black/70 text-[11px] uppercase tracking-[0.28em] text-white/70 backdrop-blur">
      <div className="container-shell flex min-h-10 items-center justify-center py-2 text-center">
        {href ? (
          <Link href={href} className="hover:text-white">
            {text}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
