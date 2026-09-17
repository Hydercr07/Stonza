import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7e70]">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#171717] md:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f6558]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("rounded-[1.75rem] border border-[#e7dfd1] bg-white p-6 shadow-sm", className)}>{children}</div>;
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tone === "neutral" && "bg-[#f3ede4] text-[#7c6b57]",
        tone === "success" && "bg-[#e8f5ee] text-[#34694d]",
        tone === "warning" && "bg-[#fff1dc] text-[#8a5a14]",
        tone === "danger" && "bg-[#fdecea] text-[#8a3b35]",
        tone === "dark" && "bg-[#171717] text-white",
      )}
    >
      {children}
    </span>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <AdminCard className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7e70]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#171717]">{value}</p>
      {detail ? <p className="mt-2 text-sm text-[#6f6558]">{detail}</p> : null}
    </AdminCard>
  );
}
