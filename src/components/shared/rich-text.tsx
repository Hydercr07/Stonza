import { sanitizeHtml } from "@/lib/sanitize";

export function RichText({ html, className = "" }: { html: string | null | undefined; className?: string }) {
  const safeHtml = typeof html === "string" ? html : "";
  const clean = sanitizeHtml(safeHtml);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
