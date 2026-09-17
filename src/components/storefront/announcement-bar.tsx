import Link from "next/link";

export function AnnouncementBar({
  text,
  href,
  linkLabel,
}: {
  text: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="border-b border-black/60 bg-[#151515] text-[10px] font-medium uppercase tracking-[0.26em] text-white">
      <div className="container-shell flex min-h-9 items-center justify-center py-2 text-center">
        {href ? (
          <Link href={href} className="hover:text-[#ffd15e]">
            {text}
            {linkLabel ? <span className="ml-3 text-white/48">{linkLabel}</span> : null}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
