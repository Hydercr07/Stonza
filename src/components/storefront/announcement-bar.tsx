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
    <div className="border-b border-[#e7ddd0] bg-[#f7f2ea] text-[11px] uppercase tracking-[0.24em] text-black/55">
      <div className="container-shell flex min-h-10 items-center justify-center py-2 text-center">
        {href ? (
          <Link href={href} className="hover:text-black">
            {text}
            {linkLabel ? <span className="ml-3 text-black/35">{linkLabel}</span> : null}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
