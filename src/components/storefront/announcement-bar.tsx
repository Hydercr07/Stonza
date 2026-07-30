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
    <div className="border-b border-[#15314d] bg-[#10233a] text-[11px] uppercase tracking-[0.24em] text-[#f7ecda]">
      <div className="container-shell flex min-h-10 items-center justify-center py-2 text-center">
        {href ? (
          <Link href={href} className="hover:text-white">
            {text}
            {linkLabel ? <span className="ml-3 text-[#f7ecda]/48">{linkLabel}</span> : null}
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}
